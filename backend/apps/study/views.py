from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from apps.students.models import ActivityLog
from apps.students.readiness import compute_placement_readiness
from apps.students.views import get_or_create_student_profile
from .models import StudentTopicProgress, StudyTask, Topic
from .serializers import StudentTopicProgressSerializer, StudyTaskSerializer


class RoadmapProgressListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student_profile(request.user)
        for topic in Topic.objects.all():
            StudentTopicProgress.objects.get_or_create(student=profile, topic=topic)
        records = profile.topic_progress.select_related("topic").all()
        return Response(StudentTopicProgressSerializer(records, many=True).data)


class RoadmapProgressUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        profile = get_or_create_student_profile(request.user)
        record = generics.get_object_or_404(
            StudentTopicProgress.objects.select_related("topic"),
            pk=pk,
            student=profile,
        )
        new_status = request.data.get("status")
        if new_status not in dict(StudentTopicProgress.Status.choices):
            return Response(
                {"detail": "Invalid status. Choose NOT_STARTED, IN_PROGRESS, or COMPLETED."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record.status = new_status
        record.completed_at = timezone.now() if new_status == "COMPLETED" else None
        record.save()

        ActivityLog.objects.create(
            student=profile,
            activity_type=ActivityLog.ActivityType.TOPIC,
            title=f"{'Completed' if new_status == 'COMPLETED' else 'Updated'} topic: {record.topic.title}",
            metadata={"topic": record.topic.title, "status": new_status},
        )
        compute_placement_readiness(profile, save=True)
        return Response(StudentTopicProgressSerializer(record).data)


class StudyTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        profile = get_or_create_student_profile(self.request.user)
        qs = StudyTask.objects.filter(student=profile)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        profile = get_or_create_student_profile(self.request.user)
        task = serializer.save(student=profile)
        compute_placement_readiness(profile, save=True)
        return task


class StudyTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = get_or_create_student_profile(self.request.user)
        return StudyTask.objects.filter(student=profile)

    def perform_update(self, serializer):
        task = serializer.save()
        compute_placement_readiness(task.student, save=True)

    def perform_destroy(self, instance):
        student = instance.student
        instance.delete()
        compute_placement_readiness(student, save=True)
