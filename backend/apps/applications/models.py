from django.db import models
from apps.jobs.models import Job
from apps.students.models import StudentProfile


class Application(models.Model):
    class Stage(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        ASSESSMENT = "ASSESSMENT", "Assessment"
        TECHNICAL_INTERVIEW = "TECHNICAL_INTERVIEW", "Technical Interview"
        HR_INTERVIEW = "HR_INTERVIEW", "HR Interview"
        SELECTED = "SELECTED", "Selected"
        REJECTED = "REJECTED", "Rejected"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    stage = models.CharField(
        max_length=30,
        choices=Stage.choices,
        default=Stage.APPLIED,
        db_index=True,
    )
    match_score = models.PositiveSmallIntegerField(default=0)
    is_eligible_at_apply = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")
    applied_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "job")
        ordering = ["-applied_at"]
        indexes = [
            models.Index(fields=["stage", "-applied_at"]),
        ]

    def __str__(self):
        return f"{self.student.usn} -> {self.job.company.name} ({self.stage})"


class ApplicationTimeline(models.Model):
    class State(models.TextChoices):
        COMPLETED = "COMPLETED", "Completed"
        CURRENT = "CURRENT", "Current"
        UPCOMING = "UPCOMING", "Upcoming"

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="timeline",
    )
    stage_name = models.CharField(max_length=60)
    stage_code = models.CharField(max_length=30)
    state = models.CharField(
        max_length=20,
        choices=State.choices,
        default=State.UPCOMING,
    )
    order = models.PositiveSmallIntegerField(default=1)
    event_date = models.DateTimeField(null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.application_id}: {self.stage_name} ({self.state})"
