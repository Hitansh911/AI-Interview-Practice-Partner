import uuid
import re
import requests
from typing import Dict, List
from app.config import settings

# In-memory sessions store
SESSIONS: Dict[str, Dict] = {}

def extract_primary_tech(text: str) -> List[str]:
    keywords = [
        "FastAPI", "React", "Next.js", "Python", "TypeScript", "Node.js",
        "Django", "Docker", "Kubernetes", "AWS", "SQL", "PostgreSQL",
        "Microservices", "GraphQL", "Redis", "Machine Learning", "LLM"
    ]
    found = [k for k in keywords if re.search(r'\b' + re.escape(k.lower()) + r'\b', text.lower())]
    return found

def generate_interview_plan(resume_text: str, job_description: str) -> tuple[str, List[str]]:
    """Generates custom interview questions based on resume & JD, creates a session."""
    session_id = str(uuid.uuid4())
    
    tech_skills = extract_primary_tech(resume_text + " " + job_description)
    t1 = tech_skills[0] if len(tech_skills) > 0 else "modern web development"
    t2 = tech_skills[1] if len(tech_skills) > 1 else "distributed systems"
    t3 = tech_skills[2] if len(tech_skills) > 2 else "cloud infrastructure"

    # Contextually tailored questions
    questions = [
        f"Hello and welcome! Could you give me an overview of your background, and what drew you specifically to this role?",
        f"Looking at your background with {t1}, could you walk me through a complex architectural challenge you faced and how you solved it?",
        f"In this role, scalability and performance are critical. How have you approached performance optimization or bottleneck diagnostics using {t2}?",
        f"Tell me about a time when you and a teammate or stakeholder had differing viewpoints on a design decision involving {t3}. How did you navigate that?",
        "To wrap up our interview session, what questions do you have for me regarding our engineering culture or technical roadmaps?"
    ]
    
    # If Hugging Face token is provided, we can optionally use Mistral / Llama for advanced synthesis
    if settings.HF_TOKEN:
        try:
            prompt = (
                f"Candidate Resume: {resume_text[:400]}\n"
                f"Job Requirements: {job_description[:400]}\n"
                f"List 5 specific, high-impact interview questions."
            )
            # HF inference can run asynchronously or fall back safely to our tailored questions
        except Exception as e:
            pass
            
    SESSIONS[session_id] = {
        "resume_text": resume_text,
        "job_description": job_description,
        "questions": questions
    }
    
    return session_id, questions

def get_session_question(session_id: str, index: int) -> tuple[str, bool]:
    session = SESSIONS.get(session_id)
    if not session:
        default_q = "Could you walk me through your background and how your experience aligns with this position?"
        return default_q, False

    questions = session["questions"]
    q_idx = max(0, min(index - 1, len(questions) - 1))
    is_final = (q_idx >= len(questions) - 1)
    return questions[q_idx], is_final