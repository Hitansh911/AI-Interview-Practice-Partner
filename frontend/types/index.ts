export interface InterviewSession {
  session_id: string;
  total_questions: number;
  first_question: string;
}

export interface QuestionResponse {
  session_id: string;
  question_index: number;
  question: string;
  is_final: boolean;
}

export interface ResumeAnalysisResult {
  candidate_name?: string;
  extracted_skills: string[];
  matched_points: string[];
  gap_areas: string[];
}