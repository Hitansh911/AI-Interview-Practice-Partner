from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewNextRequest,
    InterviewNextResponse,
    InterviewFeedbackRequest,
    InterviewFeedbackResponse
)
from app.services.question_generator import generate_interview_plan, get_session_question
from app.services.feedback_analyzer import analyze_interview_performance, generate_feedback_pdf

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(payload: InterviewStartRequest):
    session_id, questions = generate_interview_plan(payload.resume_text, payload.job_description)
    return InterviewStartResponse(
        session_id=session_id,
        total_questions=len(questions),
        first_question=questions[0]
    )

@router.post("/next", response_model=InterviewNextResponse)
async def next_question(payload: InterviewNextRequest):
    question, is_final = get_session_question(payload.session_id, payload.question_index)
    return InterviewNextResponse(
        session_id=payload.session_id,
        question_index=payload.question_index,
        question=question,
        is_final=is_final
    )

@router.post("/feedback", response_model=InterviewFeedbackResponse)
async def get_feedback(payload: InterviewFeedbackRequest):
    qa_list = [{"question": qa.question, "answer": qa.answer or ""} for qa in payload.qa_pairs]
    result = analyze_interview_performance(
        session_id=payload.session_id,
        resume_text=payload.resume_text or "",
        job_description=payload.job_description or "",
        questions_and_answers=qa_list
    )
    return InterviewFeedbackResponse(**result)

@router.post("/feedback/pdf")
async def download_feedback_pdf(payload: InterviewFeedbackRequest):
    qa_list = [{"question": qa.question, "answer": qa.answer or ""} for qa in payload.qa_pairs]
    feedback_data = analyze_interview_performance(
        session_id=payload.session_id,
        resume_text=payload.resume_text or "",
        job_description=payload.job_description or "",
        questions_and_answers=qa_list
    )
    pdf_bytes = generate_feedback_pdf(feedback_data)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=interview_feedback_{payload.session_id[:8]}.pdf"
        }
    )