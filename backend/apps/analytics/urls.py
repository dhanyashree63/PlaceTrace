from django.urls import path
from .views import PlatformAnalyticsView, StudentDashboardAnalyticsView

urlpatterns = [
    path("", PlatformAnalyticsView.as_view(), name="platform-analytics"),
    path("student-dashboard/", StudentDashboardAnalyticsView.as_view(), name="student-dashboard-analytics"),
]
