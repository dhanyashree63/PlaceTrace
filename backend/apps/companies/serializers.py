from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    open_jobs_count = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    selections_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "industry",
            "website",
            "careers_url",
            "headquarters",
            "description",
            "logo_color",
            "status",
            "open_jobs_count",
            "applications_count",
            "selections_count",
            "created_at",
        ]

    def get_open_jobs_count(self, obj):
        return obj.jobs.filter(status="PUBLISHED").count()

    def get_applications_count(self, obj):
        from apps.applications.models import Application
        return Application.objects.filter(job__company=obj).count()

    def get_selections_count(self, obj):
        from apps.applications.models import Application
        return Application.objects.filter(job__company=obj, stage="SELECTED").count()
