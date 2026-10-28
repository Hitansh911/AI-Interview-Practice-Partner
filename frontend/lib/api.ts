const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ResumeAnalysis {
  matched_skills: string[];
  missing_skills: string[];
  suggested_focus: string;
  match_score?: number;
}

export interface QAPair {
  question: string;
  answer?: string;
}

export interface QuestionReview {
  question_number: number;
  question: string;
  candidate_answer: string;
  score: number;
  feedback: string;
}

export interface InterviewFeedback {
  session_id: string;
  date: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  culture_score: number;
  strengths: string[];
  improvements: string[];
  actionable_advice: string;
  question_reviews: QuestionReview[];
}

export async function uploadResumePdf(file: File): Promise<{ text: string; pages: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload and parse resume.");
  }

  return res.json();
}

export async function analyzeResume(payload: { resume_text: string; job_description: string }): Promise<ResumeAnalysis> {
  const res = await fetch(`${BASE_URL}/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze resume.");
  }

  return res.json();
}

export async function startInterview(payload: { resume_text: string; job_description: string }) {
  const res = await fetch(`${BASE_URL}/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to initialize interview session.");
  }

  return res.json();
}

export async function getNextQuestion(sessionId: string, questionIndex: number) {
  const res = await fetch(`${BASE_URL}/interview/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, question_index: questionIndex }),
  });

  if (!res.ok) {
    throw new Error("Failed to load next question.");
  }

  return res.json();
}

export async function generateSpeech(text: string): Promise<Blob | null> {
  try {
    const res = await fetch(`${BASE_URL}/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return null;
    return await res.blob();
  } catch (e) {
    console.error("TTS fetch error", e);
    return null;
  }
}

export async function fetchInterviewFeedback(payload: {
  session_id: string;
  resume_text?: string;
  job_description?: string;
  qa_pairs: QAPair[];
}): Promise<InterviewFeedback> {
  const res = await fetch(`${BASE_URL}/interview/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to generate interview feedback.");
  }

  return res.json();
}

export async function downloadFeedbackPdf(payload: {
  session_id: string;
  resume_text?: string;
  job_description?: string;
  qa_pairs: QAPair[];
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/interview/feedback/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to download feedback PDF.");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Interview_Feedback_${payload.session_id.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}