from django.db import models
from apps.students.models import StudentProfile


class Quiz(models.Model):
    class Category(models.TextChoices):
        JAVA = "Java", "Java"
        DSA = "DSA", "DSA"
        SQL = "SQL", "SQL"
        CN = "Computer Networks", "Computer Networks"
        OS = "Operating Systems", "Operating Systems"
        DBMS = "DBMS", "DBMS"
        APTITUDE = "Aptitude", "Aptitude"
        WEB_DEV = "Web Development", "Web Development"
        PYTHON = "Python", "Python"
        SYSTEM_DESIGN = "System Design", "System Design"

    class QuizType(models.TextChoices):
        MCQ = "MCQ", "MCQ Practice"
        CODING = "CODING", "Coding Practice"
        MOCK_TEST = "MOCK_TEST", "Full Mock Test"

    title = models.CharField(max_length=150)
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
        default=Category.DSA,
        db_index=True,
    )
    quiz_type = models.CharField(
        max_length=20,
        choices=QuizType.choices,
        default=QuizType.MOCK_TEST,
    )
    difficulty = models.CharField(max_length=20, default="Intermediate")
    duration_minutes = models.PositiveSmallIntegerField(default=20)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "title"]

    def __str__(self):
        return f"{self.title} ({self.category})"


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    prompt = models.TextField()
    options = models.JSONField(default=list)
    correct_index = models.PositiveSmallIntegerField(default=0)
    explanation = models.TextField(blank=True, default="")
    order = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Q{self.order}: {self.prompt[:40]}"


class QuizAttempt(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    score = models.PositiveSmallIntegerField(default=0)
    total_questions = models.PositiveSmallIntegerField(default=5)
    percentage = models.PositiveSmallIntegerField(default=0)
    answers_submitted = models.JSONField(default=dict, blank=True)
    is_completed = models.BooleanField(default=True)
    attempted_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.student.usn} - {self.quiz.title} ({self.percentage}%)"
