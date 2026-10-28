from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import resume, interview, voice

app = FastAPI(
    title="AI Interview Partner API",
    description="Backend services for resume parsing, question generation, and voice synthesis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(voice.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-interview-partner-backend"}