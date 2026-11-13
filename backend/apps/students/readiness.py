"""
Deterministic Placement Readiness Calculation Engine.

Formula:
Readiness Score (0 - 100) = round(
    0.12 * profile_completion +
    0.14 * resume_readiness +
    0.18 * technical_skills +
    0.16 * dsa_and_roadmap +
    0.14 * mock_test_performance +
    0.12 * projects_score +
    0.07 * applications_activity +
    0.07 * interview_prep
)
"""

PROFICIENCY_WEIGHTS = {
    "BEGINNER": 0.6,
    "INTERMEDIATE": 0.85,
    "ADVANCED": 1.0,
    "EXPERT": 1.15,
}


def compute_placement_readiness(profile, save=True):
    # 1. Profile Completion (0-100)
    checks = [
        bool(profile.college_name),
        bool(profile.branch),
        float(profile.cgpa or 0) > 0,
        bool(profile.bio and len(profile.bio.strip()) >= 10),
        bool(profile.github_url),
        bool(profile.linkedin_url),
        bool(profile.preferred_roles),
    ]
    profile_completion = round((sum(1 for c in checks if c) / len(checks)) * 100)

    # 2. Resume Readiness (0-100)
    latest_resume = profile.resumes.filter(is_current=True).first() or profile.resumes.first()
    if latest_resume:
        if latest_resume.status == "ANALYZED" and latest_resume.resume_score > 0:
            resume_readiness = min(100, int(latest_resume.resume_score))
        else:
            resume_readiness = 40
    else:
        resume_readiness = 0

    # 3. Technical Skills (0-100) -> 10 weighted skill points = 100%
    student_skills = list(profile.student_skills.all())
    weighted_skill_sum = sum(
        PROFICIENCY_WEIGHTS.get(sk.proficiency, 0.8) for sk in student_skills
    )
    technical_skills = min(100, round((weighted_skill_sum / 10.0) * 100))

    # 4. DSA & Roadmap Progress (0-100)
    progress_records = list(profile.topic_progress.all())
    if progress_records:
        earned = 0.0
        for rec in progress_records:
            if rec.status == "COMPLETED":
                earned += 1.0
            elif rec.status == "IN_PROGRESS":
                earned += 0.4
        dsa_and_roadmap = min(100, round((earned / len(progress_records)) * 100))
    else:
        dsa_and_roadmap = 0

    # 5. Mock Test Performance (0-100)
    attempts = list(profile.quiz_attempts.filter(is_completed=True))
    if attempts:
        avg_pct = sum(a.percentage for a in attempts) / len(attempts)
        volume_factor = min(1.0, len(attempts) / 5.0)
        mock_test_performance = min(100, round(avg_pct * 0.7 + (volume_factor * 100) * 0.3))
    else:
        mock_test_performance = 0

    # 6. Projects Portfolio (0-100)
    projects = list(profile.projects.all())
    if projects:
        proj_points = 0.0
        for p in projects:
            pts = 28.0
            if p.github_url:
                pts += 5.0
            if p.live_url:
                pts += 5.0
            proj_points += pts
        projects_score = min(100, round(proj_points))
    else:
        projects_score = 0

    # 7. Applications Activity (0-100)
    app_count = profile.applications.count()
    applications_activity = min(100, round((min(app_count, 4) / 4.0) * 100))

    # 8. Interview Preparation & Study Planner Tasks (0-100)
    completed_tasks = profile.study_tasks.filter(status="COMPLETED").count()
    total_tasks = profile.study_tasks.count()
    if total_tasks > 0:
        interview_prep = min(100, round((completed_tasks / total_tasks) * 70 + min(30, completed_tasks * 6)))
    else:
        interview_prep = 0

    final_score = round(
        0.12 * profile_completion
        + 0.14 * resume_readiness
        + 0.18 * technical_skills
        + 0.16 * dsa_and_roadmap
        + 0.14 * mock_test_performance
        + 0.12 * projects_score
        + 0.07 * applications_activity
        + 0.07 * interview_prep
    )
    final_score = max(0, min(100, final_score))

    breakdown = {
        "profile_completion": profile_completion,
        "resume_readiness": resume_readiness,
        "technical_skills": technical_skills,
        "dsa_and_roadmap": dsa_and_roadmap,
        "mock_test_performance": mock_test_performance,
        "projects_score": projects_score,
        "applications_activity": applications_activity,
        "interview_prep": interview_prep,
        "weights": {
            "profile_completion": 0.12,
            "resume_readiness": 0.14,
            "technical_skills": 0.18,
            "dsa_and_roadmap": 0.16,
            "mock_test_performance": 0.14,
            "projects_score": 0.12,
            "applications_activity": 0.07,
            "interview_prep": 0.07,
        },
    }

    if save:
        previous = profile.readiness_score
        trend = final_score - previous if previous > 0 else 5
        profile.readiness_score = final_score
        profile.readiness_trend = trend if trend != 0 else profile.readiness_trend
        profile.readiness_breakdown = breakdown
        profile.save(update_fields=["readiness_score", "readiness_trend", "readiness_breakdown"])

    return final_score, breakdown
