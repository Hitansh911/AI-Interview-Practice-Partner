import { useState, useRef, useCallback } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speakTextWithSpeechSynthesis = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const playAudio = useCallback((audioSource: Blob | string) => {
    stopAudio();

    const url = typeof audioSource === "string" ? audioSource : URL.createObjectURL(audioSource);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      if (typeof audioSource !== "string") {
        URL.revokeObjectURL(url);
      }
    };
    audio.onerror = () => setIsPlaying(false);

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or failed:", err);
      setIsPlaying(false);
    });
  }, [stopAudio]);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    speakTextWithSpeechSynthesis,
  };
}