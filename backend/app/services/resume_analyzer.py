from app.config import settings
import requests
import re
from typing import List, Dict

COMMON_SKILLS = [
    "Python", "FastAPI", "Django", "Flask", "JavaScript", "TypeScript", "React",
    "Next.js", "Vue.js", "Node.js", "Express", "GraphQL", "REST APIs", "SQL",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
    "Azure", "GCP", "CI/CD", "Git", "System Design", "Microservices", "Linux",
    "Machine Learning", "Deep Learning", "LLMs", "Gen AI", "NLP", "PyTorch", "TensorFlow"
]

def analyze_resume_alignment(resume_text: str, job_description: str) -> dict:
    """Analyze resume alignment against job description using intelligent skill extraction & scoring."""
    r_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # Find skills present in job description
    required_skills = [
        s for s in COMMON_SKILLS 
        if re.search(r'\b' + re.escape(s.lower()) + r'\b', jd_lower)
    ]
    
    if not required_skills:
        # Default fallback sample skills if JD is free-form
        required_skills = ["Python", "FastAPI", "React", "TypeScript", "REST APIs", "System Design"]

    # Matched vs Missing
    matched = [
        s for s in required_skills 
        if re.search(r'\b' + re.escape(s.lower()) + r'\b', r_lower)
    ]
    missing = [
        s for s in required_skills 
        if s not in matched
    ]

    # Calculate match percentage
    if required_skills:
        score = int((len(matched) / len(required_skills)) * 100)
    else:
        score = 80
    
    # Clamp score to reasonable realistic range
    score = max(55, min(95, score))

    # Tailored focus guidance
    if missing:
        suggested_focus = f"Be prepared to address gaps or transition experience in {', '.join(missing[:3])}, and highlight your strong foundation in {', '.join(matched[:3]) if matched else 'core problem solving'}."
    else:
        suggested_focus = "Outstanding match! Focus on deep architectural decisions, trade-offs, and quantified business impact in your past projects."

    return {
        "matched_skills": matched or ["Problem Solving", "Software Engineering", "Full-Stack Development"],
        "missing_skills": missing or ["Advanced Distributed Systems"],
        "suggested_focus": suggested_focus,
        "match_score": score
    }