from django.urls import path
from .views import (
    RoadmapProgressListView,
    RoadmapProgressUpdateView,
    StudyTaskDetailView,
    StudyTaskListCreateView,
)

urlpatterns = [
    path("roadmap/", RoadmapProgressListView.as_view(), name="study-roadmap"),
    path("roadmap/<int:pk>/", RoadmapProgressUpdateView.as_view(), name="study-roadmap-update"),
    path("tasks/", StudyTaskListCreateView.as_view(), name="study-tasks"),
    path("tasks/<int:pk>/", StudyTaskDetailView.as_view(), name="study-task-detail"),
]
