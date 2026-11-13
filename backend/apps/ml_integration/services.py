import re
import httpx
from django.conf import settings

LOCAL_SKILL_TAXONOMY = [
    ("Java", "PROGRAMMING", [r"\bjava\b", r"\bcore java\b"]),
    ("Python", "PROGRAMMING", [r"\bpython\b"]),
    ("C++", "PROGRAMMING", [r"\bc\+\+\b", r"\bcpp\b"]),
    ("JavaScript", "PROGRAMMING", [r"\bjavascript\b", r"\bjs\b"]),
    ("TypeScript", "PROGRAMMING", [r"\btypescript\b", r"\bts\b"]),
    ("DSA", "CORE_CS", [r"\bdsa\b", r"\bdata structures\b", r"\balgorithms\b"]),
    ("Problem Solving", "CORE_CS", [r"\bproblem solving\b", r"\bleetcode\b"]),
    ("System Design", "CORE_CS", [r"\bsystem design\b", r"\bmicroservices\b", r"\bdistributed\b"]),
    ("Operating Systems", "CORE_CS", [r"\boperating systems\b", r"\bconcurrency\b"]),
    ("DBMS", "CORE_CS", [r"\bdbms\b", r"\bacid\b", r"\bnormalization\b"]),
    ("Computer Networks", "CORE_CS", [r"\bcomputer networks\b", r"\btcp/ip\b"]),
    ("React", "FRONTEND", [r"\breact\b", r"\breact\.js\b"]),
    ("HTML", "FRONTEND", [r"\bhtml\b", r"\bhtml5\b"]),
    ("CSS", "FRONTEND", [r"\bcss\b", r"\bcss3\b"]),
    ("Django", "BACKEND", [r"\bdjango\b", r"\bdrf\b"]),
    ("FastAPI", "BACKEND", [r"\bfastapi\b"]),
    ("Spring Boot", "BACKEND", [r"\bspring boot\b", r"\bspring\b"]),
    ("Node.js", "BACKEND", [r"\bnode\.js\b", r"\bexpress\b"]),
    ("SQL", "DATABASE", [r"\bsql\b", r"\bmysql\b"]),
    ("PostgreSQL", "DATABASE", [r"\bpostgresql\b", r"\bpostgres\b"]),
    ("MongoDB", "DATABASE", [r"\bmongodb\b"]),
    ("Git", "TOOLS", [r"\bgit\b", r"\bgithub\b"]),
    ("Docker", "DEVOPS", [r"\bdocker\b", r"\bcontainer\b"]),
    ("AWS", "DEVOPS", [r"\baws\b", r"\bcloud\b"]),
    ("Linux", "DEVOPS", [r"\blinux\b", r"\bbash\b"]),
    ("Machine Learning", "DATA_SCIENCE", [r"\bmachine learning\b", r"\bscikit-learn\b"]),
    ("Data Analysis", "DATA_SCIENCE", [r"\bpandas\b", r"\bnumpy\b", r"\bdata analysis\b"]),
]


def _local_extract_skills(text):
    lowered = (text or "").lower()
    found = []
    for name, cat, patterns in LOCAL_SKILL_TAXONOMY:
        hits = sum(len(re.findall(p, lowered, flags=re.IGNORECASE)) for p in patterns)
        if hits > 0:
            found.append(
                {
                    "name": name,
                    "category": cat,
                    "mentions": hits,
                    "confidence": min(0.99, round(0.84 + min(hits, 3) * 0.04, 2)),
                }
            )
    return found


