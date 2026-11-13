from django.urls import path
from .views import (
    MyStudentProfileView,
    ResumeUploadAndManageView,
    StudentSkillDetailView,
    StudentSkillManageView,
    TPOStudentDetailUpdateView,
    TPOStudentListView,
)

urlpatterns = [
    path("me/", MyStudentProfileView.as_view(), name="student-me"),
    path("me/skills/", StudentSkillManageView.as_view(), name="student-skills"),
    path("me/skills/<int:pk>/", StudentSkillDetailView.as_view(), name="student-skill-detail"),
    path("me/resume/", ResumeUploadAndManageView.as_view(), name="student-resume"),
    # TPO / Admin student management
    path("", TPOStudentListView.as_view(), name="tpo-student-list"),
    path("<int:pk>/", TPOStudentDetailUpdateView.as_view(), name="tpo-student-detail"),
]
