import { useState, useRef, useEffect, useCallback } from "react";

export function useSpeechToText(onTranscriptChange: (text: string) => void) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const shouldBeListeningRef = useRef<boolean>(false);

  // Store callback in ref so changes to the callback never trigger re-renders or effect re-runs
  const callbackRef = useRef(onTranscriptChange);
  useEffect(() => {
    callbackRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage("Speech recognition not supported in this browser. You can type directly in the box.");
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;

          if (item.isFinal) {
            finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + text.trim();
          } else {
            interim += text;
          }
        }

        setLiveInterim(interim);

        const fullText = (finalTranscriptRef.current + (interim ? " " + interim : "")).trim();
        if (fullText && callbackRef.current) {
          callbackRef.current(fullText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied for speech recognition. Please allow microphone access in your browser address bar.");
          setIsListening(false);
          shouldBeListeningRef.current = false;
        } else if (event.error === "network") {
          setErrorMessage("Speech recognition network error. You can type directly or check your connection.");
        } else if (event.error !== "no-speech") {
          console.warn("Speech recognition notice:", event.error);
        }
      };

      recognition.onend = () => {
        if (shouldBeListeningRef.current) {
          try {
            recognition.start();
          } catch (_) {
            // Already active or starting
          }
        } else {
          setIsListening(false);
          setLiveInterim("");
        }
      };

      return recognition;
    } catch (e: any) {
      console.warn("Could not create SpeechRecognition:", e);
      setIsSupported(false);
      return null;
    }
  }, []); // Stable with 0 dependencies!

  const startListening = useCallback(() => {
    setErrorMessage(null);
    shouldBeListeningRef.current = true;

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err.name !== "InvalidStateError") {
          console.warn("Recognition start notice:", err);
        }
      }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    setIsListening(false);
    setLiveInterim("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }, []);

  const resetTranscript = useCallback((initialText: string = "") => {
    finalTranscriptRef.current = initialText;
    setLiveInterim("");
    if (callbackRef.current) {
      callbackRef.current(initialText);
    }
  }, []);

  useEffect(() => {
    startListening();

    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [startListening]);

  return {
    isListening,
    isSupported,
    errorMessage,
    liveInterim,
    startListening,
    stopListening,
    resetTranscript,
  };
}
