from django.db import models


class Resource(models.Model):
    class Category(models.TextChoices):
        JAVA = "Java", "Java"
        DSA = "DSA", "DSA"
        SQL = "SQL", "SQL"
        WEB_DEV = "Web Development", "Web Development"
        PYTHON = "Python", "Python"
        DBMS = "DBMS", "DBMS"
        OS = "Operating Systems", "Operating Systems"
        CN = "Computer Networks", "Computer Networks"
        APTITUDE = "Aptitude", "Aptitude"
        INTERVIEW = "Interview Preparation", "Interview Preparation"

    title = models.CharField(max_length=150)
    description = models.TextField()
    resource_type = models.CharField(max_length=50, default="Guide & Sheet")
    external_link = models.URLField()
    difficulty = models.CharField(max_length=25, default="Intermediate")
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
        default=Category.DSA,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "title"]

    def __str__(self):
        return f"{self.title} ({self.category})"
