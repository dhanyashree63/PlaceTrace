from django.db import models
from apps.companies.models import Company
from apps.jobs.models import Job
from apps.students.models import StudentProfile


class Placement(models.Model):
    class OfferStatus(models.TextChoices):
        OFFERED = "OFFERED", "Offered"
        ACCEPTED = "ACCEPTED", "Accepted"
        DECLINED = "DECLINED", "Declined"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="placements",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="placements",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="placements",
    )
    role_offered = models.CharField(max_length=150)
    package_lpa = models.DecimalField(max_digits=5, decimal_places=2, default=12.00)
    status = models.CharField(
        max_length=20,
        choices=OfferStatus.choices,
        default=OfferStatus.ACCEPTED,
        db_index=True,
    )
    placed_at = models.DateField(auto_now_add=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-placed_at", "-package_lpa"]

    def __str__(self):
        return f"{self.student.usn} placed at {self.company.name} ({self.package_lpa} LPA)"
