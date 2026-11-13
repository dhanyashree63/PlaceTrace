from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from config.throttling import (
    JDParsingRateThrottle,
    ResumeAnalysisRateThrottle,
    SkillGapRateThrottle,
)
from apps.jobs.models import Job
from apps.jobs.services import evaluate_job_match, evaluate_student_eligibility
from apps.students.views import get_or_create_student_profile
from .services import (
    analyze_resume_text_via_ml,
    compute_skill_gap_via_ml,
    parse_jd_via_ml,
)


class AnalyzeResumeAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ResumeAnalysisRateThrottle]

    def post(self, request):
        profile = get_or_create_student_profile(request.user)
        raw_text = request.data.get("raw_text", "").strip()
        if not raw_text:
            current_resume = profile.resumes.filter(is_current=True).first() or profile.resumes.first()
            if current_resume and current_resume.raw_text:
                raw_text = current_resume.raw_text
            else:
                return Response(
                    {"detail": "Provide resume text or upload a resume first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        result = analyze_resume_text_via_ml(raw_text, student_cgpa=float(profile.cgpa))
        return Response(result)


class ParseJobDescriptionAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [JDParsingRateThrottle]

    def post(self, request):
        jd_text = request.data.get("jd_text", "").strip()
        title = request.data.get("title", "").strip()
        if not jd_text:
            return Response(
                {"detail": "Job description text (jd_text) is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(parse_jd_via_ml(jd_text, title=title))


class SkillGapAnalysisAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SkillGapRateThrottle]

    def get(self, request):
        job_id = request.query_params.get("job_id")
        return self._analyze(request, job_id)

    def post(self, request):
        job_id = request.data.get("job_id")
        return self._analyze(request, job_id)

    def _analyze(self, request, job_id):
        profile = get_or_create_student_profile(request.user)
        if job_id:
            job = generics.get_object_or_404(
                Job.objects.select_related("company").prefetch_related("job_skills__skill"),
                pk=job_id,
            )
        else:
            job = Job.objects.filter(status=Job.Status.PUBLISHED).select_related("company").prefetch_related("job_skills__skill").first()
            if not job:
                return Response(
                    {"detail": "No published jobs available for skill-gap analysis."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        student_skills = [
            s.skill.name for s in profile.student_skills.select_related("skill").all()
        ]
        req_skills = [
            js.skill.name for js in job.job_skills.select_related("skill").all() if js.is_mandatory
        ]
        pref_skills = [
            js.skill.name for js in job.job_skills.select_related("skill").all() if not js.is_mandatory
        ]
        current_resume = profile.resumes.filter(is_current=True).first()
        resume_text = current_resume.raw_text if current_resume else ""

        gap_data = compute_skill_gap_via_ml(
            student_skills=student_skills,
            required_skills=req_skills,
            preferred_skills=pref_skills,
            resume_text=resume_text,
            job_description=job.description,
        )
        eligibility = evaluate_student_eligibility(profile, job)

        return Response(
            {
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "company_name": job.company.name,
                    "location": job.location,
                    "ctc_lpa": job.ctc_lpa,
                },
                "eligibility": eligibility,
                **gap_data,
            }
        )


class ResumeJobCompatibilityAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        jobs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related("company").prefetch_related("job_skills__skill")[:6]
        compatibility = []
        for job in jobs:
            match = evaluate_job_match(profile, job)
            elig = evaluate_student_eligibility(profile, job)
            compatibility.append(
                {
                    "job_id": job.id,
                    "company_name": job.company.name,
                    "job_title": job.title,
                    "location": job.location,
                    "match_percentage": match["match_percentage"],
                    "matching_skills": match["matching_skills"],
                    "missing_skills": match["missing_skills"],
                    "is_eligible": elig["is_eligible"],
                }
            )
        return Response(compatibility)
