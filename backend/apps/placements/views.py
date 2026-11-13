from rest_framework import generics, permissions
from config.permissions import IsTPO
from apps.students.views import get_or_create_student_profile
from apps.users.models import log_audit_event
from .models import Placement
from .serializers import PlacementSerializer


class PlacementListCreateView(generics.ListCreateAPIView):
    serializer_class = PlacementSerializer
    filterset_fields = ["status", "company", "student__branch"]
    search_fields = ["student__user__full_name", "student__usn", "company__name", "role_offered"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Placement.objects.select_related("student__user", "company", "job")
        if user.role in ("TPO", "ADMIN") or user.is_superuser:
            return qs
        profile = get_or_create_student_profile(user)
        return qs.filter(student=profile)

    def perform_create(self, serializer):
        placement = serializer.save()
        placement.student.placement_status = "PLACED"
        placement.student.save(update_fields=["placement_status"])
        log_audit_event(
            actor=self.request.user,
            action="PLACEMENT_RECORDED",
            target_model="Placement",
            target_id=placement.id,
            details={"student": placement.student.usn, "company": placement.company.name},
            request=self.request,
        )
