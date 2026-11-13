from rest_framework import serializers
from .models import Placement


class PlacementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_usn = serializers.CharField(source="student.usn", read_only=True)
    student_branch = serializers.CharField(source="student.branch", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Placement
        fields = [
            "id",
            "student",
            "student_name",
            "student_usn",
            "student_branch",
            "company",
            "company_name",
            "job",
            "role_offered",
            "package_lpa",
            "status",
            "placed_at",
            "created_at",
        ]
