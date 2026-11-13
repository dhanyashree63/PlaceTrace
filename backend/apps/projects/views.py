from rest_framework import generics, permissions
from apps.students.models import ActivityLog
from apps.students.readiness import compute_placement_readiness
from apps.students.views import get_or_create_student_profile
from .models import Project
from .serializers import ProjectSerializer


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        profile = get_or_create_student_profile(self.request.user)
        return Project.objects.filter(student=profile)

    def perform_create(self, serializer):
        profile = get_or_create_student_profile(self.request.user)
        project = serializer.save(student=profile)
        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.PROJECT,
            title=f"Added project: {project.title}",
            metadata={"project_id": project.id},
        )
        compute_placement_readiness(profile, save=True)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = get_or_create_student_profile(self.request.user)
        return Project.objects.filter(student=profile)

    def perform_update(self, serializer):
        project = serializer.save()
        ActivityLog.objects.create(
            student=project.student,
            activity_type=ActivityLog.ActivityType.PROJECT,
            title=f"Updated project: {project.title}",
        )
        compute_placement_readiness(project.student, save=True)

    def perform_destroy(self, instance):
        student = instance.student
        title = instance.title
        instance.delete()
        ActivityLog.objects.create(
            student=student,
            activity_type=ActivityLog.ActivityType.PROJECT,
            title=f"Deleted project: {title}",
        )
        compute_placement_readiness(student, save=True)
