import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface StartButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export default function StartButton({
  disabled,
  loading,
  onClick,
}: StartButtonProps) {
  return (
    <Button
      size="xl"
      disabled={disabled || loading}
      onClick={onClick}
      className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 text-white font-bold shadow-purple-lg hover:shadow-[0_14px_36px_-6px_rgba(124,58,237,0.4)] transition-all duration-300 transform hover:scale-[1.02]"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Preparing AI Room…</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5 fill-current" />
          <span>Start Interview Session</span>
        </>
      )}
    </Button>
  );
}