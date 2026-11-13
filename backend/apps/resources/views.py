from rest_framework import generics, permissions
from config.permissions import IsTPO
from .models import Resource
from .serializers import ResourceSerializer


class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    queryset = Resource.objects.all()
    pagination_class = None
    filterset_fields = ["category", "difficulty", "resource_type"]
    search_fields = ["title", "description", "category"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsTPO()]
        return [permissions.IsAuthenticated()]
