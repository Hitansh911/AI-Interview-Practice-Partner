'use client';

import React from "react";
import { useWebcam } from "@/hooks/useWebcam";
import { Camera, CameraOff, Mic, MicOff, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WebcamWindowProps {
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export default function WebcamWindow({ onSpeakingChange }: WebcamWindowProps) {
  const {
    videoRef,
    isCameraActive,
    isMuted,
    toggleCamera,
    toggleMute,
    error,
    restartStream,
    isUserSpeaking,
  } = useWebcam();

  React.useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isUserSpeaking);
    }
  }, [isUserSpeaking, onSpeakingChange]);

  return (
    <Card className="relative overflow-hidden flex flex-col justify-between p-0 bg-slate-950 border border-gray-200 h-full min-h-[340px] shadow-card rounded-2xl">
      {/* Video Container - Unobstructed view of candidate */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-slate-700/60">
              <CameraOff className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Camera is paused</p>
              <p className="text-xs text-slate-400 mt-1">Click the camera button below to turn it on</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Header Tags */}
      <div className="relative z-10 p-4 flex justify-between items-center pointer-events-none">
        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 border border-white/40 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-600" />
          You (Candidate)
        </span>

        <div className="flex items-center gap-2">
          {/* Small subtle mic status badge in corner */}
          {!isMuted ? (
            <span
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md transition-colors ${
                isUserSpeaking
                  ? "bg-primary-600/90 text-white shadow-purple"
                  : "bg-slate-900/80 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>{isUserSpeaking ? "Speaking" : "Mic Active"}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-red-950/85 text-red-300 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-red-500/30">
              <MicOff className="w-3 h-3" />
              <span>Muted</span>
            </span>
          )}

          {isCameraActive && (
            <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Empty spacer so video is 100% visible */}
      <div className="flex-1" />

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 p-4 flex items-center justify-end gap-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            isMuted
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/90 text-gray-800 hover:bg-white border border-white/40"
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleCamera}
          title={isCameraActive ? "Turn off camera" : "Turn on camera"}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            !isCameraActive
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/90 text-gray-800 hover:bg-white border border-white/40"
          }`}
        >
          {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>

        {error && (
          <button
            onClick={restartStream}
            title="Retry Camera Access"
            className="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="absolute top-14 left-4 right-4 z-20 flex items-center gap-2 p-2.5 rounded-xl bg-red-600/90 text-white text-xs backdrop-blur-md shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Card>
  );
}