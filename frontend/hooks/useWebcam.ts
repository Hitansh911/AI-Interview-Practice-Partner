import { useState, useRef, useEffect, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  const startAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastCheck = 0;

      const checkVolume = (timestamp: number) => {
        if (!analyserRef.current) return;

        // Sample volume ~5 times per second to prevent re-render thrashing
        if (timestamp - lastCheck > 180) {
          lastCheck = timestamp;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const normalized = Math.min(100, Math.round((average / 128) * 100));

          const speaking = normalized > 14;
          setIsUserSpeaking((prev) => (prev !== speaking ? speaking : prev));
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn("Could not setup audio analyser:", e);
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsUserSpeaking(false);
  }, []);

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setError(null);

      startAudioMonitoring(stream);
    } catch (err: any) {
      console.warn("Could not access camera/mic:", err);
      setError("Camera or microphone permission was denied.");
      setIsCameraActive(false);
    }
  }, [startAudioMonitoring]);

  const stopStream = useCallback(() => {
    stopAudioMonitoring();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, [stopAudioMonitoring]);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraActive(videoTrack.enabled);
      }
    } else {
      startStream();
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const muted = !audioTrack.enabled;
        setIsMuted(muted);
        if (muted) {
          setIsUserSpeaking(false);
        }
      }
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  return {
    videoRef,
    isCameraActive,
    isMuted,
    toggleCamera,
    toggleMute,
    error,
    restartStream: startStream,
    isUserSpeaking: isMuted ? false : isUserSpeaking,
  };
}