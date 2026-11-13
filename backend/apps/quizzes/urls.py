from django.urls import path
from .views import (
    MockTestDashboardView,
    QuizDetailView,
    QuizListView,
    QuizSubmitView,
)

urlpatterns = [
    path("", QuizListView.as_view(), name="quiz-list"),
    path("dashboard/", MockTestDashboardView.as_view(), name="quiz-dashboard"),
    path("<int:pk>/", QuizDetailView.as_view(), name="quiz-detail"),
    path("<int:pk>/submit/", QuizSubmitView.as_view(), name="quiz-submit"),
]
