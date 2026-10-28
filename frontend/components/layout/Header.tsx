import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center shadow-purple">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[17px] tracking-tight text-gray-900 flex items-center gap-2">
              AI Interview Partner
              <span className="text-[10px] bg-primary-50 border border-primary-200 text-primary-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Pro
              </span>
            </span>
            <span className="text-[11px] text-gray-400 font-medium -mt-0.5 hidden sm:block">
              Powered by Generative AI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Dual-Screen Voice & Webcam Simulation
          </span>
        </div>
      </div>
    </header>
  );
}