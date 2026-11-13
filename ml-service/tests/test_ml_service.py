from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ml_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_resume_parsing_and_scoring():
    sample_resume = (
        "Dhanyashree N\n"
        "B.E Computer Science, CGPA: 9.35\n"
        "Skills: Java, Python, React, Django, SQL, PostgreSQL, Docker, Git\n"
        "Projects: Built PlaceTrace platform improving student readiness by 40% for 500+ users."
    )
    resp = client.post(
        "/api/v1/parse-resume",
        json={"raw_text": sample_resume, "student_cgpa": 9.35},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["resume_score"] >= 70
    skill_names = [s["name"] for s in data["extracted_skills"]]
    assert "Java" in skill_names
    assert "React" in skill_names
    assert "Django" in skill_names


def test_jd_parsing():
    jd_text = (
        "Looking for a Software Development Engineer proficient in Java, DSA, System Design, "
        "SQL, and Docker. Minimum CGPA: 7.5 required."
    )
    resp = client.post(
        "/api/v1/parse-jd",
        json={"jd_text": jd_text, "title": "Software Development Engineer"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "Java" in data["required_skills"]
    assert data["detected_min_cgpa"] == 7.5


def test_skill_extraction():
    resp = client.post(
        "/api/v1/extract-skills",
        json={"text": "Experienced with Python, FastAPI, PostgreSQL, Machine Learning, and AWS."},
    )
    assert resp.status_code == 200
    names = [s["name"] for s in resp.json()["skills"]]
    assert "Python" in names
    assert "FastAPI" in names
    assert "AWS" in names


def test_skill_matching_and_gap_analysis():
    resp = client.post(
        "/api/v1/skill-gap",
        json={
            "student_skills": ["Java", "SQL", "React", "Git"],
            "required_skills": ["Java", "SQL", "React", "Git", "Docker", "System Design"],
            "preferred_skills": ["AWS"],
            "resume_text": "Built Java and React web applications with SQL.",
            "job_description": "Engineer scalable services in Java, React, SQL, Docker, and System Design.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 50 <= data["match_percentage"] <= 90
    assert "Java" in data["you_have"]
    assert "Docker" in data["you_need"]
    assert "System Design" in data["high_priority"]
