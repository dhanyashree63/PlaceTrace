from django.urls import path
from .views import ApplicationListCreateView, ApplicationDetailUpdateView

urlpatterns = [
    path("", ApplicationListCreateView.as_view(), name="application-list"),
    path("<int:pk>/", ApplicationDetailUpdateView.as_view(), name="application-detail"),
]
