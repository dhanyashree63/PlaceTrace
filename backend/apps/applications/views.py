from django.db import transaction
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from config.permissions import IsOwnerOrTPOOrAdmin
from apps.jobs.models import Job
from apps.jobs.services import evaluate_job_match, evaluate_student_eligibility
from apps.students.models import ActivityLog
from apps.students.readiness import compute_placement_readiness
from apps.students.views import get_or_create_student_profile
from apps.users.models import Notification, log_audit_event
from .models import Application
from .serializers import ApplicationSerializer, sync_application_timeline


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["stage", "job"]
    search_fields = ["job__title", "job__company__name", "student__user__full_name", "student__usn"]

    def get_queryset(self):
        user = self.request.user
        qs = Application.objects.select_related(
            "student__user", "job__company"
        ).prefetch_related("timeline")
        if user.role in ("TPO", "ADMIN") or user.is_superuser:
            return qs
        profile = get_or_create_student_profile(user)
        return qs.filter(student=profile)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        profile = get_or_create_student_profile(request.user)
        job_id = request.data.get("job")
        job = generics.get_object_or_404(Job, pk=job_id)

        if job.status != Job.Status.PUBLISHED:
            return Response(
                {"detail": "This job opportunity is no longer accepting applications."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Application.objects.filter(student=profile, job=job).exists():
            return Response(
                {"detail": "You have already applied for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        eligibility = evaluate_student_eligibility(profile, job)
        if not eligibility["is_eligible"]:
            failed = [c["label"] for c in eligibility["checks"] if not c["passed"]]
            return Response(
                {"detail": f"Eligibility criteria not met: {', '.join(failed)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        match_info = evaluate_job_match(profile, job)
        notes = request.data.get("notes", "")

        application = Application.objects.create(
            student=profile,
            job=job,
            stage=Application.Stage.APPLIED,
            match_score=match_info["match_percentage"],
            is_eligible_at_apply=True,
            notes=notes,
        )
        sync_application_timeline(application)

        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.APPLICATION,
            title=f"Applied to {job.company.name} ({job.title})",
            metadata={"job_id": job.id, "match_score": match_info["match_percentage"]},
        )
        Notification.objects.create(
            user=request.user,
            title=f"Application Submitted: {job.company.name}",
            message=f"You successfully applied for {job.title} at {job.company.name} with a {match_info['match_percentage']}% skill match.",
            notification_type=Notification.Type.APPLICATION,
            link="/applications",
        )
        log_audit_event(
            actor=request.user,
            action="STUDENT_APPLIED_FOR_JOB",
            target_model="Application",
            target_id=application.id,
            details={"company": job.company.name, "job": job.title, "match_score": match_info["match_percentage"]},
            request=request,
        )
        compute_placement_readiness(profile, save=True)
        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


class ApplicationDetailUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrTPOOrAdmin]

    def get_object(self, request, pk):
        app = generics.get_object_or_404(
            Application.objects.select_related("student__user", "job__company").prefetch_related("timeline"),
            pk=pk,
        )
        self.check_object_permissions(request, app)
        return app

    def get(self, request, pk):
        app = self.get_object(request, pk)
        return Response(ApplicationSerializer(app).data)

    @transaction.atomic
    def patch(self, request, pk):
        app = self.get_object(request, pk)
        if "notes" in request.data:
            app.notes = request.data["notes"]

        new_stage = request.data.get("stage")
        if new_stage and new_stage != app.stage:
            if request.user.role not in ("TPO", "ADMIN") and not request.user.is_superuser:
                return Response(
                    {"detail": "Only TPO or Admin can change application stages."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if new_stage not in dict(Application.Stage.choices):
                return Response(
                    {"detail": "Invalid application stage."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            old_stage = app.stage
            app.stage = new_stage
            app.save()
            sync_application_timeline(app)

            notif_type = Notification.Type.INTERVIEW
            if new_stage == Application.Stage.SELECTED:
                notif_type = Notification.Type.SELECTION
                app.student.placement_status = "PLACED"
                app.student.save(update_fields=["placement_status"])
                from apps.placements.models import Placement
                Placement.objects.update_or_create(
                    student=app.student,
                    job=app.job,
                    defaults={
                        "company": app.job.company,
                        "role_offered": app.job.title,
                        "package_lpa": app.job.ctc_lpa,
                        "status": Placement.OfferStatus.ACCEPTED,
                    },
                )
            elif new_stage == Application.Stage.REJECTED:
                notif_type = Notification.Type.REJECTION

            Notification.objects.create(
                user=app.student.user,
                title=f"Application Update: {app.job.company.name}",
                message=f"Your application for {app.job.title} moved to stage: {app.get_stage_display()}.",
                notification_type=notif_type,
                link="/applications",
            )
            log_audit_event(
                actor=request.user,
                action="TPO_CHANGED_APPLICATION_STAGE",
                target_model="Application",
                target_id=app.id,
                details={
                    "student": app.student.usn,
                    "company": app.job.company.name,
                    "old_stage": old_stage,
                    "new_stage": new_stage,
                },
                request=request,
            )
        else:
            app.save()

        return Response(ApplicationSerializer(app).data)
