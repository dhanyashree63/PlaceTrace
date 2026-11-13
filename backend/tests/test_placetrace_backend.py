import pytest
from rest_framework import status
from apps.users.models import User
from apps.placements.models import Placement


@pytest.mark.django_db
class TestAuthenticationAndRBAC:
    def test_student_registration_creates_profile(self, api_client):
        resp = api_client.post(
            "/api/auth/register/",
            {
                "email": "newstudent@placetrace.edu",
                "full_name": "Aarav Rao",
                "password": "StrongPassword123!",
                "role": "STUDENT",
                "branch": "CSE",
                "cgpa": "8.90",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["user"]["role"] == "STUDENT"
        assert "access" in resp.data["tokens"]

    def test_tpo_registration_requires_valid_invite_code(self, api_client):
        resp = api_client.post(
            "/api/auth/register/",
            {
                "email": "unauthorized_tpo@placetrace.edu",
                "full_name": "Fake TPO",
                "password": "StrongPassword123!",
                "role": "TPO",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_and_rbac_enforcement(self, api_client, student_user_and_profile):
        user, _ = student_user_and_profile
        login_resp = api_client.post(
            "/api/auth/login/",
            {"email": user.email, "password": "StudentPassword123!"},
            format="json",
        )
        assert login_resp.status_code == status.HTTP_200_OK
        token = login_resp.data["tokens"]["access"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        # Student cannot access Admin users list
        admin_resp = api_client.get("/api/auth/admin/users/")
        assert admin_resp.status_code == status.HTTP_403_FORBIDDEN

    def test_last_admin_protection_on_account_deletion(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        resp = api_client.post(
            "/api/auth/delete-account/",
            {"password": "AdminPassword123!"},
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert User.objects.filter(pk=admin_user.pk).exists()


@pytest.mark.django_db
class TestProfilesEligibilityMatchingAndApplications:
    def test_student_profile_and_deterministic_readiness(
        self, api_client, student_user_and_profile
    ):
        user, _ = student_user_and_profile
        api_client.force_authenticate(user=user)
        resp = api_client.get("/api/students/me/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["cgpa"] == "9.35"
        assert resp.data["readiness_score"] > 0
        assert "technical_skills" in resp.data["readiness_breakdown"]

    def test_job_eligibility_and_matching_engine(
        self, api_client, student_user_and_profile, oracle_job
    ):
        user, _ = student_user_and_profile
        api_client.force_authenticate(user=user)
        resp = api_client.get(f"/api/jobs/{oracle_job.id}/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["eligibility"]["is_eligible"] is True
        assert resp.data["match_data"]["match_percentage"] >= 80
        assert "Java" in resp.data["match_data"]["matching_skills"]
        assert "Docker" in resp.data["match_data"]["missing_skills"]

    def test_ineligible_student_blocked_from_applying(
        self, api_client, student_user_and_profile, oracle_job
    ):
        user, profile = student_user_and_profile
        profile.cgpa = 6.20
        profile.save()

        api_client.force_authenticate(user=user)
        resp = api_client.post(
            "/api/applications/",
            {"job": oracle_job.id},
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_application_lifecycle_and_automatic_placement_creation(
        self, api_client, student_user_and_profile, tpo_user, oracle_job
    ):
        student_user, profile = student_user_and_profile
        api_client.force_authenticate(user=student_user)
        apply_resp = api_client.post(
            "/api/applications/",
            {"job": oracle_job.id, "notes": "Excited to apply"},
            format="json",
        )
        assert apply_resp.status_code == status.HTTP_201_CREATED
        app_id = apply_resp.data["id"]
        assert len(apply_resp.data["timeline"]) == 5

        # TPO advances application to SELECTED
        api_client.force_authenticate(user=tpo_user)
        stage_resp = api_client.patch(
            f"/api/applications/{app_id}/",
            {"stage": "SELECTED"},
            format="json",
        )
        assert stage_resp.status_code == status.HTTP_200_OK
        profile.refresh_from_db()
        assert profile.placement_status == "PLACED"
        assert Placement.objects.filter(student=profile, job=oracle_job).exists()

    def test_analytics_and_ml_skill_gap_endpoints(
        self, api_client, student_user_and_profile, oracle_job
    ):
        user, _ = student_user_and_profile
        api_client.force_authenticate(user=user)

        gap_resp = api_client.post(
            "/api/ml/skill-gap/",
            {"job_id": oracle_job.id},
            format="json",
        )
        assert gap_resp.status_code == status.HTTP_200_OK
        assert "you_have" in gap_resp.data
        assert "you_need" in gap_resp.data

        analytics_resp = api_client.get("/api/analytics/")
        assert analytics_resp.status_code == status.HTTP_200_OK
        assert "placement_trend" in analytics_resp.data["charts"]
        assert "branch_wise_placement" in analytics_resp.data["charts"]
