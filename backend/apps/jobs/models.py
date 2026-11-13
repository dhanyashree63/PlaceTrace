from django.db import models
from apps.companies.models import Company
from apps.students.models import Skill, StudentProfile
from apps.users.models import User


class Job(models.Model):
    class Category(models.TextChoices):
        SOFTWARE_DEVELOPMENT = "SOFTWARE_DEVELOPMENT", "Software Development"
        DATA_SCIENCE = "DATA_SCIENCE", "Data Science"
        PRODUCT = "PRODUCT", "Product"
        ANALYTICS = "ANALYTICS", "Analytics"
        OTHER = "OTHER", "Other"

    class EmploymentType(models.TextChoices):
        FULL_TIME = "Full Time", "Full Time"
        INTERNSHIP = "Internship", "Internship"
        FULL_TIME_INTERN = "Full Time + Internship", "Full Time + Internship"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CLOSED = "CLOSED", "Closed"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=150, db_index=True)
    category = models.CharField(
        max_length=35,
        choices=Category.choices,
        default=Category.SOFTWARE_DEVELOPMENT,
        db_index=True,
    )
    location = models.CharField(max_length=120, default="Bengaluru", db_index=True)
    employment_type = models.CharField(
        max_length=35,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )
    ctc_lpa = models.DecimalField(max_digits=5, decimal_places=2, default=12.00)
    about_role = models.TextField()
    description = models.TextField()
    responsibilities = models.JSONField(default=list, blank=True)
    syllabus = models.JSONField(default=list, blank=True)
    interview_tips = models.JSONField(default=list, blank=True)
    # Eligibility configuration
    allowed_degrees = models.JSONField(default=list, blank=True)
    allowed_branches = models.JSONField(default=list, blank=True)
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=7.00)
    max_active_backlogs = models.PositiveSmallIntegerField(default=0)
    graduation_year = models.PositiveIntegerField(default=2027)
    deadline = models.DateField()
    apply_link = models.URLField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED,
        db_index=True,
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_jobs",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "category"]),
            models.Index(fields=["location", "status"]),
        ]

    def __str__(self):
        return f"{self.company.name} - {self.title}"


class JobSkill(models.Model):
    class Priority(models.TextChoices):
        HIGH = "HIGH", "High Priority"
        MEDIUM = "MEDIUM", "Medium Priority"
        LOW = "LOW", "Preferred"

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="job_skills",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="job_links",
    )
    is_mandatory = models.BooleanField(default=True)
    priority = models.CharField(
        max_length=15,
        choices=Priority.choices,
        default=Priority.HIGH,
    )

    class Meta:
        unique_together = ("job", "skill")

    def __str__(self):
        req = "Required" if self.is_mandatory else "Preferred"
        return f"{self.job.title} - {self.skill.name} ({req})"


class SavedJob(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="saved_jobs",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="saved_by_students",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "job")
        ordering = ["-created_at"]
