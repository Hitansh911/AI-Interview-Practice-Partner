'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import WebcamWindow from "@/components/interview/WebcamWindow";
import AIWindow from "@/components/interview/AIWindow";
import QuestionDisplay from "@/components/interview/QuestionDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  startInterview,
  getNextQuestion,
  generateSpeech,
  fetchInterviewFeedback,
  downloadFeedbackPdf,
  InterviewFeedback,
  QAPair
} from "@/lib/api";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  ArrowLeft,
  PhoneOff,
  SkipForward,
  CheckCircle2,
  Trophy,
  Sparkles,
  Download,
  Home,
  Loader2,
  BarChart3,
  Lightbulb,
  FileText
} from "lucide-react";

export default function InterviewRoomPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>("Initializing interview session...");
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Store Q&A pairs for post-interview feedback
  const [qaHistory, setQaHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const qaHistoryRef = useRef<Array<{ question: string; answer: string }>>([]);

  // Feedback state
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const { playAudio, stopAudio, speakTextWithSpeechSynthesis, isPlaying } = useAudioPlayer();

  useEffect(() => {
    setIsAiSpeaking(isPlaying);
  }, [isPlaying]);

  const speakQuestion = useCallback(
    async (text: string) => {
      try {
        const audioBlob = await generateSpeech(text);
        if (audioBlob) {
          playAudio(audioBlob);
        } else {
          speakTextWithSpeechSynthesis(text);
        }
      } catch (e) {
        speakTextWithSpeechSynthesis(text);
      }
    },
    [playAudio, speakTextWithSpeechSynthesis]
  );

  useEffect(() => {
    const resume = sessionStorage.getItem("interview_resume");
    const jd = sessionStorage.getItem("interview_jd");

    if (!resume || !jd) {
      router.push("/");
      return;
    }

    async function initSession() {
      try {
        setLoading(true);
        const data = await startInterview({ resume_text: resume!, job_description: jd! });
        setSessionId(data.session_id);
        setCurrentQuestion(data.first_question);
        setCurrentQuestionIndex(1);
        setTotalQuestions(data.total_questions || 5);

        // Speak the initial question using Voice service
        if (data.first_question) {
          speakQuestion(data.first_question);
        }
      } catch (err) {
        console.error("Failed to start interview", err);
        const fallbackQ = "Welcome! Could you introduce yourself and tell me what interested you in this position?";
        setCurrentQuestion(fallbackQ);
        setCurrentQuestionIndex(1);
        speakQuestion(fallbackQ);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [router, speakQuestion]);

  const completeInterviewSession = async (finalQaList: Array<{ question: string; answer: string }>) => {
    setIsInterviewCompleted(true);
    setIsGeneratingFeedback(true);
    setQaHistory(finalQaList);
    qaHistoryRef.current = finalQaList;

    try {
      const resume = sessionStorage.getItem("interview_resume") || "";
      const jd = sessionStorage.getItem("interview_jd") || "";

      const res = await fetchInterviewFeedback({
        session_id: sessionId || "session-" + Date.now(),
        resume_text: resume,
        job_description: jd,
        qa_pairs: finalQaList,
      });
      setFeedback(res);
    } catch (err) {
      console.error("Error generating feedback:", err);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!sessionId) return;
    stopAudio();

    // Save current answer
    const updatedHistory = [
      ...qaHistoryRef.current,
      { question: currentQuestion, answer: currentAnswer.trim() }
    ];
    setQaHistory(updatedHistory);
    qaHistoryRef.current = updatedHistory;
    setCurrentAnswer("");

    if (currentQuestionIndex >= totalQuestions) {
      await completeInterviewSession(updatedHistory);
      return;
    }

    setLoading(true);
    try {
      const nextIndex = currentQuestionIndex + 1;
      const res = await getNextQuestion(sessionId, nextIndex);
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(res.question);
      speakQuestion(res.question);
    } catch (err) {
      console.error("Error fetching next question", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    stopAudio();
    const finalHistory = [
      ...qaHistoryRef.current,
      ...(currentAnswer.trim() ? [{ question: currentQuestion, answer: currentAnswer.trim() }] : [])
    ];
    if (finalHistory.length > 0) {
      await completeInterviewSession(finalHistory);
    } else {
      router.push("/");
    }
  };

  const handleDownloadPdf = async () => {
    if (!sessionId) return;
    setIsDownloadingPdf(true);
    try {
      const resume = sessionStorage.getItem("interview_resume") || "";
      const jd = sessionStorage.getItem("interview_jd") || "";
      const pairsToSend = qaHistoryRef.current.length > 0
        ? qaHistoryRef.current
        : [{ question: currentQuestion, answer: currentAnswer.trim() }];

      await downloadFeedbackPdf({
        session_id: sessionId,
        resume_text: resume,
        job_description: jd,
        qa_pairs: pairsToSend,
      });
    } catch (err) {
      alert("Failed to download PDF feedback report. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 max-w-6xl mx-auto py-2">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Setup</span>
        </Button>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
            Live AI Session
          </span>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleEndInterview}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Session</span>
        </Button>
      </div>

      {!isInterviewCompleted ? (
        <>
          {/* Dual Windows: Webcam (User) & AI Interviewer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[360px]">
            <WebcamWindow onSpeakingChange={setIsUserSpeaking} />
            <AIWindow isSpeaking={isAiSpeaking} />
          </div>

          {/* Question Display & Voice Output & Candidate Live Answer */}
          <QuestionDisplay
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            total={totalQuestions}
            isLoading={loading}
            onReplayAudio={() => speakQuestion(currentQuestion)}
            currentAnswer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
            isUserSpeaking={isUserSpeaking}
          />

          {/* Action Footer: Controls with generous spacing */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleNextQuestion}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-purple hover:shadow-purple-lg flex items-center gap-2.5 transition-all transform hover:scale-[1.01]"
            >
              <span>{currentQuestionIndex >= totalQuestions ? "Finish & Analyze Interview" : "Next Question"}</span>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : (
        /* Interview Completed — AI Feedback & PDF Report Download Screen */
        <div className="space-y-8 animate-fade-in-up">
          <Card className="p-8 md:p-10 text-center space-y-6 border-primary-100 shadow-purple-lg bg-gradient-to-br from-white via-primary-50/20 to-purple-50/30 rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 mx-auto flex items-center justify-center shadow-md">
              <Trophy className="w-10 h-10 text-primary-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Interview Completed!
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Great job completing your interview session! Generative AI has analyzed your verbal answers, technical depth, and delivery.
              </p>
            </div>

            {/* Download PDF Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                size="xl"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-purple-lg flex items-center gap-2.5"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing PDF Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download PDF Feedback Report</span>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Practice Another Role</span>
              </Button>
            </div>
          </Card>

          {/* AI Comprehensive Performance Evaluation */}
          {isGeneratingFeedback ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">Generating AI Evaluation & Report...</h3>
              <p className="text-xs text-gray-500">Synthesizing candidate transcripts, strengths, and recommendations.</p>
            </Card>
          ) : feedback ? (
            <div className="space-y-6">
              {/* Score Dashboard Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 text-center bg-white border-primary-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Overall Score</span>
                  <p className="text-3xl font-extrabold text-primary-600 mt-2">{feedback.overall_score}%</p>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">Excellent</span>
                </Card>

                <Card className="p-5 text-center bg-white border-primary-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Technical Depth</span>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{feedback.technical_score}%</p>
                  <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-1">Strong Match</span>
                </Card>

                <Card className="p-5 text-center bg-white border-primary-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Communication</span>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{feedback.communication_score}%</p>
                  <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-1">Clear Delivery</span>
                </Card>

                <Card className="p-5 text-center bg-white border-primary-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Culture & Team</span>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{feedback.culture_score}%</p>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">High Synergy</span>
                </Card>
              </div>

              {/* Strengths & Improvement Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-gray-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-gray-900 text-base">Key Strengths Identified</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {feedback.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 bg-white border-gray-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900 text-base">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {feedback.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* AI Preparation Strategy */}
              <Card className="p-6 bg-gradient-to-r from-primary-50/50 to-white border-primary-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  AI Recommendation & Preparation Strategy
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {feedback.actionable_advice}
                </p>
              </Card>

              {/* Question-by-Question Breakdown with Full Candidate Transcripts */}
              <Card className="p-6 bg-white border-gray-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900 text-base">Interview Questions & Candidate Answer Transcripts</h3>
                </div>

                <div className="space-y-4">
                  {feedback.question_reviews.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-gray-900">
                          Q{rev.question_number}: {rev.question}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                          {rev.score}%
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-xs font-bold text-primary-700 block mb-1">
                          Candidate Answer Transcript:
                        </span>
                        <p className="text-xs text-gray-800 italic leading-relaxed">
                          "{rev.candidate_answer}"
                        </p>
                      </div>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold text-primary-600">AI Coaching Feedback: </span>
                        {rev.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}