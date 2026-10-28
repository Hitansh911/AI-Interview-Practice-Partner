'use client';

import React from "react";
import { Briefcase, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JobDescriptionProps {
  value: string;
  onChange: (val: string) => void;
}

const SAMPLE_JD = `Senior Full-Stack Software Engineer

Requirements:
- 4+ years of professional experience with React, Next.js, and TypeScript.
- Strong backend background in Python (FastAPI/Django) and RESTful API architecture.
- Experience with cloud deployments, microservices, and AI/LLM integrations.
- Excellent communication and technical problem-solving skills.

Responsibilities:
- Design and implement scalable full-stack features.
- Collaborate with cross-functional teams on product delivery.
- Mentor junior developers and contribute to engineering best practices.`;

export default function JobDescription({ value, onChange }: JobDescriptionProps) {
  return (
    <Card className="flex flex-col h-full border-gray-100 hover:border-primary-200 transition-colors duration-300 animate-fade-in-up stagger-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2.5 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary-600" />
          </div>
          Job Description
        </h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange(SAMPLE_JD)}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample
        </Button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the role summary, requirements, and responsibilities here…"
        className="flex-1 w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 text-sm text-gray-700 placeholder:text-gray-300 resize-none min-h-[200px] transition-all duration-200"
      />

      <div className="mt-3 flex justify-between items-center text-xs">
        <span className="text-gray-400">
          The AI will customize questions to match this job description.
        </span>
        <span className="text-gray-300 font-medium tabular-nums">
          {value.length} chars
        </span>
      </div>
    </Card>
  );
}