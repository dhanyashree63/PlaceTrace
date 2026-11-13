from rest_framework import generics, permissions
from config.permissions import IsTPO
from apps.users.models import log_audit_event
from .models import Company
from .serializers import CompanySerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    queryset = Company.objects.prefetch_related("jobs").all()
    filterset_fields = ["status", "industry"]
    search_fields = ["name", "industry", "headquarters"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        company = serializer.save()
        log_audit_event(
            actor=self.request.user,
            action="COMPANY_CREATED",
            target_model="Company",
            target_id=company.id,
            details={"name": company.name},
            request=self.request,
        )


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    queryset = Company.objects.prefetch_related("jobs").all()

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsTPO()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        company = serializer.save()
        log_audit_event(
            actor=self.request.user,
            action="COMPANY_UPDATED",
            target_model="Company",
            target_id=company.id,
            details={"name": company.name, "status": company.status},
            request=self.request,
        )
