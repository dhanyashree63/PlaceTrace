import io
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from config.permissions import IsTPO
from config.throttling import ResumeAnalysisRateThrottle
from apps.users.models import Notification, log_audit_event
from .models import ActivityLog, Resume, ResumeSkill, Skill, StudentProfile, StudentSkill
from .readiness import compute_placement_readiness
from .serializers import (
    ResumeSerializer,
    SkillSerializer,
    StudentProfileDetailSerializer,
    StudentProfileListSerializer,
    StudentSkillSerializer,
)
from .validators import validate_resume_upload


def get_or_create_student_profile(user):
    profile, created = StudentProfile.objects.get_or_create(
        user=user,
        defaults={
            "usn": f"1RN23CS{str(user.id)[:4].upper()}",
            "college_name": "RNSIT",
            "branch": "CSE",
            "cgpa": 8.50,
            "graduation_year": 2027,
        },
    )
    if created:
        from apps.study.models import Topic, StudentTopicProgress
        for topic in Topic.objects.all():
            StudentTopicProgress.objects.get_or_create(student=profile, topic=topic)
    compute_placement_readiness(profile, save=True)
    return profile


class MyStudentProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        return Response(StudentProfileDetailSerializer(profile).data)

    def patch(self, request):
        profile = get_or_create_student_profile(request.user)
        if "full_name" in request.data and request.data["full_name"].strip():
            request.user.full_name = request.data["full_name"].strip()
            request.user.save(update_fields=["full_name"])

        serializer = StudentProfileDetailSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.PROFILE,
            title="Updated student profile details",
        )
        compute_placement_readiness(profile, save=True)
        return Response(StudentProfileDetailSerializer(profile).data)


