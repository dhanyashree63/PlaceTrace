import re
from typing import Dict
from extractors.skill_extractor import extract_skills_from_text

ACTION_VERBS = [
    "developed", "built", "designed", "implemented", "engineered", "optimized",
    "architected", "deployed", "automated", "reduced", "improved", "scaled",
    "integrated", "created", "led", "analyzed", "tested",
]


def parse_and_score_resume(raw_text: str, student_cgpa: float = 8.0) -> Dict[str, object]:
    clean_text = (raw_text or "").strip()
    lowered = clean_text.lower()

    extracted_skills = extract_skills_from_text(clean_text)
    skill_names = [s["name"] for s in extracted_skills]

    # Section detection
    has_education = bool(re.search(r"\b(education|b\.e|b\.tech|cgpa|university|institute|college)\b", lowered))
    has_projects = bool(re.search(r"\b(projects?|portfolio|github|deployed|application|platform)\b", lowered))
    has_experience = bool(re.search(r"\b(experience|internship|intern|work|developer|engineer|contributor)\b", lowered))
    has_achievements = bool(re.search(r"\b(achievements?|awards?|hackathon|leetcode|certifications?|rank)\b", lowered))

    # Action verb & measurable impact analysis
    verb_hits = sum(1 for v in ACTION_VERBS if re.search(rf"\b{v}\b", lowered))
    metric_matches = re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|ms|x|k|\+|users|requests|seconds|hours)\b", lowered)

    # Deterministic section scoring (0 - 100 each)
    skills_score = min(100, round((len(skill_names) / 8.0) * 100))
    projects_score = min(100, (55 if has_projects else 20) + min(45, verb_hits * 8))
    experience_score = min(100, (65 if has_experience else 35) + (20 if has_achievements else 0) + min(15, len(metric_matches) * 5))
    impact_score = min(100, 40 + min(35, len(metric_matches) * 12) + min(25, verb_hits * 5))
    education_score = min(100, (70 if has_education else 40) + (30 if student_cgpa >= 7.5 else 15))

    overall_score = round(
        0.30 * skills_score
        + 0.25 * projects_score
        + 0.20 * impact_score
        + 0.15 * experience_score
        + 0.10 * education_score
    )
    overall_score = max(15, min(98, overall_score))

    strengths = []
    improvement_areas = []

    if "Java" in skill_names or "Python" in skill_names:
        primary_langs = [s for s in skill_names if s in ("Java", "Python", "C++", "JavaScript", "TypeScript")]
        strengths.append(f"Strong {', '.join(primary_langs[:2])} programming foundation")
    if len(skill_names) >= 5:
        strengths.append(f"Well-rounded technical stack ({len(skill_names)} verified skills extracted)")
    if has_projects:
        strengths.append("Good full-stack & practical project experience")
    if student_cgpa >= 8.0:
        strengths.append(f"Strong academic profile (CGPA {student_cgpa})")

    if len(metric_matches) < 2:
        improvement_areas.append("Add measurable project impact (e.g., latency reduced by 30%, 500+ active users)")
    if "System Design" not in skill_names:
        improvement_areas.append("Improve system-design & scalable architecture keywords")
    if "Docker" not in skill_names and "AWS" not in skill_names:
        improvement_areas.append("Include DevOps/Cloud deployment skills (Docker, CI/CD, or AWS)")
    if not has_achievements:
        improvement_areas.append("Add coding profile milestones or hackathon achievements")

    if not strengths:
        strengths.append("Clear foundational academic structure")
    if not improvement_areas:
        improvement_areas.append("Tailor project bullet points to target role keywords")

    return {
        "resume_score": overall_score,
        "extracted_skills": extracted_skills,
        "strengths": strengths[:4],
        "improvement_areas": improvement_areas[:4],
        "section_scores": {
            "skills": skills_score,
            "projects": projects_score,
            "impact": impact_score,
            "experience": experience_score,
            "education": education_score,
        },
    }
