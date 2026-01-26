import { useState, useEffect, useRef, useCallback } from "react";

export type ChatState = "idle" | "listening" | "speaking" | "processing";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UseVoiceChatProps {
  onStateChange?: (state: ChatState) => void;
  onError?: (error: string) => void;
}

export function useVoiceChat({
  onStateChange,
  onError,
}: UseVoiceChatProps = {}) {
  const [state, setState] = useState<ChatState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);

  // Refs for persistent instances
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Configuration
  const SILENCE_THRESHOLD = 1000; // ms to wait after silence before sending
  const NOISE_THRESHOLD = 0.02; // Volume threshold
  const MAX_RETRIES = 5;

  // Initialize TTS
  useEffect(() => {
    if (typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance();
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      synthesisRef.current = utterance;
    }

    return () => {
      stop();
    };
  }, []);

  // Update external state handler
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const speak = useCallback(
    (text: string) => {
      if (!synthesisRef.current) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      synthesisRef.current.text = text;
      synthesisRef.current.onend = () => {
        if (state === "speaking") {
          setState("listening");
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };

      setState("speaking");
      window.speechSynthesis.speak(synthesisRef.current);
    },
    [state]
  );

  const processUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTranscript("");

      setState("processing");

      // Mock LLM response (stream simulation)
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const responses = [
          "我听到了你说：",
          text,
          "。这是一个很有趣的话题，我们可以深入探讨一下。",
          "请问您还有其他想法吗？",
        ];

        const fullResponse = responses.join("");
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        speak(fullResponse);
      } catch (err) {
        console.error(err);
        onError?.("处理消息时出错");
        setState("listening");
      }
    },
    [speak, onError]
  );

  const startSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    silenceTimerRef.current = setTimeout(() => {
      if (transcript.trim()) {
        recognitionRef.current?.stop();
        processUserMessage(transcript);
      }
    }, SILENCE_THRESHOLD);
  }, [transcript, processUserMessage]);

  const setupAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength / 255;
        setVolume(average);

        // Simple VAD logic could go here if needed, but we rely on SpeechRecognition for main text

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onError?.("无法访问麦克风");
    }
  }, [onError]);

  const start = useCallback(async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("您的浏览器不支持语音识别");
      return;
    }

    // Initialize Audio Context for visualization
    await setupAudioAnalysis();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    recognition.onresult = (event: any) => {
      if (isMuted) return;

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setTranscript(currentText);

      // Reset silence timer on speech
      if (currentText.trim()) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        // We only start silence timer if we have some text
        // Actually, for continuous conversation, we might want to wait for a "final" result or a long pause
        // The demo logic used a custom VAD. Here we can use a debounce.
        startSilenceTimer();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);

      if (event.error === "not-allowed") {
        onError?.("麦克风权限被拒绝");
        stop();
      } else if (event.error === "network") {
        // Network error - attempt retry with backoff
        if (retryCountRef.current < MAX_RETRIES) {
          console.log(
            `Network error, retrying... (${retryCountRef.current + 1}/${MAX_RETRIES})`
          );
          retryCountRef.current += 1;
          // We don't call stop() here to allow auto-restart logic or manual restart
        } else {
          onError?.("网络连接不稳定，语音识别已停止");
          stop();
        }
      } else if (event.error === "no-speech") {
        // Ignore no-speech, it just means silence
      } else {
        // Other errors
        console.warn("Unhandled speech error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we are still in listening state (and not stopped manually)
      if (state === "listening" && !isMuted) {
        // Add a small delay for network errors to prevent rapid loops
        const delay = retryCountRef.current > 0 ? 1000 : 100;

        retryTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        }, delay);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setState("listening");
    } catch (e) {
      console.error(e);
    }
  }, [isMuted, state, onError, setupAudioAnalysis, startSilenceTimer]);

  const stop = useCallback(() => {
    setState("idle");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    retryCountRef.current = 0;

    window.speechSynthesis.cancel();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    // If muting, maybe stop recognition?
    // The demo logic keeps recognition but ignores results.
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setTranscript("");
  }, []);

  return {
    state,
    messages,
    transcript,
    volume,
    isMuted,
    start,
    stop,
    toggleMute,
    clearMessages,
  };
}
