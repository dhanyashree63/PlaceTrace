from django.urls import path
from .views import PlacementListCreateView

urlpatterns = [
    path("", PlacementListCreateView.as_view(), name="placement-list"),
]
