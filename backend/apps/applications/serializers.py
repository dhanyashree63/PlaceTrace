from django.utils import timezone
from rest_framework import serializers
from .models import Application, ApplicationTimeline

STAGE_PIPELINE = [
    ("APPLIED", "Applied", 1),
    ("ASSESSMENT", "Assessment", 2),
    ("TECHNICAL_INTERVIEW", "Technical Interview", 3),
    ("HR_INTERVIEW", "HR Interview", 4),
    ("FINAL_DECISION", "Final Decision", 5),
]

STAGE_INDEX = {
    "APPLIED": 1,
    "ASSESSMENT": 2,
    "TECHNICAL_INTERVIEW": 3,
    "HR_INTERVIEW": 4,
    "SELECTED": 5,
    "REJECTED": 5,
}


def sync_application_timeline(application):
    current_idx = STAGE_INDEX.get(application.stage, 1)
    now = timezone.now()

    for code, label, order in STAGE_PIPELINE:
        display_label = label
        if code == "FINAL_DECISION":
            if application.stage == "SELECTED":
                display_label = "Selected"
            elif application.stage == "REJECTED":
                display_label = "Rejected"

        if order < current_idx:
            state = ApplicationTimeline.State.COMPLETED
            ev_date = now
        elif order == current_idx:
            if application.stage in ("SELECTED", "REJECTED") or order == 1:
                state = ApplicationTimeline.State.COMPLETED
                ev_date = now
            else:
                state = ApplicationTimeline.State.CURRENT
                ev_date = now
        else:
            state = ApplicationTimeline.State.UPCOMING
            ev_date = None

        # If just APPLIED, mark Assessment as CURRENT (Upcoming assessment)
        if application.stage == "APPLIED" and order == 2:
            state = ApplicationTimeline.State.CURRENT

        item, _ = ApplicationTimeline.objects.get_or_create(
            application=application,
            order=order,
            defaults={
                "stage_code": code,
                "stage_name": display_label,
                "state": state,
                "event_date": ev_date,
            },
        )
        item.stage_name = display_label
        item.state = state
        if state == ApplicationTimeline.State.COMPLETED and not item.event_date:
            item.event_date = now
        item.save()


class ApplicationTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationTimeline
        fields = ["id", "stage_name", "stage_code", "state", "order", "event_date", "remarks"]


class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_usn = serializers.CharField(source="student.usn", read_only=True)
    student_branch = serializers.CharField(source="student.branch", read_only=True)
    student_cgpa = serializers.DecimalField(
        source="student.cgpa", max_digits=4, decimal_places=2, read_only=True
    )
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    company_logo_color = serializers.CharField(source="job.company.logo_color", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_location = serializers.CharField(source="job.location", read_only=True)
    job_ctc = serializers.DecimalField(
        source="job.ctc_lpa", max_digits=5, decimal_places=2, read_only=True
    )
    timeline = ApplicationTimelineSerializer(many=True, read_only=True)
    status_label = serializers.CharField(source="get_stage_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "student",
            "student_name",
            "student_usn",
            "student_branch",
            "student_cgpa",
            "job",
            "company_name",
            "company_logo_color",
            "job_title",
            "job_location",
            "job_ctc",
            "stage",
            "status_label",
            "match_score",
            "is_eligible_at_apply",
            "notes",
            "applied_at",
            "updated_at",
            "timeline",
        ]
        read_only_fields = [
            "id",
            "student",
            "match_score",
            "is_eligible_at_apply",
            "applied_at",
            "updated_at",
            "timeline",
        ]
