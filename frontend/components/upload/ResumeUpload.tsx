'use client';

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { uploadResumePdf } from "@/lib/api";

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
}

export default function ResumeUpload({ onTextExtracted }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF document.");
      return;
    }
    setError(null);
    setFileName(file.name);
    setIsUploading(true);

    try {
      const data = await uploadResumePdf(file);
      onTextExtracted(data.text);
    } catch (err: any) {
      setError(err.message || "Failed to parse PDF. Try another file.");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="flex flex-col h-full border-gray-100 hover:border-primary-200 transition-colors duration-300 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2.5 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>
          Upload Resume
        </h2>
        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
          PDF format
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 text-center min-h-[200px] ${
          isDragOver
            ? "border-primary-400 bg-primary-50/50 scale-[1.01]"
            : fileName
            ? "border-emerald-200 bg-emerald-50/30"
            : "border-gray-200 hover:border-primary-300 bg-gray-50/50 hover:bg-primary-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleFileProcess(e.target.files[0])
          }
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              Extracting resume contents…
            </p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800">{fileName}</p>
            <p className="text-xs text-gray-400">
              Click or drag a new PDF to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100">
              <UploadCloud className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                or{" "}
                <span className="text-primary-600 font-semibold hover:underline">
                  browse files
                </span>{" "}
                — supports PDF up to 10 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </Card>
  );
}