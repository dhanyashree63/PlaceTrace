import pytest
from datetime import date, timedelta
from rest_framework.test import APIClient
from apps.users.models import User
from apps.students.models import StudentProfile, Skill, StudentSkill
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def core_skills(db):
    skills = {}
    for name, cat in [
        ("Java", Skill.Category.PROGRAMMING),
        ("DSA", Skill.Category.CORE_CS),
        ("SQL", Skill.Category.DATABASE),
        ("React", Skill.Category.FRONTEND),
        ("Docker", Skill.Category.DEVOPS),
        ("System Design", Skill.Category.CORE_CS),
    ]:
        skills[name], _ = Skill.objects.get_or_create(name=name, defaults={"category": cat})
    return skills


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@placetrace.edu",
        full_name="System Admin",
        password="AdminPassword123!",
    )


@pytest.fixture
def tpo_user(db):
    return User.objects.create_user(
        email="tpo@placetrace.edu",
        full_name="Campus TPO",
        password="TpoPassword123!",
        role=User.Role.TPO,
        is_email_verified=True,
    )


@pytest.fixture
def student_user_and_profile(db, core_skills):
    user = User.objects.create_user(
        email="dhanya@placetrace.edu",
        full_name="Dhanyashree N",
        password="StudentPassword123!",
        role=User.Role.STUDENT,
        is_email_verified=True,
    )
    profile = StudentProfile.objects.create(
        user=user,
        usn="1RN23CS042",
        college_name="RNSIT",
        branch="CSE",
        cgpa=9.35,
        active_backlogs=0,
        graduation_year=2027,
    )
    for sk_name in ["Java", "DSA", "SQL", "React"]:
        StudentSkill.objects.create(
            student=profile,
            skill=core_skills[sk_name],
            proficiency=StudentSkill.Proficiency.ADVANCED,
        )
    return user, profile


@pytest.fixture
def oracle_job(db, core_skills, tpo_user):
    company = Company.objects.create(
        name="Oracle",
        industry="Cloud & Databases",
        headquarters="Bengaluru",
    )
    job = Job.objects.create(
        company=company,
        title="Software Development Engineer",
        category=Job.Category.SOFTWARE_DEVELOPMENT,
        location="Bengaluru",
        employment_type=Job.EmploymentType.FULL_TIME,
        ctc_lpa=19.50,
        about_role="OCI Distributed Systems",
        description="Build scalable Java and SQL services on cloud.",
        allowed_degrees=["B.E / B.Tech"],
        allowed_branches=["CSE", "ISE", "ECE"],
        min_cgpa=7.50,
        max_active_backlogs=0,
        graduation_year=2027,
        deadline=date.today() + timedelta(days=15),
        status=Job.Status.PUBLISHED,
        created_by=tpo_user,
    )
    for s_name in ["Java", "DSA", "SQL", "React"]:
        JobSkill.objects.create(job=job, skill=core_skills[s_name], is_mandatory=True)
    JobSkill.objects.create(job=job, skill=core_skills["Docker"], is_mandatory=False)
    return job