class StudentSkillManageView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        skills = profile.student_skills.select_related("skill").all()
        return Response(StudentSkillSerializer(skills, many=True).data)

    @transaction.atomic
    def post(self, request):
        profile = get_or_create_student_profile(request.user)
        skill_id = request.data.get("skill_id")
        skill_name = request.data.get("skill_name", "").strip()
        category = request.data.get("category", Skill.Category.PROGRAMMING)
        proficiency = request.data.get("proficiency", StudentSkill.Proficiency.INTERMEDIATE)

        if skill_id:
            skill = generics.get_object_or_404(Skill, pk=skill_id)
        elif skill_name:
            skill, _ = Skill.objects.get_or_create(
                name__iexact=skill_name,
                defaults={"name": skill_name, "category": category},
            )
        else:
            return Response(
                {"detail": "Provide either skill_id or skill_name."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student_skill, created = StudentSkill.objects.update_or_create(
            student=profile,
            skill=skill,
            defaults={"proficiency": proficiency},
        )
        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.SKILL,
            title=f"{'Skill added' if created else 'Updated skill proficiency'}: {skill.name}",
            metadata={"skill": skill.name, "proficiency": proficiency},
        )
        compute_placement_readiness(profile, save=True)
        return Response(
            StudentSkillSerializer(student_skill).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class StudentSkillDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        profile = get_or_create_student_profile(request.user)
        student_skill = generics.get_object_or_404(StudentSkill, pk=pk, student=profile)
        proficiency = request.data.get("proficiency")
        if proficiency in dict(StudentSkill.Proficiency.choices):
            student_skill.proficiency = proficiency
            student_skill.save(update_fields=["proficiency"])
        if "category" in request.data and request.data["category"] in dict(Skill.Category.choices):
            student_skill.skill.category = request.data["category"]
            student_skill.skill.save(update_fields=["category"])
        compute_placement_readiness(profile, save=True)
        return Response(StudentSkillSerializer(student_skill).data)

    def delete(self, request, pk):
        profile = get_or_create_student_profile(request.user)
        student_skill = generics.get_object_or_404(StudentSkill, pk=pk, student=profile)
        skill_name = student_skill.skill.name
        student_skill.delete()
        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.SKILL,
            title=f"Removed skill: {skill_name}",
        )
        compute_placement_readiness(profile, save=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SkillCatalogListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Skill.objects.all()
    pagination_class = None
    filterset_fields = ["category"]
    search_fields = ["name"]


class ResumeUploadAndManageView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ResumeAnalysisRateThrottle]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        resumes = profile.resumes.prefetch_related("extracted_skills__skill").all()
        current = resumes.filter(is_current=True).first() or resumes.first()
        return Response(
            {
                "current_resume": ResumeSerializer(current).data if current else None,
                "history": ResumeSerializer(resumes[:5], many=True).data,
            }
        )

    @transaction.atomic
    def post(self, request):
        profile = get_or_create_student_profile(request.user)
        uploaded_file = request.FILES.get("file")

        if uploaded_file:
            meta = validate_resume_upload(uploaded_file)
            raw_text = request.data.get("raw_text", "")
            if not raw_text:
                if meta["extension"] == ".pdf":
                    try:
                        from pypdf import PdfReader
                        reader = PdfReader(io.BytesIO(uploaded_file.read()))
                        raw_text = "\n".join(page.extract_text() or "" for page in reader.pages)
                    except Exception:
                        raw_text = ""
                else:
                    try:
                        raw_text = uploaded_file.read().decode("utf-8", errors="ignore")
                    except Exception:
                        raw_text = ""
        else:
            file_name = request.data.get("file_name", "Resume.pdf")
            raw_text = request.data.get("raw_text", "").strip()
            file_size = int(request.data.get("file_size", max(len(raw_text.encode("utf-8")), 1024)))
            mime_type = request.data.get("mime_type", "application/pdf")
            meta = validate_resume_upload(
                None,
                file_name=file_name,
                mime_type=mime_type,
                file_size=file_size,
            )

        if not raw_text.strip():
            existing_skills = [s.skill.name for s in profile.student_skills.select_related("skill").all()]
            proj_titles = [p.title for p in profile.projects.all()]
            raw_text = (
                f"{request.user.full_name}\n"
                f"{profile.college_name} - {profile.branch} (CGPA: {profile.cgpa})\n"
                f"Skills: {', '.join(existing_skills or ['Java', 'Python', 'SQL', 'React', 'DSA'])}\n"
                f"Projects: {', '.join(proj_titles or ['Full Stack Web Application'])}\n"
                f"Experience in software engineering, problem solving, REST APIs, and database design."
            )

        profile.resumes.update(is_current=False)
        resume = Resume.objects.create(
            student=profile,
            file_name=meta["file_name"],
            file_size=meta["file_size"],
            mime_type=meta["mime_type"],
            raw_text=raw_text,
            status=Resume.Status.UPLOADED,
            is_current=True,
        )

        # Automatically run ML resume analysis
        from apps.ml_integration.services import analyze_resume_text_via_ml

        analysis = analyze_resume_text_via_ml(raw_text, student_cgpa=float(profile.cgpa))
        resume.resume_score = analysis["resume_score"]
        resume.strengths = analysis["strengths"]
        resume.improvement_areas = analysis["improvement_areas"]
        resume.section_scores = analysis["section_scores"]
        resume.status = Resume.Status.ANALYZED
        resume.analyzed_at = timezone.now()
        resume.save()

        for sk_item in analysis["extracted_skills"]:
            sk_name = sk_item["name"]
            sk_cat = sk_item.get("category", Skill.Category.PROGRAMMING)
            skill_obj, _ = Skill.objects.get_or_create(
                name__iexact=sk_name,
                defaults={"name": sk_name, "category": sk_cat},
            )
            ResumeSkill.objects.update_or_create(
                resume=resume,
                skill=skill_obj,
                defaults={"confidence": sk_item.get("confidence", 0.92)},
            )
            StudentSkill.objects.get_or_create(
                student=profile,
                skill=skill_obj,
                defaults={"proficiency": StudentSkill.Proficiency.INTERMEDIATE, "is_verified": True},
            )

        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.RESUME,
            title=f"Resume updated & analyzed ({resume.resume_score}/100)",
            metadata={"file_name": resume.file_name, "score": resume.resume_score},
        )
        Notification.objects.create(
            user=request.user,
            title="Resume Analysis Complete",
            message=f"Your resume '{resume.file_name}' scored {resume.resume_score}/100 with {len(analysis['extracted_skills'])} skills extracted.",
            notification_type=Notification.Type.RESUME,
            link="/resume",
        )
        compute_placement_readiness(profile, save=True)
        return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


class TPOStudentListView(generics.ListAPIView):
    """TPO/Admin endpoint for student management table with search, filter, sort, pagination."""

    serializer_class = StudentProfileListSerializer
    permission_classes = [IsTPO]
    queryset = StudentProfile.objects.select_related("user").prefetch_related("student_skills__skill", "applications")
    filterset_fields = ["branch", "placement_status", "graduation_year"]
    search_fields = ["user__full_name", "user__email", "usn", "student_skills__skill__name"]
    ordering_fields = ["cgpa", "readiness_score", "user__full_name", "created_at"]


class TPOStudentDetailUpdateView(views.APIView):
    permission_classes = [IsTPO]

    def get(self, request, pk):
        student = generics.get_object_or_404(StudentProfile, pk=pk)
        return Response(StudentProfileDetailSerializer(student).data)

    def patch(self, request, pk):
        student = generics.get_object_or_404(StudentProfile, pk=pk)
        new_status = request.data.get("placement_status")
        if new_status in dict(StudentProfile.PlacementStatus.choices):
            old_status = student.placement_status
            student.placement_status = new_status
            student.save(update_fields=["placement_status"])
            log_audit_event(
                actor=request.user,
                action="TPO_UPDATED_STUDENT_STATUS",
                target_model="StudentProfile",
                target_id=student.id,
                details={"usn": student.usn, "old_status": old_status, "new_status": new_status},
                request=request,
            )
        return Response(StudentProfileDetailSerializer(student).data)
