from django.db import models
from apps.students.models import StudentProfile


class Topic(models.Model):
    title = models.CharField(max_length=150, unique=True)
    category = models.CharField(max_length=80, default="Core Curriculum")
    description = models.TextField(blank=True, default="")
    order = models.PositiveSmallIntegerField(default=1, db_index=True)
    estimated_hours = models.PositiveSmallIntegerField(default=12)
    is_core_roadmap = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.order}. {self.title}"


class StudentTopicProgress(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "NOT_STARTED", "Not Started"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="topic_progress",
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="student_progress",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_STARTED,
        db_index=True,
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "topic")
        ordering = ["topic__order", "id"]

    def __str__(self):
        return f"{self.student.usn} - {self.topic.title} ({self.status})"


class StudyTask(models.Model):
    class Category(models.TextChoices):
        STUDY = "Study Tasks", "Study Tasks"
        REVISION = "Revision Tasks", "Revision Tasks"
        CODING = "Coding Practice", "Coding Practice"
        MOCK_TEST = "Mock Tests", "Mock Tests"
        INTERVIEW = "Interview Preparation", "Interview Preparation"
        PROJECT = "Project Work", "Project Work"

    class Priority(models.TextChoices):
        HIGH = "HIGH", "High"
        MEDIUM = "MEDIUM", "Medium"
        LOW = "LOW", "Low"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="study_tasks",
    )
    title = models.CharField(max_length=200)
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
        default=Category.CODING,
    )
    scheduled_date = models.DateField(db_index=True)
    scheduled_time = models.CharField(max_length=30, default="7:00 PM")
    priority = models.CharField(
        max_length=15,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_date", "id"]

    def __str__(self):
        return f"{self.student.usn} - {self.title} ({self.scheduled_date})"
