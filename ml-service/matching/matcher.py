from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_tfidf_similarity(student_text: str, job_text: str) -> float:
    s_txt = (student_text or "").strip()
    j_txt = (job_text or "").strip()
    if not s_txt or not j_txt:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform([s_txt, j_txt])
        sim = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
        return max(0.0, min(1.0, sim))
    except Exception:
        return 0.0


def match_skills_and_gap(
    student_skills: List[str],
    required_skills: List[str],
    preferred_skills: List[str] = None,
    resume_text: str = "",
    job_description: str = "",
) -> Dict[str, object]:
    preferred_skills = preferred_skills or []
    student_map = {s.strip().lower(): s.strip() for s in student_skills if s.strip()}

    you_have = []
    you_need = []
    high_priority = []

    total_weight = 0.0
    matched_weight = 0.0

    for req in required_skills:
        clean = req.strip()
        if not clean:
            continue
        total_weight += 1.0
        if clean.lower() in student_map:
            matched_weight += 1.0
            you_have.append(clean)
        else:
            you_need.append(clean)
            high_priority.append(clean)

    for pref in preferred_skills:
        clean = pref.strip()
        if not clean or clean.lower() in {r.lower() for r in required_skills}:
            continue
        total_weight += 0.5
        if clean.lower() in student_map:
            matched_weight += 0.5
            you_have.append(clean)
        else:
            you_need.append(clean)

    skill_overlap_ratio = (matched_weight / total_weight) if total_weight > 0 else 0.85

    if resume_text and job_description:
        semantic_sim = compute_tfidf_similarity(
            f"{' '.join(student_skills)} {resume_text}",
            f"{' '.join(required_skills)} {' '.join(preferred_skills)} {job_description}",
        )
        combined_score = round((0.78 * skill_overlap_ratio + 0.22 * min(1.0, semantic_sim * 1.8)) * 100)
    else:
        combined_score = round(skill_overlap_ratio * 100)

    combined_score = max(0, min(100, combined_score))

    action_plan = []
    for sk in high_priority[:3]:
        action_plan.append(
            f"Complete focused practice and build 1 mini-module using {sk} (High Priority Requirement)."
        )
    for sk in [s for s in you_need if s not in high_priority][:2]:
        action_plan.append(f"Review fundamentals of {sk} to boost preferred skill match.")

    return {
        "match_percentage": combined_score,
        "required_skills": required_skills,
        "your_skills": list(student_map.values()),
        "you_have": you_have,
        "you_need": you_need,
        "high_priority": high_priority,
        "action_plan": action_plan,
    }
