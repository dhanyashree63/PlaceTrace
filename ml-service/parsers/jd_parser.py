import re
from typing import Dict
from extractors.skill_extractor import extract_skills_from_text


def parse_job_description(jd_text: str, title: str = "") -> Dict[str, object]:
    combined = f"{title}\n{jd_text or ''}".strip()
    extracted = extract_skills_from_text(combined)

    required_skills = []
    preferred_skills = []

    for idx, item in enumerate(extracted):
        if idx < 5 or item["mentions"] >= 2:
            required_skills.append(item["name"])
        else:
            preferred_skills.append(item["name"])

    cgpa_match = re.search(r"cgpa\s*[:\-]?\s*(\d+(?:\.\d+)?)", combined.lower())
    min_cgpa = float(cgpa_match.group(1)) if cgpa_match else 7.0

    return {
        "extracted_skills": extracted,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "detected_min_cgpa": min_cgpa,
    }
