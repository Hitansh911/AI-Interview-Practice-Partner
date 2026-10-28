'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumeUpload from "@/components/upload/ResumeUpload";
import JobDescription from "@/components/upload/JobDescription";
import StartButton from "@/components/interview/StartButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analyzeResume, ResumeAnalysis } from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  Video,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ArrowRight,
  Loader2,
  Mic
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert("Please upload your resume PDF and enter the target job description.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeResume({
        resume_text: resumeText,
        job_description: jobDescription,
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartInterview = () => {
    if (!resumeText || !jobDescription) {
      alert("Please upload your resume and provide a target job description.");
      return;
    }

    // Persist in sessionStorage for the interview room
    sessionStorage.setItem("interview_resume", resumeText);
    sessionStorage.setItem("interview_jd", jobDescription);
    router.push("/interview");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-4 md:py-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span>Next-Gen Generative AI Interview Partner</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
          Master Your Next Tech Interview with{" "}
          <span className="gradient-text">Generative AI</span>
        </h1>

        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your resume PDF and target job description. Our Gen AI engine analyzes your qualifications, crafts tailored questions, and simulates an audio-visual interview room with webcam and AI voice.
        </p>
      </div>

      {/* Main Form: Resume Upload & Job Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <ResumeUpload onTextExtracted={(text) => {
          setResumeText(text);
          setAnalysisResult(null);
        }} />
        <JobDescription 
          value={jobDescription} 
          onChange={(val) => {
            setJobDescription(val);
            setAnalysisResult(null);
          }} 
        />
      </div>

      {/* Analysis CTA & Results */}
      <div className="w-full flex flex-col items-center space-y-6">
        {!analysisResult && (
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              disabled={!resumeText.trim() || !jobDescription.trim() || isAnalyzing}
              onClick={handleAnalyze}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-purple hover:shadow-purple-lg transition-all transform hover:scale-[1.01]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Resume with AI...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  <span>Analyze Resume Alignment</span>
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              Cross-references skills, experience, and role requirements using Gen AI.
            </p>
          </div>
        )}

        {analysisError && (
          <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-100 max-w-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* AI Analysis Result Card */}
        {analysisResult && (
          <Card className="w-full border-primary-100 bg-gradient-to-br from-white via-primary-50/20 to-purple-50/30 p-6 md:p-8 rounded-2xl shadow-card animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Alignment Analysis</h3>
                  <p className="text-xs text-gray-500">Resume parsed and evaluated against job requirements</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">Match Score:</span>
                <span className="text-sm font-bold bg-primary-600 text-white px-3.5 py-1 rounded-full shadow-sm">
                  {analysisResult.match_score ?? 85}% Compatible
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              {/* Matched Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Matched Core Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matched_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Opportunity / Missing Areas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  Target Areas For Questions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missing_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Focus Advice */}
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                AI Interviewer Focus
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {analysisResult.suggested_focus}
              </p>
            </div>

            {/* Start Interview CTA button */}
            <div className="pt-8 flex flex-col items-center gap-3">
              <StartButton onClick={handleStartInterview} />
              <p className="text-xs text-gray-500 text-center">
                Dual-screen room with live webcam and AI voice questions will launch.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10 border-t border-gray-100">
        <div className="p-6 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-primary-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary-100/70 flex items-center justify-center mb-3">
            <BrainCircuit className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">PyPDF AI Extraction</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Extracts deep textual structure directly from your resume PDF using Python's pypdf library.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-primary-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary-100/70 flex items-center justify-center mb-3">
            <Mic className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">AI Voice Model</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Synthesizes lifelike spoken questions in real time with interactive speech waveform feedback.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-primary-100 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary-100/70 flex items-center justify-center mb-3">
            <Video className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Dual-Window Room</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Simulates a live professional interview with your webcam feed on one side and the AI on the other.
          </p>
        </div>
      </div>
    </div>
  );
}