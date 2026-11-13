from rest_framework import serializers
from .models import Skill, StudentProfile, StudentSkill, Resume, ResumeSkill, ActivityLog


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    category = serializers.CharField(source="skill.category", read_only=True)

    class Meta:
        model = StudentSkill
        fields = [
            "id",
            "skill",
            "skill_name",
            "category",
            "proficiency",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["id", "skill_name", "category", "is_verified", "created_at"]


class ResumeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    category = serializers.CharField(source="skill.category", read_only=True)

    class Meta:
        model = ResumeSkill
        fields = ["id", "skill", "skill_name", "category", "confidence"]


class ResumeSerializer(serializers.ModelSerializer):
    extracted_skills = ResumeSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id",
            "file_name",
            "file_size",
            "mime_type",
            "raw_text",
            "status",
            "resume_score",
            "strengths",
            "improvement_areas",
            "section_scores",
            "is_current",
            "uploaded_at",
            "analyzed_at",
            "extracted_skills",
        ]
        read_only_fields = [
            "id",
            "status",
            "resume_score",
            "strengths",
            "improvement_areas",
            "section_scores",
            "uploaded_at",
            "analyzed_at",
            "extracted_skills",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ["id", "activity_type", "title", "metadata", "created_at"]


class StudentProfileListSerializer(serializers.ModelSerializer):
    """Used for TPO student management table with search, filter, sort, pagination."""

    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    skills = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "full_name",
            "email",
            "avatar_url",
            "usn",
            "college_name",
            "branch",
            "cgpa",
            "active_backlogs",
            "graduation_year",
            "placement_status",
            "readiness_score",
            "skills",
            "applications_count",
        ]

    def get_skills(self, obj):
        return [s.skill.name for s in obj.student_skills.select_related("skill").all()[:8]]

    def get_applications_count(self, obj):
        return obj.applications.count()


class StudentProfileDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    student_skills = StudentSkillSerializer(many=True, read_only=True)
    activities = serializers.SerializerMethodField()
    current_resume = serializers.SerializerMethodField()
    kpis = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "full_name",
            "email",
            "avatar_url",
            "usn",
            "college_name",
            "branch",
            "cgpa",
            "active_backlogs",
            "graduation_year",
            "phone",
            "bio",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "preferred_roles",
            "preferred_locations",
            "placement_status",
            "readiness_score",
            "readiness_trend",
            "readiness_breakdown",
            "student_skills",
            "current_resume",
            "activities",
            "kpis",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "readiness_score",
            "readiness_trend",
            "readiness_breakdown",
            "updated_at",
        ]

    def get_activities(self, obj):
        return ActivityLogSerializer(obj.activities.all()[:15], many=True).data

    def get_current_resume(self, obj):
        resume = obj.resumes.filter(is_current=True).first() or obj.resumes.first()
        return ResumeSerializer(resume).data if resume else None

    def get_kpis(self, obj):
        topics_completed = obj.topic_progress.filter(status="COMPLETED").count()
        total_topics = obj.topic_progress.count()
        mock_tests_count = obj.quiz_attempts.filter(is_completed=True).count()
        projects_count = obj.projects.count()
        applications_count = obj.applications.count()
        return {
            "readiness_score": obj.readiness_score,
            "readiness_trend": obj.readiness_trend,
            "topics_completed": topics_completed,
            "total_topics": max(total_topics, 1),
            "mock_tests_count": mock_tests_count,
            "mock_tests_trend": 1 if mock_tests_count > 0 else 0,
            "projects_count": projects_count,
            "applications_count": applications_count,
        }
