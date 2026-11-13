from rest_framework import serializers
from .models import StudentTopicProgress, StudyTask


class StudentTopicProgressSerializer(serializers.ModelSerializer):
    topic_id = serializers.IntegerField(source="topic.id", read_only=True)
    title = serializers.CharField(source="topic.title", read_only=True)
    category = serializers.CharField(source="topic.category", read_only=True)
    description = serializers.CharField(source="topic.description", read_only=True)
    order = serializers.IntegerField(source="topic.order", read_only=True)
    estimated_hours = serializers.IntegerField(source="topic.estimated_hours", read_only=True)
    is_core_roadmap = serializers.BooleanField(source="topic.is_core_roadmap", read_only=True)

    class Meta:
        model = StudentTopicProgress
        fields = [
            "id",
            "topic_id",
            "title",
            "category",
            "description",
            "order",
            "estimated_hours",
            "is_core_roadmap",
            "status",
            "completed_at",
            "updated_at",
        ]


class StudyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyTask
        fields = [
            "id",
            "title",
            "category",
            "scheduled_date",
            "scheduled_time",
            "priority",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
