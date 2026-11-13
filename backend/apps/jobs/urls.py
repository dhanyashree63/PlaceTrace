from django.urls import path
from .views import (
    JobBookmarkToggleView,
    JobDetailView,
    JobListCreateView,
    RecommendedJobsView,
)

urlpatterns = [
    path("", JobListCreateView.as_view(), name="job-list"),
    path("recommended/", RecommendedJobsView.as_view(), name="job-recommended"),
    path("<int:pk>/", JobDetailView.as_view(), name="job-detail"),
    path("<int:pk>/bookmark/", JobBookmarkToggleView.as_view(), name="job-bookmark"),
]
