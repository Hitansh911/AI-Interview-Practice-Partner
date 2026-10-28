from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import ResumeUploadResponse, ResumeAnalyzeRequest, ResumeAnalyzeResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.resume_analyzer import analyze_resume_alignment

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    try:
        text, pages = extract_text_from_pdf(content)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF.")
        return ResumeUploadResponse(text=text, pages=pages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(payload: ResumeAnalyzeRequest):
    result = analyze_resume_alignment(payload.resume_text, payload.job_description)
    return ResumeAnalyzeResponse(**result)