import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
interface UseSpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// SpeechRecognitionErrorEvent is NOT reliably present in globalThis across all
// TypeScript versions, so we define a minimal local interface instead.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: {
      readonly isFinal: boolean;
      readonly length: number;
      [index: number]: {
        readonly transcript: string;
      };
    };
  };
}

// Minimal interface describing the SpeechRecognition *instance* we use,
// so we don't depend on the global `SpeechRecognition` type which isn't
// reliably available in every TypeScript DOM lib version.
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Constructor type for SpeechRecognition.
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
}

const useSpeechRecognition = ({
  lang = "en-US",
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // ── KEY FIX: tracks whether the USER intentionally wants to be listening ──
  // The Web Speech API fires onend after every "no-speech" silence timeout,
  // even with continuous=true. Without this ref, the session dies silently
  // while the UI still shows the mic as "active", making voice undetectable.
  const shouldBeListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const handleSilenceTimeout = useCallback(() => {
    if (!shouldBeListeningRef.current) return;

    // Stop listening due to inactivity
    shouldBeListeningRef.current = false;
    setIsListening(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error("Failed to stop recognition on silence timeout:", e);
    }

    toast({
      title: "Microphone Inactive",
      description: "Microphone turned off due to inactivity",
    });
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    if (shouldBeListeningRef.current) {
      silenceTimerRef.current = setTimeout(handleSilenceTimeout, 5000);
    }
  }, [clearSilenceTimeout, handleSilenceTimeout]);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const w = window as WindowWithSpeechRecognition;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let final = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(final.trim());
      }
      setInterimTranscript(interim);

      // Reset silence timeout whenever we get speech results
      resetSilenceTimeout();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Intentional abort — ignore completely
      if (event.error === "aborted") return;

      // "no-speech" fires naturally during silence in continuous mode — not a real error.
      // onend will handle the restart if shouldBeListeningRef is true.
      if (event.error === "no-speech") return;

      // Real errors (mic permission denied, hardware error, etc.)
      console.error("Speech recognition error:", event.error);
      shouldBeListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      setInterimTranscript("");

      // ── AUTO-RESTART: if the user still wants to be listening, restart ──
      // The browser ends the session after silence (no-speech timeout), but
      // since shouldBeListeningRef.current is still true, we restart silently.
      if (shouldBeListeningRef.current) {
        // Small delay so we don't hammer the browser with instant restarts
        restartTimerRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // If start fails (e.g. already running), ignore
            }
          }
        }, 100);
      } else {
        // User intentionally stopped — update UI state
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognition.abort();
    };
  }, [isSupported, resetSilenceTimeout, lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Mark intention BEFORE starting so onend can restart if needed
    shouldBeListeningRef.current = true;
    resetSilenceTimeout();
    setTranscript("");
    setInterimTranscript("");

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // If it throws because it's already started, that's fine.
      // The intention is marked, so if it's currently stopping, onend will restart it.
      setIsListening(true);
      console.warn("Recognition already started", e);
    }
  }, [resetSilenceTimeout]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Clear intention FIRST so onend does NOT auto-restart
    shouldBeListeningRef.current = false;
    clearSilenceTimeout();
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {
      console.error("Failed to stop recognition:", e);
      setIsListening(false);
    }
  }, [clearSilenceTimeout]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
