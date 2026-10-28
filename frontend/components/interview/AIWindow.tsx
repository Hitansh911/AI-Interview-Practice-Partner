'use client';

import React from "react";
import { Bot, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIWindowProps {
  isSpeaking?: boolean;
}

export default function AIWindow({ isSpeaking = false }: AIWindowProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col justify-between p-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 border-gray-100 h-full min-h-[320px]">
      {/* Top Tag */}
      <div className="relative z-10 p-4 flex justify-between items-center">
        <span className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary-700 border border-primary-100 flex items-center gap-1.5 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-primary-500" />
          AI Interviewer
        </span>
        {isSpeaking && (
          <span className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Volume2 className="w-3 h-3 text-primary-500 animate-pulse" />
            Speaking
          </span>
        )}
      </div>

      {/* Central Visualizer: Avatar + Sound Waveform */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Avatar Ring */}
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute w-32 h-32 rounded-full transition-all duration-700 ${
              isSpeaking
                ? "bg-primary-200/60 blur-xl scale-125 animate-pulse-ring"
                : "bg-primary-100/30 blur-md scale-100"
            }`}
          />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 p-1 shadow-purple-lg flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Bot className="w-10 h-10 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Dynamic Waveform Bars */}
        <div className="flex items-center gap-1.5 h-8">
          {[40, 70, 95, 60, 85, 45, 90, 65, 35].map((baseHeight, i) => (
            <div
              key={i}
              style={{
                height: isSpeaking ? `${baseHeight}%` : "15%",
                transition: "height 0.15s ease-in-out",
                animationDelay: `${i * 0.1}s`,
              }}
              className={`w-1.5 rounded-full transition-colors duration-300 ${
                isSpeaking
                  ? "bg-gradient-to-t from-primary-500 to-primary-300 animate-waveform"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar Info */}
      <div className="relative z-10 p-3 bg-gray-50/80 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium">
          {isSpeaking
            ? "AI is asking your interview question…"
            : "Listening & assessing your responses in real time"}
        </p>
      </div>
    </Card>
  );
}