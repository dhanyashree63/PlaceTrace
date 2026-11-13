from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    JDParseRequest,
    ResumeParseRequest,
    ResumeParseResponse,
    SkillExtractRequest,
    SkillMatchRequest,
)
from app.security import verify_internal_api_key
from extractors.skill_extractor import extract_skills_from_text
from matching.matcher import match_skills_and_gap
from parsers.jd_parser import parse_job_description
from parsers.resume_parser import parse_and_score_resume

app = FastAPI(
    title="PlaceTrace ML Service",
    description="Intelligent Resume Parsing, JD Parsing, Skill Extraction, and Skill Gap Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "placetrace-ml-service"}


@app.post("/api/v1/parse-resume", response_model=ResumeParseResponse, dependencies=[Depends(verify_internal_api_key)])
def api_parse_resume(payload: ResumeParseRequest):
    return parse_and_score_resume(payload.raw_text, student_cgpa=payload.student_cgpa)


@app.post("/api/v1/parse-jd", dependencies=[Depends(verify_internal_api_key)])
def api_parse_jd(payload: JDParseRequest):
    return parse_job_description(payload.jd_text, title=payload.title or "")


@app.post("/api/v1/extract-skills", dependencies=[Depends(verify_internal_api_key)])
def api_extract_skills(payload: SkillExtractRequest):
    return {"skills": extract_skills_from_text(payload.text)}


@app.post("/api/v1/match-skills", dependencies=[Depends(verify_internal_api_key)])
def api_match_skills(payload: SkillMatchRequest):
    return match_skills_and_gap(
        student_skills=payload.student_skills,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        resume_text=payload.resume_text or "",
        job_description=payload.job_description or "",
    )


@app.post("/api/v1/skill-gap", dependencies=[Depends(verify_internal_api_key)])
def api_skill_gap(payload: SkillMatchRequest):
    return match_skills_and_gap(
        student_skills=payload.student_skills,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        resume_text=payload.resume_text or "",
        job_description=payload.job_description or "",
    )
