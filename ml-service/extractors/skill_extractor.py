import re
from typing import Dict, List

SKILL_TAXONOMY: List[Dict[str, object]] = [
    {"name": "Java", "category": "PROGRAMMING", "aliases": [r"\bjava\b", r"\bcore java\b", r"\bjdk\b"]},
    {"name": "Python", "category": "PROGRAMMING", "aliases": [r"\bpython\b", r"\bpython3\b"]},
    {"name": "C++", "category": "PROGRAMMING", "aliases": [r"\bc\+\+\b", r"\bcpp\b"]},
    {"name": "JavaScript", "category": "PROGRAMMING", "aliases": [r"\bjavascript\b", r"\bes6\b", r"\bjs\b"]},
    {"name": "TypeScript", "category": "PROGRAMMING", "aliases": [r"\btypescript\b", r"\bts\b"]},
    {"name": "Go", "category": "PROGRAMMING", "aliases": [r"\bgolang\b", r"\bgo language\b"]},
    {"name": "DSA", "category": "CORE_CS", "aliases": [r"\bdsa\b", r"\bdata structures\b", r"\balgorithms\b"]},
    {"name": "Problem Solving", "category": "CORE_CS", "aliases": [r"\bproblem solving\b", r"\bleetcode\b", r"\bcompetitive programming\b"]},
    {"name": "System Design", "category": "CORE_CS", "aliases": [r"\bsystem design\b", r"\bhld\b", r"\blld\b", r"\bdistributed systems\b", r"\bmicroservices\b"]},
    {"name": "Operating Systems", "category": "CORE_CS", "aliases": [r"\boperating systems\b", r"\bmultithreading\b", r"\bconcurrency\b"]},
    {"name": "DBMS", "category": "CORE_CS", "aliases": [r"\bdbms\b", r"\bdatabase management\b", r"\bnormalization\b", r"\bacid\b"]},
    {"name": "Computer Networks", "category": "CORE_CS", "aliases": [r"\bcomputer networks\b", r"\btcp/ip\b", r"\bhttp\b", r"\bdns\b"]},
    {"name": "OOP", "category": "CORE_CS", "aliases": [r"\boop\b", r"\boops\b", r"\bobject oriented\b"]},
    {"name": "React", "category": "FRONTEND", "aliases": [r"\breact\b", r"\breact\.js\b", r"\breactjs\b"]},
    {"name": "HTML", "category": "FRONTEND", "aliases": [r"\bhtml\b", r"\bhtml5\b"]},
    {"name": "CSS", "category": "FRONTEND", "aliases": [r"\bcss\b", r"\bcss3\b"]},
    {"name": "Tailwind CSS", "category": "FRONTEND", "aliases": [r"\btailwind\b", r"\btailwindcss\b"]},
    {"name": "Next.js", "category": "FRONTEND", "aliases": [r"\bnext\.js\b", r"\bnextjs\b"]},
    {"name": "Django", "category": "BACKEND", "aliases": [r"\bdjango\b", r"\bdjango rest framework\b", r"\bdrf\b"]},
    {"name": "FastAPI", "category": "BACKEND", "aliases": [r"\bfastapi\b"]},
    {"name": "Spring Boot", "category": "BACKEND", "aliases": [r"\bspring boot\b", r"\bspring\b", r"\bhibernate\b"]},
    {"name": "Node.js", "category": "BACKEND", "aliases": [r"\bnode\.js\b", r"\bnodejs\b", r"\bexpress\.js\b", r"\bexpress\b"]},
    {"name": "REST APIs", "category": "BACKEND", "aliases": [r"\brest api\b", r"\brestful\b", r"\brest apis\b", r"\bgraphql\b"]},
    {"name": "SQL", "category": "DATABASE", "aliases": [r"\bsql\b", r"\bmysql\b", r"\bpl/sql\b"]},
    {"name": "PostgreSQL", "category": "DATABASE", "aliases": [r"\bpostgresql\b", r"\bpostgres\b"]},
    {"name": "MongoDB", "category": "DATABASE", "aliases": [r"\bmongodb\b", r"\bnosql\b"]},
    {"name": "Redis", "category": "DATABASE", "aliases": [r"\bredis\b"]},
    {"name": "Git", "category": "TOOLS", "aliases": [r"\bgit\b", r"\bgithub\b", r"\bgitlab\b"]},
    {"name": "Docker", "category": "DEVOPS", "aliases": [r"\bdocker\b", r"\bcontainerization\b", r"\bdocker-compose\b"]},
    {"name": "Kubernetes", "category": "DEVOPS", "aliases": [r"\bkubernetes\b", r"\bk8s\b"]},
    {"name": "AWS", "category": "DEVOPS", "aliases": [r"\baws\b", r"\bamazon web services\b", r"\bec2\b", r"\bs3\b"]},
    {"name": "Linux", "category": "DEVOPS", "aliases": [r"\blinux\b", r"\bunix\b", r"\bbash\b", r"\bshell scripting\b"]},
    {"name": "CI/CD", "category": "DEVOPS", "aliases": [r"\bci/cd\b", r"\bgithub actions\b", r"\bjenkins\b"]},
    {"name": "Machine Learning", "category": "DATA_SCIENCE", "aliases": [r"\bmachine learning\b", r"\bscikit-learn\b", r"\bsklearn\b", r"\bdeep learning\b"]},
    {"name": "Data Analysis", "category": "DATA_SCIENCE", "aliases": [r"\bpandas\b", r"\bnumpy\b", r"\bdata analysis\b", r"\btableau\b", r"\bpower bi\b"]},
    {"name": "NLP", "category": "DATA_SCIENCE", "aliases": [r"\bnlp\b", r"\bnatural language processing\b", r"\btf-idf\b", r"\btransformers\b"]},
]


def extract_skills_from_text(text: str) -> List[Dict[str, object]]:
    if not text or not text.strip():
        return []

    lowered = text.lower()
    extracted = []

    for entry in SKILL_TAXONOMY:
        total_hits = 0
        for pattern in entry["aliases"]:
            matches = re.findall(pattern, lowered, flags=re.IGNORECASE)
            total_hits += len(matches)

        if total_hits > 0:
            confidence = min(0.99, round(0.82 + min(total_hits, 4) * 0.04, 2))
            extracted.append(
                {
                    "name": entry["name"],
                    "category": entry["category"],
                    "mentions": total_hits,
                    "confidence": confidence,
                }
            )

    return sorted(extracted, key=lambda x: (-x["mentions"], x["name"]))
