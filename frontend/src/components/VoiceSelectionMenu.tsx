import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Mic, Pencil, Loader2, StopCircle } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { DOMSerializer } from "prosemirror-model";
import { processSelectionEditWithAI } from "../lib/aiService";
import { toast } from "sonner";

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}

export default function VoiceSelectionMenu({ editor }: { editor: Editor }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const transcriptRef = useRef<string>("");
  const selectionRangeRef = useRef<{ from: number; to: number } | null>(null);
  const processRecordingRef = useRef<() => void>();

  // Sync ref with state so we can access it in the timeout callback reliably
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Preserve the selection range so we don't lose it if editor blurs
  const [selectionRange, setSelectionRange] = useState<{
    from: number;
    to: number;
  } | null>(null);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    silenceTimerRef.current = setTimeout(() => {
      if (!isRecordingRef.current) return;

      // Auto-process the command instead of just turning off
      if (processRecordingRef.current) {
        processRecordingRef.current();
      }
    }, 5000);
  }, [clearSilenceTimeout]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as WindowWithSpeech;
      const SpeechRecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true; // allow pausing briefly
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          transcriptRef.current = currentTranscript;

          // Reset silence timeout whenever we get speech results
          resetSilenceTimeout();
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
          if (e.error !== "aborted") {
            console.error("Speech recognition error", e.error);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          // If the mic naturally turns off (e.g. due to silence), update the UI state
          if (isRecordingRef.current) {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [clearSilenceTimeout, resetSilenceTimeout]);

  const getSelectedHtml = () => {
    const slice = editor.state.selection.content();
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const div = document.createElement("div");
    div.appendChild(serializer.serializeFragment(slice.content));
    return div.innerHTML;
  };

  processRecordingRef.current = async () => {
    if (!isRecordingRef.current) return;

    clearSilenceTimeout();
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      // ignore
    }
    setIsRecording(false);

    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript) {
      toast.info("No voice command detected.");
      return;
    }

    setIsProcessing(true);

    try {
      // Re-apply the saved selection if we lost it
      if (selectionRangeRef.current) {
        editor.commands.setTextSelection(selectionRangeRef.current);
      }

      const selectedHtml = getSelectedHtml();
      if (!selectedHtml) {
        toast.error("No text selected.");
        setIsProcessing(false);
        return;
      }

      toast.info("Applying AI edit...");
      const newHtml = await processSelectionEditWithAI(
        selectedHtml,
        finalTranscript,
      );

      // Replace selection with new HTML
      // insertContent automatically replaces the current selection
      editor.commands.insertContent(newHtml);
      toast.success("Edit applied successfully!");
    } catch (error) {
      console.error("Selection Edit Error", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply AI edit.",
      );
    } finally {
      setIsProcessing(false);
      setTranscript("");
      transcriptRef.current = "";
      setSelectionRange(null);
      selectionRangeRef.current = null;
    }
  };

  const startRecording = (e: React.SyntheticEvent) => {
    e.preventDefault(); // Keep editor focus and selection
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    // Save selection range before we start doing things
    const currentSelection = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    setSelectionRange(currentSelection);
    selectionRangeRef.current = currentSelection;

    setTranscript("");
    transcriptRef.current = "";

    // Abort any stale background sessions first
    try {
      recognitionRef.current.abort();
    } catch (err) {
      // ignore
    }

    // Small delay ensures the browser completely clears the audio pipeline
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        resetSilenceTimeout();
      } catch (err) {
        console.warn("Recognition start failed", err);
      }
    }, 80);
  };

  const stopRecording = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (processRecordingRef.current) {
      processRecordingRef.current();
    }
  };

  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={100}
      shouldShow={({ state }) => {
        // Keep the menu open if we're actively recording or processing, even if selection is lost
        if (isRecording || isProcessing) return true;
        // Otherwise, show only when text is selected
        return !state.selection.empty;
      }}
      options={{ placement: "top" }}
      className="flex items-center gap-1 overflow-hidden rounded-lg border border-primary/30 bg-background/95 p-1 shadow-2xl backdrop-blur-xl"
    >
      {isProcessing ? (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-accent">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-tech uppercase tracking-wider">Editing...</span>
        </div>
      ) : isRecording ? (
        <div className="flex items-center gap-2 px-2 py-1">
          <button
            onMouseDown={stopRecording}
            onTouchStart={stopRecording}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30"
          >
            <StopCircle className="h-4 w-4 animate-pulse" />
          </button>
          <span className="max-w-[200px] truncate pr-2 text-xs italic text-foreground/80">
            "{transcript || "Listening..."}"
          </span>
        </div>
      ) : (
        <>
          <button
            onMouseDown={startRecording}
            onTouchStart={startRecording}
            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium text-primary/80 transition-colors hover:bg-accent/20 hover:text-accent"
          >
            <Mic className="h-4 w-4" />
            Voice Edit
          </button>
          <div className="h-4 w-[1px] bg-primary/20" />
          <div
            className="flex cursor-default items-center gap-2 rounded px-3 py-1.5 text-xs font-medium text-primary/50"
            title="Just start typing to manually edit the selection"
          >
            <Pencil className="h-3.5 w-3.5" />
            Manual Edit
          </div>
        </>
      )}
    </BubbleMenu>
  );
}