def analyze_resume_text_via_ml(raw_text: str, student_cgpa: float = 8.5):
    try:
        resp = httpx.post(
            f"{settings.ML_SERVICE_URL.rstrip('/')}/api/v1/parse-resume",
            json={"raw_text": raw_text, "student_cgpa": student_cgpa},
            headers={"X-ML-API-Key": settings.ML_API_KEY},
            timeout=4.0,
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass

    # Deterministic fallback engine
    skills = _local_extract_skills(raw_text)
    skill_names = [s["name"] for s in skills]
    lowered = (raw_text or "").lower()
    metrics = re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|ms|x|k|\+|users)\b", lowered)
    has_proj = "project" in lowered or "built" in lowered or "developed" in lowered

    skills_score = min(100, round((len(skill_names) / 7.0) * 100))
    proj_score = 84 if has_proj else 55
    impact_score = min(100, 62 + len(metrics) * 10)
    exp_score = 80 if "intern" in lowered or "experience" in lowered else 68
    edu_score = 92 if student_cgpa >= 8.0 else 78

    overall = round(
        0.30 * skills_score
        + 0.25 * proj_score
        + 0.20 * impact_score
        + 0.15 * exp_score
        + 0.10 * edu_score
    )
    overall = max(45, min(96, overall))

    strengths = []
    if "Java" in skill_names:
        strengths.append("Strong Java knowledge")
    if has_proj:
        strengths.append("Good project experience")
    if len(skill_names) >= 4:
        strengths.append(f"Solid full-stack skill coverage ({', '.join(skill_names[:4])})")
    if not strengths:
        strengths.append("Clear academic & technical layout")

    improvements = []
    if len(metrics) < 2:
        improvements.append("Add measurable project impact")
    if "System Design" not in skill_names:
        improvements.append("Improve system-design section")
    if "Docker" not in skill_names and "AWS" not in skill_names:
        improvements.append("Highlight cloud deployment & containerization tools (Docker, AWS)")

    return {
        "resume_score": overall,
        "extracted_skills": skills,
        "strengths": strengths[:4],
        "improvement_areas": improvements[:4],
        "section_scores": {
            "skills": skills_score,
            "projects": proj_score,
            "impact": impact_score,
            "experience": exp_score,
            "education": edu_score,
        },
    }


def parse_jd_via_ml(jd_text: str, title: str = ""):
    try:
        resp = httpx.post(
            f"{settings.ML_SERVICE_URL.rstrip('/')}/api/v1/parse-jd",
            json={"jd_text": jd_text, "title": title},
            headers={"X-ML-API-Key": settings.ML_API_KEY},
            timeout=4.0,
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass

    skills = _local_extract_skills(f"{title}\n{jd_text}")
    req = [s["name"] for s in skills[:5]]
    pref = [s["name"] for s in skills[5:]]
    return {
        "extracted_skills": skills,
        "required_skills": req,
        "preferred_skills": pref,
        "detected_min_cgpa": 7.0,
    }


def compute_skill_gap_via_ml(student_skills, required_skills, preferred_skills=None, resume_text="", job_description=""):
    preferred_skills = preferred_skills or []
    try:
        resp = httpx.post(
            f"{settings.ML_SERVICE_URL.rstrip('/')}/api/v1/skill-gap",
            json={
                "student_skills": student_skills,
                "required_skills": required_skills,
                "preferred_skills": preferred_skills,
                "resume_text": resume_text,
                "job_description": job_description,
            },
            headers={"X-ML-API-Key": settings.ML_API_KEY},
            timeout=4.0,
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass

    s_map = {s.lower(): s for s in student_skills}
    you_have = []
    you_need = []
    high_priority = []
    total_w = 0.0
    matched_w = 0.0

    for r in required_skills:
        total_w += 1.0
        if r.lower() in s_map:
            matched_w += 1.0
            you_have.append(r)
        else:
            you_need.append(r)
            high_priority.append(r)

    for p in preferred_skills:
        if p.lower() in {x.lower() for x in required_skills}:
            continue
        total_w += 0.5
        if p.lower() in s_map:
            matched_w += 0.5
            you_have.append(p)
        else:
            you_need.append(p)

    pct = round((matched_w / max(total_w, 0.1)) * 100) if total_w > 0 else 85
    action_plan = [
        f"Master {sk} through hands-on practice and add it to your project portfolio."
        for sk in high_priority[:3]
    ]
    return {
        "match_percentage": max(0, min(100, pct)),
        "required_skills": required_skills,
        "your_skills": student_skills,
        "you_have": you_have,
        "you_need": you_need,
        "high_priority": high_priority,
        "action_plan": action_plan,
    }
