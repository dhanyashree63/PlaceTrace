from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "service": "placetrace-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/auth/", include("apps.users.urls")),
    path("api/students/", include("apps.students.urls")),
    path("api/skills/", include("apps.students.skill_urls")),
    path("api/companies/", include("apps.companies.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/applications/", include("apps.applications.urls")),
    path("api/placements/", include("apps.placements.urls")),
    path("api/study/", include("apps.study.urls")),
    path("api/quizzes/", include("apps.quizzes.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/resources/", include("apps.resources.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/ml/", include("apps.ml_integration.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
