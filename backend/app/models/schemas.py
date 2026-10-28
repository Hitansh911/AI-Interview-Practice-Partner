from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ResumeUploadResponse(BaseModel):
    text: str
    pages: int

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeAnalyzeResponse(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    suggested_focus: str
    match_score: int = Field(default=85, description="Alignment percentage score between 0 and 100")

class InterviewStartRequest(BaseModel):
    resume_text: str
    job_description: str

class InterviewStartResponse(BaseModel):
    session_id: str
    total_questions: int
    first_question: str

class InterviewNextRequest(BaseModel):
    session_id: str
    question_index: int

class InterviewNextResponse(BaseModel):
    session_id: str
    question_index: int
    question: str
    is_final: bool

class TTSRequest(BaseModel):
    text: str

class QAPair(BaseModel):
    question: str
    answer: Optional[str] = ""

class InterviewFeedbackRequest(BaseModel):
    session_id: str
    resume_text: Optional[str] = ""
    job_description: Optional[str] = ""
    qa_pairs: List[QAPair] = []

class QuestionReview(BaseModel):
    question_number: int
    question: str
    candidate_answer: str
    score: int
    feedback: str

class InterviewFeedbackResponse(BaseModel):
    session_id: str
    date: str
    overall_score: int
    technical_score: int
    communication_score: int
    culture_score: int
    strengths: List[str]
    improvements: List[str]
    actionable_advice: str
    question_reviews: List[QuestionReview]