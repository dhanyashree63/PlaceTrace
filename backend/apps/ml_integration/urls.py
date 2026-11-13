from django.urls import path
from .views import (
    AnalyzeResumeAPIView,
    ParseJobDescriptionAPIView,
    ResumeJobCompatibilityAPIView,
    SkillGapAnalysisAPIView,
)

urlpatterns = [
    path("analyze-resume/", AnalyzeResumeAPIView.as_view(), name="ml-analyze-resume"),
    path("parse-jd/", ParseJobDescriptionAPIView.as_view(), name="ml-parse-jd"),
    path("skill-gap/", SkillGapAnalysisAPIView.as_view(), name="ml-skill-gap"),
    path("job-compatibility/", ResumeJobCompatibilityAPIView.as_view(), name="ml-job-compatibility"),
]
