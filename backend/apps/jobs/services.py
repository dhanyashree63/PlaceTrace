"""
Eligibility Checking, Skill Matching, and Job Recommendation Engine.
"""


def evaluate_student_eligibility(profile, job):
    allowed_degrees = job.allowed_degrees or ["B.E / B.Tech"]
    allowed_branches = [b.upper() for b in (job.allowed_branches or ["CSE", "ISE", "ECE", "AIML"])]

    degree_ok = True
    branch_ok = not allowed_branches or profile.branch.upper() in allowed_branches
    cgpa_ok = float(profile.cgpa) >= float(job.min_cgpa)
    backlogs_ok = int(profile.active_backlogs) <= int(job.max_active_backlogs)
    grad_year_ok = not job.graduation_year or int(profile.graduation_year) == int(job.graduation_year)

    checks = [
        {
            "key": "degree",
            "label": ", ".join(allowed_degrees),
            "passed": degree_ok,
            "student_value": "B.E / B.Tech",
        },
        {
            "key": "branch",
            "label": " / ".join(allowed_branches),
            "passed": branch_ok,
            "student_value": profile.branch,
        },
        {
            "key": "cgpa",
            "label": f"CGPA: {job.min_cgpa}+",
            "passed": cgpa_ok,
            "student_value": f"CGPA: {profile.cgpa}",
        },
        {
            "key": "backlogs",
            "label": "No active backlogs" if job.max_active_backlogs == 0 else f"Max {job.max_active_backlogs} backlog(s)",
            "passed": backlogs_ok,
            "student_value": f"{profile.active_backlogs} active backlogs",
        },
        {
            "key": "graduation_year",
            "label": f"Batch of {job.graduation_year}",
            "passed": grad_year_ok,
            "student_value": str(profile.graduation_year),
        },
    ]

    is_eligible = all(item["passed"] for item in checks)
    return {
        "is_eligible": is_eligible,
        "status_label": "Eligible" if is_eligible else "Not Eligible",
        "checks": checks,
    }


def evaluate_job_match(profile, job):
    student_skill_names = {
        sk.skill.name.lower(): sk.skill.name
        for sk in profile.student_skills.select_related("skill").all()
    }
    job_skills = list(job.job_skills.select_related("skill").all())

    if not job_skills:
        return {
            "match_percentage": 85,
            "matching_skills": list(student_skill_names.values())[:5],
            "missing_skills": [],
            "high_priority_missing": [],
            "required_skills": [],
            "preferred_skills": [],
        }

    total_weight = 0.0
    matched_weight = 0.0
    matching_skills = []
    missing_skills = []
    high_priority_missing = []
    required_skills = []
    preferred_skills = []

    for js in job_skills:
        s_name = js.skill.name
        s_lower = s_name.lower()
        weight = 1.0 if js.is_mandatory else 0.5
        total_weight += weight

        if js.is_mandatory:
            required_skills.append(s_name)
        else:
            preferred_skills.append(s_name)

        if s_lower in student_skill_names:
            matched_weight += weight
            matching_skills.append(s_name)
        else:
            missing_skills.append(s_name)
            if js.is_mandatory or js.priority == "HIGH":
                high_priority_missing.append(s_name)

    match_pct = round((matched_weight / max(total_weight, 0.1)) * 100)
    match_pct = max(0, min(100, match_pct))

    return {
        "match_percentage": match_pct,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "high_priority_missing": high_priority_missing,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
    }


def build_recommendation_reasons(profile, job, eligibility, match_data):
    reasons = []
    if eligibility["is_eligible"]:
        reasons.append(f"Meets all academic criteria ({profile.branch}, CGPA {profile.cgpa} >= {job.min_cgpa})")
    if match_data["matching_skills"]:
        top_matched = ", ".join(match_data["matching_skills"][:4])
        reasons.append(f"Matches your skills in {top_matched} ({match_data['match_percentage']}% skill match)")
    pref_locs = [loc.lower() for loc in (profile.preferred_locations or [])]
    if job.location.lower() in pref_locs or "bengaluru" in job.location.lower():
        reasons.append(f"Located in preferred tech hub ({job.location})")
    if match_data["high_priority_missing"]:
        reasons.append(f"Upskill in {', '.join(match_data['high_priority_missing'][:2])} to reach 95%+ match")
    return reasons
