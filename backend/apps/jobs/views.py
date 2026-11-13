from django.db.models import Q
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from config.permissions import IsTPO
from apps.students.views import get_or_create_student_profile
from apps.users.models import log_audit_event
from .models import Job, SavedJob
from .serializers import JobSerializer
from .services import evaluate_student_eligibility


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Job.objects.select_related("company").prefetch_related("job_skills__skill", "applications")
        user = self.request.user
        if user.role == "STUDENT":
            qs = qs.filter(status=Job.Status.PUBLISHED)
        else:
            status_param = self.request.query_params.get("status")
            if status_param:
                qs = qs.filter(status=status_param)

        category = self.request.query_params.get("category")
        if category and category != "ALL":
            qs = qs.filter(category=category)

        location = self.request.query_params.get("location")
        if location:
            qs = qs.filter(location__icontains=location)

        employment_type = self.request.query_params.get("employment_type")
        if employment_type:
            qs = qs.filter(employment_type__iexact=employment_type)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(company__name__icontains=search)
                | Q(location__icontains=search)
                | Q(job_skills__skill__name__icontains=search)
            ).distinct()

        saved_only = self.request.query_params.get("saved_only")
        if saved_only == "true" and hasattr(user, "student_profile"):
            qs = qs.filter(saved_by_students__student=user.student_profile)

        eligible_only = self.request.query_params.get("eligible_only")
        if eligible_only == "true" and hasattr(user, "student_profile"):
            profile = user.student_profile
            eligible_ids = [
                j.id for j in qs if evaluate_student_eligibility(profile, j)["is_eligible"]
            ]
            qs = qs.filter(id__in=eligible_ids)

        return qs

    def perform_create(self, serializer):
        job = serializer.save(created_by=self.request.user)
        log_audit_event(
            actor=self.request.user,
            action="JOB_CREATED",
            target_model="Job",
            target_id=job.id,
            details={"title": job.title, "company": job.company.name},
            request=self.request,
        )


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related("company").prefetch_related("job_skills__skill", "applications")

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        job = serializer.save()
        log_audit_event(
            actor=self.request.user,
            action="JOB_UPDATED",
            target_model="Job",
            target_id=job.id,
            details={"title": job.title, "status": job.status},
            request=self.request,
        )


class JobBookmarkToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        profile = get_or_create_student_profile(request.user)
        job = generics.get_object_or_404(Job, pk=pk)
        saved, created = SavedJob.objects.get_or_create(student=profile, job=job)
        if not created:
            saved.delete()
            return Response({"saved": False, "detail": "Removed job from saved list."})
        return Response({"saved": True, "detail": "Job bookmarked."}, status=status.HTTP_201_CREATED)


class RecommendedJobsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        jobs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related("company").prefetch_related("job_skills__skill")
        serialized = JobSerializer(jobs, many=True, context={"request": request}).data
        # Sort by eligibility first, then by match_percentage descending
        sorted_jobs = sorted(
            serialized,
            key=lambda j: (
                1 if j["eligibility"]["is_eligible"] else 0,
                j["match_data"]["match_percentage"],
            ),
            reverse=True,
        )
        return Response(sorted_jobs[:6])
