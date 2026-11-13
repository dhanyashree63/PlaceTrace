from django.db import models


class Company(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active Partner"
        UPCOMING = "UPCOMING", "Upcoming Drive"
        INACTIVE = "INACTIVE", "Inactive"

    name = models.CharField(max_length=150, unique=True, db_index=True)
    industry = models.CharField(max_length=100, default="Enterprise Software")
    website = models.URLField(blank=True, default="")
    careers_url = models.URLField(blank=True, default="")
    headquarters = models.CharField(max_length=120, default="Bengaluru, India")
    description = models.TextField(blank=True, default="")
    logo_color = models.CharField(max_length=20, default="#6555F5")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name
