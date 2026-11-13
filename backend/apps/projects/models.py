from django.db import models
from apps.students.models import StudentProfile


class Project(models.Model):
    class Status(models.TextChoices):
        COMPLETED = "COMPLETED", "Completed"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        PLANNED = "PLANNED", "Planned"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    technologies = models.JSONField(default=list, blank=True)
    github_url = models.URLField(blank=True, default="")
    live_url = models.URLField(blank=True, default="")
    role = models.CharField(max_length=100, default="Full Stack Developer")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.usn} - {self.title}"
