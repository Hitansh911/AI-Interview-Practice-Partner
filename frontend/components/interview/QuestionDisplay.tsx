'use client';

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import {
  Volume2,
  HelpCircle,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  Radio,
  Trash2,
  AlertCircle
} from "lucide-react";

interface QuestionDisplayProps {
  question: string;
  currentIndex: number;
  total: number;
  isLoading?: boolean;
  onReplayAudio?: () => void;
  currentAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  isUserSpeaking?: boolean;
}

export default function QuestionDisplay({
  question,
  currentIndex,
  total,
  isLoading,
  onReplayAudio,
  currentAnswer = "",
  onAnswerChange,
  isUserSpeaking = false,
}: QuestionDisplayProps) {
  const {
    isListening,
    isSupported,
    errorMessage,
    liveInterim,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText((text) => {
    if (onAnswerChange) {
      onAnswerChange(text);
    }
  });

  // When question index changes, reset the speech transcript for the new question
  useEffect(() => {
    resetTranscript(currentAnswer);
  }, [currentIndex, resetTranscript]);

  const handleClear = () => {
    resetTranscript("");
  };

  const handleQuickSample = () => {
    const sample =
      "I have extensive experience designing distributed microservices with Python and FastAPI, optimizing latency through Redis caching, and building responsive frontends with React and TypeScript.";
    resetTranscript(sample);
  };

  return (
    <Card className="border-gray-100 bg-white p-6 md:p-8 shadow-card relative overflow-hidden transition-all duration-300 rounded-2xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
            Question {currentIndex} of {total}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onReplayAudio && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReplayAudio}
              className="flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-primary-600" />
              <span>Replay Voice</span>
            </Button>
          )}

          {/* Prominent Recording Toggle */}
          {isSupported && (
            <Button
              variant={isListening ? "danger" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-md animate-pulse"
                  : "bg-primary-600 hover:bg-primary-700 text-white shadow-purple"
              }`}
            >
              {isListening ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Recording Speech Active (Click to Pause)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-white" />
                  <span>Click to Speak Answer</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-6 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          <span className="text-base font-medium">Generating context-aware interview question...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question Text */}
          <p className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed font-sans">
            "{question}"
          </p>

          {/* Microphone Status Notice & Live Speech Detection */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
              <div className="flex items-center gap-2">
                {isListening ? (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Listening to microphone — your spoken words will appear below:
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                    <MicOff className="w-3 h-3 text-gray-500" />
                    Speech recording paused (click "Click to Speak Answer" above to resume)
                  </span>
                )}

                {liveInterim && (
                  <span className="text-primary-700 italic font-medium bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    "{liveInterim}"
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {currentAnswer && (
                  <>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {currentAnswer.split(/\s+/).filter(Boolean).length} words recorded
                    </span>
                    <button
                      onClick={handleClear}
                      title="Clear answer"
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleQuickSample}
                  className="text-[11px] text-primary-600 hover:text-primary-800 underline font-medium"
                >
                  Insert Sample Answer
                </button>
              </div>
            </div>

            {/* Candidate Answer Textarea - Automatically Populated */}
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                resetTranscript(e.target.value);
              }}
              placeholder="Start speaking into your microphone now — your spoken words will appear here in real time. You can also type or edit your response..."
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 text-sm md:text-base text-gray-800 placeholder:text-gray-400 resize-none min-h-[120px] transition-all leading-relaxed shadow-sm font-sans"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Speak naturally. Everything recorded here is analyzed by AI to generate your post-interview PDF report.</span>
          </div>
        </div>
      )}
    </Card>
  );
}