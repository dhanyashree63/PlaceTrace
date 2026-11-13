from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ResumeParseRequest(BaseModel):
    raw_text: str = Field(..., min_length=1)
    student_cgpa: float = Field(default=8.0, ge=0.0, le=10.0)


class JDParseRequest(BaseModel):
    jd_text: str = Field(..., min_length=1)
    title: Optional[str] = ""


class SkillExtractRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SkillMatchRequest(BaseModel):
    student_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    resume_text: Optional[str] = ""
    job_description: Optional[str] = ""


class ExtractedSkillItem(BaseModel):
    name: str
    category: str
    mentions: int
    confidence: float


class ResumeParseResponse(BaseModel):
    resume_score: int
    extracted_skills: List[ExtractedSkillItem]
    strengths: List[str]
    improvement_areas: List[str]
    section_scores: Dict[str, int]
