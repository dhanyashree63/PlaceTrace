from django.urls import path
from .views import SkillCatalogListCreateView

urlpatterns = [
    path("", SkillCatalogListCreateView.as_view(), name="skill-catalog"),
]
