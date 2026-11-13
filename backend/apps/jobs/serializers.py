from django.utils import timezone
from rest_framework import serializers
from apps.students.models import Skill
from .models import Job, JobSkill, SavedJob
from .services import build_recommendation_reasons, evaluate_job_match, evaluate_student_eligibility


class JobSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    category = serializers.CharField(source="skill.category", read_only=True)

    class Meta:
        model = JobSkill
        fields = ["id", "skill", "skill_name", "category", "is_mandatory", "priority"]


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo_color = serializers.CharField(source="company.logo_color", read_only=True)
    company_website = serializers.CharField(source="company.website", read_only=True)
    company_industry = serializers.CharField(source="company.industry", read_only=True)
    company_description = serializers.CharField(source="company.description", read_only=True)
    job_skills = JobSkillSerializer(many=True, read_only=True)
    posted_ago = serializers.SerializerMethodField()
    eligibility = serializers.SerializerMethodField()
    match_data = serializers.SerializerMethodField()
    recommendation_reasons = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    applicants_count = serializers.SerializerMethodField()

    # Write-only helper fields for creating/updating job skills
    required_skill_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    preferred_skill_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Job
        fields = [
            "id",
            "company",
            "company_name",
            "company_logo_color",
            "company_website",
            "company_industry",
            "company_description",
            "title",
            "category",
            "location",
            "employment_type",
            "ctc_lpa",
            "about_role",
            "description",
            "responsibilities",
            "syllabus",
            "interview_tips",
            "allowed_degrees",
            "allowed_branches",
            "min_cgpa",
            "max_active_backlogs",
            "graduation_year",
            "deadline",
            "apply_link",
            "status",
            "job_skills",
            "posted_ago",
            "eligibility",
            "match_data",
            "recommendation_reasons",
            "is_saved",
            "has_applied",
            "applicants_count",
            "required_skill_names",
            "preferred_skill_names",
            "created_at",
        ]

    def _get_student_profile(self):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return getattr(request.user, "student_profile", None)
        return None

    def get_posted_ago(self, obj):
        diff = timezone.now() - obj.created_at
        days = diff.days
        if days <= 0:
            return "Today"
        if days == 1:
            return "1 day ago"
        return f"{days} days ago"

    def get_eligibility(self, obj):
        profile = self._get_student_profile()
        if not profile:
            return {
                "is_eligible": True,
                "status_label": "Eligible",
                "checks": [
                    {"key": "degree", "label": "B.E / B.Tech", "passed": True},
                    {"key": "branch", "label": " / ".join(obj.allowed_branches or ["CSE", "ISE", "ECE"]), "passed": True},
                    {"key": "cgpa", "label": f"CGPA: {obj.min_cgpa}+", "passed": True},
                    {"key": "backlogs", "label": "No active backlogs", "passed": True},
                ],
            }
        return evaluate_student_eligibility(profile, obj)

    def get_match_data(self, obj):
        profile = self._get_student_profile()
        if not profile:
            req = [js.skill.name for js in obj.job_skills.select_related("skill").all() if js.is_mandatory]
            pref = [js.skill.name for js in obj.job_skills.select_related("skill").all() if not js.is_mandatory]
            return {
                "match_percentage": 80,
                "matching_skills": req[:3],
                "missing_skills": pref,
                "high_priority_missing": [],
                "required_skills": req,
                "preferred_skills": pref,
            }
        return evaluate_job_match(profile, obj)

    def get_recommendation_reasons(self, obj):
        profile = self._get_student_profile()
        if not profile:
            return []
        elig = evaluate_student_eligibility(profile, obj)
        match = evaluate_job_match(profile, obj)
        return build_recommendation_reasons(profile, obj, elig, match)

    def get_is_saved(self, obj):
        profile = self._get_student_profile()
        if not profile:
            return False
        return SavedJob.objects.filter(student=profile, job=obj).exists()

    def get_has_applied(self, obj):
        profile = self._get_student_profile()
        if not profile:
            return False
        return obj.applications.filter(student=profile).exists()

    def get_applicants_count(self, obj):
        return obj.applications.count()

    def _sync_skills(self, job, required_names, preferred_names):
        if required_names is None and preferred_names is None:
            return
        job.job_skills.all().delete()
        for name in required_names or []:
            clean = name.strip()
            if clean:
                sk, _ = Skill.objects.get_or_create(name__iexact=clean, defaults={"name": clean})
                JobSkill.objects.get_or_create(
                    job=job,
                    skill=sk,
                    defaults={"is_mandatory": True, "priority": JobSkill.Priority.HIGH},
                )
        for name in preferred_names or []:
            clean = name.strip()
            if clean:
                sk, _ = Skill.objects.get_or_create(name__iexact=clean, defaults={"name": clean})
                JobSkill.objects.get_or_create(
                    job=job,
                    skill=sk,
                    defaults={"is_mandatory": False, "priority": JobSkill.Priority.LOW},
                )

    def create(self, validated_data):
        req_skills = validated_data.pop("required_skill_names", None)
        pref_skills = validated_data.pop("preferred_skill_names", None)
        if not validated_data.get("allowed_degrees"):
            validated_data["allowed_degrees"] = ["B.E / B.Tech"]
        if not validated_data.get("allowed_branches"):
            validated_data["allowed_branches"] = ["CSE", "ISE", "ECE"]
        job = super().create(validated_data)
        self._sync_skills(job, req_skills, pref_skills)
        return job

    def update(self, instance, validated_data):
        req_skills = validated_data.pop("required_skill_names", None)
        pref_skills = validated_data.pop("preferred_skill_names", None)
        job = super().update(instance, validated_data)
        self._sync_skills(job, req_skills, pref_skills)
        return job
