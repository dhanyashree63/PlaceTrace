from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


class Skill(models.Model):
    class Category(models.TextChoices):
        PROGRAMMING = "PROGRAMMING", "Programming Languages"
        FRONTEND = "FRONTEND", "Frontend Development"
        BACKEND = "BACKEND", "Backend Development"
        DATABASE = "DATABASE", "Databases & SQL"
        DEVOPS = "DEVOPS", "DevOps & Cloud"
        CORE_CS = "CORE_CS", "Core CS & DSA"
        DATA_SCIENCE = "DATA_SCIENCE", "Data Science & ML"
        TOOLS = "TOOLS", "Tools & Platforms"

    name = models.CharField(max_length=80, unique=True, db_index=True)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.PROGRAMMING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    class Branch(models.TextChoices):
        CSE = "CSE", "Computer Science & Engineering"
        ISE = "ISE", "Information Science & Engineering"
        ECE = "ECE", "Electronics & Communication Engineering"
        AIML = "AIML", "AI & Machine Learning"
        EEE = "EEE", "Electrical & Electronics Engineering"
        MECH = "MECH", "Mechanical Engineering"
        CIVIL = "CIVIL", "Civil Engineering"

    class PlacementStatus(models.TextChoices):
        UNPLACED = "UNPLACED", "Unplaced"
        INTERNSHIP = "INTERNSHIP", "Internship Secured"
        PLACED = "PLACED", "Placed"
        MULTIPLE_OFFERS = "MULTIPLE_OFFERS", "Multiple Offers"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    usn = models.CharField(max_length=30, unique=True, db_index=True)
    college_name = models.CharField(max_length=150, default="RNSIT")
    branch = models.CharField(
        max_length=20,
        choices=Branch.choices,
        default=Branch.CSE,
        db_index=True,
    )
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=8.50,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        db_index=True,
    )
    active_backlogs = models.PositiveSmallIntegerField(default=0)
    graduation_year = models.PositiveIntegerField(default=2027, db_index=True)
    phone = models.CharField(max_length=20, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    portfolio_url = models.URLField(blank=True, default="")
    preferred_roles = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    placement_status = models.CharField(
        max_length=25,
        choices=PlacementStatus.choices,
        default=PlacementStatus.UNPLACED,
        db_index=True,
    )
    readiness_score = models.PositiveSmallIntegerField(default=0)
    readiness_trend = models.SmallIntegerField(default=5)
    readiness_breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-cgpa", "user__full_name"]
        indexes = [
            models.Index(fields=["branch", "cgpa"]),
            models.Index(fields=["placement_status", "graduation_year"]),
        ]

    def __str__(self):
        return f"{self.user.full_name} ({self.usn})"


class StudentSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"
        EXPERT = "EXPERT", "Expert"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="student_skills",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="student_links",
    )
    proficiency = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        default=Proficiency.INTERMEDIATE,
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "skill")
        ordering = ["skill__name"]

    def __str__(self):
        return f"{self.student.usn} - {self.skill.name} ({self.proficiency})"


class Resume(models.Model):
    class Status(models.TextChoices):
        UPLOADED = "UPLOADED", "Uploaded"
        ANALYZED = "ANALYZED", "Analyzed"
        FAILED = "FAILED", "Failed"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="resumes",
    )
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    mime_type = models.CharField(max_length=120, default="application/pdf")
    raw_text = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
    )
    resume_score = models.PositiveSmallIntegerField(default=0)
    strengths = models.JSONField(default=list, blank=True)
    improvement_areas = models.JSONField(default=list, blank=True)
    section_scores = models.JSONField(default=dict, blank=True)
    is_current = models.BooleanField(default=True, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.student.usn} - {self.file_name} ({self.resume_score}/100)"


class ResumeSkill(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="extracted_skills",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="resume_mentions",
    )
    confidence = models.FloatField(default=0.9)

    class Meta:
        unique_together = ("resume", "skill")

    def __str__(self):
        return f"{self.resume.file_name}: {self.skill.name}"


class ActivityLog(models.Model):
    class ActivityType(models.TextChoices):
        RESUME = "RESUME", "Resume"
        SKILL = "SKILL", "Skill"
        APPLICATION = "APPLICATION", "Job Application"
        TOPIC = "TOPIC", "Roadmap Topic"
        QUIZ = "QUIZ", "Mock Test / Quiz"
        PROJECT = "PROJECT", "Project"
        PROFILE = "PROFILE", "Profile"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="activities",
    )
    activity_type = models.CharField(
        max_length=25,
        choices=ActivityType.choices,
        default=ActivityType.PROFILE,
    )
    title = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.usn}: {self.title}"
