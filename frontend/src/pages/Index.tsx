import { useState, useRef, useCallback, useEffect } from "react";
import FloatingParticles from "@/components/FloatingParticles";
import GoldDivider from "@/components/GoldDivider";
import MicButton from "@/components/MicButton";
import UploadButton from "@/components/UploadButton";
import StatusIndicator from "@/components/StatusIndicator";
import PreviewArea from "@/components/PreviewArea";
import MysticalHero from "@/components/MysticalHero";
import CyberHero from "@/components/CyberHero";
import ChatWidget from "@/components/ChatWidget";
import ScribeSidebar from "@/components/ScribeSidebar";
import MysticalBackground from "@/components/MysticalBackground";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Sparkles, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import MoonPhaseAnimation from "@/components/MoonPhaseAnimation";
import GoldWaveform from "@/components/GoldWaveform";
import CommandHelp from "@/components/CommandHelp";
import { parseDocument, type ParsedDocument } from "@/lib/documentParser";
import { processVoiceCommand, type CommandResult } from "@/lib/voiceCommands";
import { processCommandWithAI, processChatOnly } from "@/lib/aiService";
import { exportToPdf } from "@/lib/pdfExport";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import {
  Download,
  X,
  Wand2,
  Timer,
  Save,
  Target,
  RotateCcw,
  RotateCw,
  History as HistoryIcon,
  LogIn,
  UserPlus,
} from "lucide-react";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import SmartSuggestions from "@/components/SmartSuggestions";
import Footer from "@/components/Footer";
import { titleCache, docFingerprint, minifyPrompt } from "@/lib/tokenOptimizer";
import UserProfileIcon from "@/components/UserProfileIcon";

const STORAGE_KEY = "gilded-scribe-session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      fileName: string;
      paragraphs: string[];
      pageCount: number;
    };
  } catch {
    return null;
  }
}

const Index = () => {
  const { user } = useAuth();
  const saved = loadSession();
  const [fileName, setFileName] = useState(saved?.fileName ?? "");
  const [paragraphs, setParagraphs] = useState<string[]>(
    saved?.paragraphs ?? [],
  );
  // Session timer — starts/resets with document
  const { formatted: sessionTime } = useSessionTimer(
    paragraphs.length > 0,
    fileName,
  );
  const [history, setHistory] = useState<string[][]>([]);
  const [future, setFuture] = useState<string[][]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [pageCount, setPageCount] = useState(saved?.pageCount ?? 0);
  // ── Session & Voice Refs ──
  const isMicToggling = useRef(false);
  const latestTranscriptRef = useRef("");
  const wasListeningRef = useRef(false);
  const lastProcessedTranscriptRef = useRef("");
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pdfType, setPdfType] = useState<"text" | "scanned" | "mixed" | null>(
    null,
  );
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [commandSuccess, setCommandSuccess] = useState(false);
  const [lastEditedIndices, setLastEditedIndices] = useState<number[]>([]);
  const [scribeLog, setScribeLog] = useState<
    Array<{
      title?: string;
      content: string;
      type: "summary" | "stats" | "info" | "error";
      timestamp: Date;
    }>
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false); // Cooldown guard
  const [isExporting, setIsExporting] = useState(false);
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<
    number | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAttemptedSync = useRef(false);
  const {
    playClick,
    playSuccess,
    playError,
    playHover,
    playStart,
    playStop,
    playTransition,
    playTypewriterTick,
  } = useSoundEffects();

  // ── Sync with Supabase on Login ──
  useEffect(() => {
    if (!user) {
      hasAttemptedSync.current = false;
      return;
    }

    if (paragraphs.length === 0 && !hasAttemptedSync.current) {
      hasAttemptedSync.current = true;
      supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setFileName(data.file_hash);
            setParagraphs(data.content);
            setPageCount(data.page_count);
            setCommandFeedback("Session Restored: Cloud synchronization complete.");
            playSuccess();
          }
        });
    }
  }, [user, paragraphs.length, playSuccess]);

  // ── Persist session on every change ──
  useEffect(() => {
    // Local Persistence fallback
    if (paragraphs.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ fileName, paragraphs, pageCount }),
        );
      } catch {
        /* ignore quota */
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Supabase Persistence — use upsert with onConflict to avoid race conditions
    // that caused "duplicate key value violates unique constraint" errors.
    if (user && paragraphs.length > 0) {
      const activeName = fileName || "unnamed_document";
      supabase
        .from("user_documents")
        .upsert(
          {
            user_id: user.id,
            file_hash: activeName,
            content: paragraphs,
            page_count: pageCount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,file_hash" },
        )
        .then(({ error }) => {
          if (error)
            console.error("Backup Upsert Failed:", error.message, error.details);
        });
    }
  }, [fileName, paragraphs, pageCount, user]);

  const clearFeedback = useCallback(() => {
    setTimeout(() => setCommandFeedback(null), 4000);
  }, []);

  const handleCommand = useCallback(
    async (command: string) => {
      // 0. Auth Guard
      if (!user) {
        setCommandFeedback(
          "Authentication Required. Please log in to use voice commands.",
        );
        setCommandSuccess(false);
        clearFeedback();
        return;
      }

      // 0. Cooldown Guard
      if (isCooldown) {
        setCommandFeedback("System Rebooting | Please wait 3s...");
        setCommandSuccess(false);
        return;
      }

      if (!paragraphs.length) {
        setCommandFeedback(
          "Upload a document first before using voice commands.",
        );
        setCommandSuccess(false);
        clearFeedback();
        return;
      }

      const trimmedCmd = command.trim();

      // 1. Handle Undo (Special case, local only)
      if (/^undo$/i.test(trimmedCmd)) {
        if (history.length > 0) {
          const prev = history[history.length - 1];
          setFuture((f) => [...f, paragraphs]); // save current for redo
          setParagraphs(prev);
          setHistory((h) => h.slice(0, -1));
          setCommandFeedback("Undone last change.");
          setCommandSuccess(true);
          playSuccess();
        } else {
          setCommandFeedback("Nothing to undo.");
          setCommandSuccess(false);
          playError();
        }
        clearFeedback();
        return;
      }

      // 1b. Handle Redo (voice command)
      if (/^redo$/i.test(trimmedCmd)) {
        if (future.length > 0) {
          const next = future[future.length - 1];
          setFuture((f) => f.slice(0, -1));
          setHistory((h) => [...h, paragraphs]);
          setParagraphs(next);
          setCommandFeedback("Redone last undone change.");
          setCommandSuccess(true);
          playSuccess();
        } else {
          setCommandFeedback("Nothing to redo.");
          setCommandSuccess(false);
          playError();
        }
        clearFeedback();
        return;
      }

      setIsProcessing(true);
      let result: CommandResult;

      // 2. Try the Regex Engine first (FAST)
      // Regex commands generally apply to the whole document, unless it's a specific targeting command
      result = processVoiceCommand(
        trimmedCmd,
        paragraphs,
        selectedParagraphIndex,
      );

      // 3. Fallback to AI (LLM) if regex didn't recognize it
      if (!result.success && result.message.includes("Not recognized")) {
        const targetParagraphs =
          selectedParagraphIndex !== null
            ? [paragraphs[selectedParagraphIndex]]
            : paragraphs;

        setCommandFeedback(
          selectedParagraphIndex !== null
            ? `AI Assistant: Modifying Segment ${selectedParagraphIndex + 1}...`
            : "AI Assistant: Understanding intent...",
        );
        result = await processCommandWithAI(trimmedCmd, targetParagraphs);

        // If we were in targeted mode for the AI fallback, we need to merge the result back into the full document
        if (selectedParagraphIndex !== null && result.success) {
          const newParagraphs = [...paragraphs];
          newParagraphs[selectedParagraphIndex] = result.updatedParagraphs[0];
          result.updatedParagraphs = newParagraphs;
          // Adjust affected indices if they exist (though in single mode it's always just one)
          result.affectedIndices = [selectedParagraphIndex];
        }
      }

      setCommandFeedback(
        result.success
          ? `${result.message} | Cooldown Active (3s)`
          : result.message,
      );
      setCommandSuccess(result.success);
      setIsProcessing(false);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), 3000);

      if (result.success) {
        playSuccess();

        // Log to Supabase Activity
        if (user) {
          supabase
            .from("scribe_activity")
            .insert({
              user_id: user.id,
              document_name: fileName || "unnamed_ritual",
              command_type: result.structuredData?.action || "unknown",
              transcript: trimmedCmd,
              is_success: true,
            })
            .then(({ error }) => {
              if (error) console.error("Activity Log Failed:", error.message);
            });
        }

        // ── Handle Structural Actions (Immediate) ──
        if (result.structuredData?.action === "focus_toggle") {
          setIsFocusMode((prev) => !prev);
        }

        if (
          result.structuredData?.action === "read" &&
          result.structuredData?.target
        ) {
          const utterance = new SpeechSynthesisUtterance(
            result.structuredData.target,
          );
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice =
            voices.find(
              (v) => v.name.includes("Google") && v.lang === "en-US",
            ) || voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.cancel(); // Stop anything currently speaking
          window.speechSynthesis.speak(utterance);
        }

        if (result.scribeResponse) {
          setScribeLog((prev) => [
            {
              ...result.scribeResponse!,
              timestamp: new Date(),
            },
            ...prev,
          ]);
          setIsSidebarOpen(true);
        }

        // If the AI updated the paragraphs, save to history
        if (
          JSON.stringify(result.updatedParagraphs) !==
          JSON.stringify(paragraphs)
        ) {
          setHistory((h) => [...h, paragraphs]);
          setParagraphs(result.updatedParagraphs);
          if (result.affectedIndices) {
            setLastEditedIndices(result.affectedIndices);
            setTimeout(() => setLastEditedIndices([]), 3000);
          }
        }
      } else {
        playError();
      }

      clearFeedback();

      // Trigger Smart Suggestions after a successful AI command
      if (result.success) {
        setLastCommand(trimmedCmd);
        setShowSuggestions(true);
      }

      return result;
    },
    [
      paragraphs,
      history,
      future,
      isCooldown,
      clearFeedback,
      playSuccess,
      playError,
      user,
      fileName,
      selectedParagraphIndex,
    ],
  );

  const handleSelectParagraph = useCallback((index: number | null) => {
    setSelectedParagraphIndex(index);
    if (index !== null) {
      setCommandFeedback(`Selection Locked: Segment ${index + 1} selected.`);
      setCommandSuccess(true);
    } else {
      setCommandFeedback("Global Edit: All segments active.");
      setCommandSuccess(true);
    }
    setTimeout(() => setCommandFeedback(null), 3000);
  }, []);

  const handleChat = useCallback(
    async (message: string) => {
      if (!user) {
        setCommandFeedback(
          "Authentication Required. Please log in to connect.",
        );
        setCommandSuccess(false);
        clearFeedback();
        playError();
        return;
      }
      setIsProcessing(true);
      const response = await processChatOnly(message, paragraphs);
      setIsProcessing(false);
      return response;
    },
    [paragraphs, user, clearFeedback, playError],
  );

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // Keep a ref of the latest transcript to avoid stale closures in handleMicToggle
  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  const triggerCommandProcessing = useCallback(async () => {
    if (isProcessing) return;

    // We wait a bit for mobile browsers to finalize their buffers
    setIsProcessing(true);

    setTimeout(async () => {
      let cmd = (latestTranscriptRef.current || "").trim();

      // If the command is empty or already processed, ignore
      if (!cmd || cmd === lastProcessedTranscriptRef.current) {
        if (!cmd) console.warn("Voice Link: No audio captured.");
        setIsProcessing(false);
        return;
      }

      lastProcessedTranscriptRef.current = cmd;

      // Deduplication for stutter
      const cleanWords = cmd
        .split(/\s+/)
        .filter((w, i, a) => w.toLowerCase() !== a[i - 1]?.toLowerCase());
      cmd = cleanWords.join(" ");

      setScribeLog((prev) => [
        ...prev,
        {
          title: "Voice Command Captured",
          content: `Data: "${cmd}"`,
          type: "info",
          timestamp: new Date(),
        },
      ]);

      await handleCommand(cmd);
      setIsProcessing(false);
    }, 800);
  }, [handleCommand, isProcessing]);

  // Effect to catch natural or manual "end" of recording
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      if (latestTranscriptRef.current.trim()) {
        triggerCommandProcessing();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, triggerCommandProcessing]);

  // ── Typewriter Sound: plays a soft tick as voice text streams in ──
  useEffect(() => {
    if (interimTranscript) playTypewriterTick();
  }, [interimTranscript, playTypewriterTick]);

  const handleMicToggle = useCallback(() => {
    if (isMicToggling.current) return;
    isMicToggling.current = true;
    setTimeout(() => {
      isMicToggling.current = false;
    }, 1000);

    if (!user) {
      setCommandFeedback("Authentication Required. Please log in to connect.");
      setCommandSuccess(false);
      clearFeedback();
      playError();
      return;
    }

    if (isListening) {
      stopListening();
      playStop();
    } else {
      lastProcessedTranscriptRef.current = ""; // Reset for new recording
      playStart();
      startListening();
      setScribeLog((prev) => [
        ...prev,
        {
          content: "Voice Link Established. Listening...",
          type: "info",
          timestamp: new Date(),
        },
      ]);
    }
  }, [
    isListening,
    stopListening,
    startListening,
    playStart,
    playStop,
    user,
    clearFeedback,
    playError,
  ]);

  // ── Keyboard shortcut: Space (when not typing) or Ctrl+M ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      // Escape — exit Focus Mode
      if (e.key === "Escape") {
        setIsFocusMode(false);
        return;
      }
      // Ctrl+Shift+F — toggle Focus Mode
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
        return;
      }
      // Ctrl+Z — Undo
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        if (history.length > 0) {
          const prev = history[history.length - 1];
          setFuture((f) => [...f, paragraphs]);
          setParagraphs(prev);
          setHistory((h) => h.slice(0, -1));
          setCommandFeedback(
            `↩ Undo — ${history.length - 1} step${history.length - 1 !== 1 ? "s" : ""} left`,
          );
          setCommandSuccess(true);
          playSuccess();
          clearFeedback();
        }
        return;
      }
      // Ctrl+Y — Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (future.length > 0) {
          const next = future[future.length - 1];
          setFuture((f) => f.slice(0, -1));
          setHistory((h) => [...h, paragraphs]);
          setParagraphs(next);
          setCommandFeedback(
            `↪ Redo — ${future.length - 1} step${future.length - 1 !== 1 ? "s" : ""} left`,
          );
          setCommandSuccess(true);
          playSuccess();
          clearFeedback();
        }
        return;
      }
      // Ctrl+H — toggle History Panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowHistoryPanel((p) => !p);
        return;
      }
      // Space bar — hold-to-talk feel (toggle)
      if (e.code === "Space" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleMicToggle();
        return;
      }
      // Ctrl+M — explicit mic shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        handleMicToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    handleMicToggle,
    isFocusMode,
    history,
    paragraphs,
    playSuccess,
    clearFeedback,
    future,
  ]);

  const handleUpload = () => {
    playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setParagraphs([]);
    setHistory([]);
    setCommandFeedback(null);

    try {
      const parsed: ParsedDocument = await parseDocument(file);
      setParagraphs(parsed.paragraphs);
      setPageCount(parsed.pageCount);
      setPdfType(parsed.pdfType);
      const typeNote =
        parsed.pdfType === "mixed" ? " ⚠ Some pages are image-only." : "";
      setCommandFeedback(
        `Loaded "${file.name}" — ${parsed.paragraphs.length} paragraphs found.${typeNote}`,
      );
      setCommandSuccess(true);
      playSuccess();
      clearFeedback();

      // ── Auto-save to Supabase history on successful upload ─────────────────
      // Use INSERT (not upsert) so every uploaded PDF gets its own history
      // entry. A timestamp is appended to file_hash to make the key unique,
      // allowing the same file to be re-uploaded and appear as a separate entry.
      if (user) {
        const historyKey = `${file.name}__${Date.now()}`;
        supabase
          .from("user_documents")
          .insert({
            user_id: user.id,
            file_hash: historyKey,
            content: parsed.paragraphs,
            page_count: parsed.pageCount,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error("History auto-save failed:", error.message);
            } else {
              console.info("History: Document inserted →", historyKey);
            }
          });
      }
    } catch (err) {
      console.error("Parse error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("SCANNED_PDF:")) {
        setCommandFeedback(
          "🖼 Scanned PDF detected — no text layer found. " +
            "Please run it through Google Drive or Adobe Acrobat OCR first, then re-upload.",
        );
      } else {
        setCommandFeedback("Failed to parse document. Try a different file.");
      }
      setCommandSuccess(false);
      playError();
      clearFeedback();
    } finally {
      setIsParsing(false);
    }
  };

  const handleClearDocument = () => {
    setFileName("");
    setParagraphs([]);
    setPageCount(0);
    setHistory([]);
    setCommandFeedback("Session Cleared: Document unloaded.");
    setCommandSuccess(true);
    playTransition();
    clearFeedback();

    // Clear input value so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Export as a properly formatted PDF using jsPDF
  const handleExport = async () => {
    if (!paragraphs.length || isExporting) return;
    setIsExporting(true);
    setCommandFeedback("Generating high-fidelity PDF... please wait.");
    try {
      await exportToPdf(fileName, paragraphs);
      setCommandFeedback("PDF sealed and exported successfully.");
      setCommandSuccess(true);
      playSuccess();
      clearFeedback();
    } catch (err) {
      console.error("Export error:", err);
      setCommandFeedback("Export failed. Please try again.");
      setCommandSuccess(false);
      playError();
    } finally {
      setIsExporting(false);
    }
  };

  // ── Save Version ──────────────────────────────────────────────────────────
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [showVersionModal, setShowVersionModal] = useState(false);

  const handleSaveVersion = useCallback(async () => {
    if (!paragraphs.length || !user) return;
    setIsSavingVersion(true);
    const label =
      versionLabel.trim() ||
      `v_${new Date().toISOString().slice(0, 16).replace("T", "_")}`;

    const { data: existingDoc } = await supabase
      .from("user_documents")
      .select("id")
      .eq("user_id", user.id)
      .eq("file_hash", label)
      .maybeSingle();

    let error;
    if (existingDoc?.id) {
      const { error: updateError } = await supabase
        .from("user_documents")
        .update({
          content: paragraphs,
          page_count: pageCount, // Add pageCount to ensure consistency
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDoc.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("user_documents")
        .insert({
          user_id: user.id,
          file_hash: label,
          content: paragraphs,
          page_count: pageCount,
          updated_at: new Date().toISOString(),
        });
      error = insertError;
    }

    if (error) {
      setCommandFeedback("Failed to save version to the archive.");
      setCommandSuccess(false);
      playError();
    } else {
      setCommandFeedback(`Version "${label}" saved in history.`);
      setCommandSuccess(true);
      playSuccess();
    }
    setVersionLabel("");
    setShowVersionModal(false);
    setIsSavingVersion(false);
    clearFeedback();
  }, [
    paragraphs,
    user,
    versionLabel,
    playSuccess,
    playError,
    clearFeedback,
    pageCount,
  ]);

  // ── AI Auto-Title Generator ───────────────────────────────────────────────
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const handleGenerateTitle = useCallback(async () => {
    if (!paragraphs.length) return;
    playClick();

    // ── Cache: same doc → same title, no extra API call ────────────────────
    const fp = docFingerprint(paragraphs);
    const cached = titleCache.get("auto-title", fp);
    if (cached) {
      const title = cached as string;
      setFileName(title);
      setCommandFeedback(`Title recalled from cache: "${title}"`);
      setCommandSuccess(true);
      playSuccess();
      clearFeedback();
      return;
    }

    setIsGeneratingTitle(true);
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    if (!token) {
      setCommandFeedback("Authentication required to generate a title.");
      setCommandSuccess(false);
      playError();
      clearFeedback();
      setIsGeneratingTitle(false);
      return;
    }

    // Only first 500 chars — plenty for a title
    const sample = paragraphs.slice(0, 3).join(" ").slice(0, 500);
    const sysMsg = minifyPrompt(
      "You are a document analyst. Reply ONLY with a concise document title (5 words max, no quotes, no punctuation).",
    );

    try {
      const response = await fetch(`${backendUrl}/edit/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          max_tokens: 30, // a title is max 5 words — very small cap
          temperature: 0.3,
          messages: [
            { role: "system", content: sysMsg },
            { role: "user", content: `Title for: ${sample}` },
          ],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const suggested = data.choices?.[0]?.message?.content?.trim();
        if (suggested) {
          titleCache.set("auto-title", fp, suggested);
          setFileName(suggested);
          setCommandFeedback(`Title generated: "${suggested}"`);
          setCommandSuccess(true);
          playSuccess();
          clearFeedback();
        }
      }
    } catch {
      setCommandFeedback("Title generation failed. Check your API key.");
      setCommandSuccess(false);
      playError();
      clearFeedback();
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [paragraphs, playClick, playSuccess, playError, clearFeedback]);

  const displayTranscript =
    transcript +
    (interimTranscript ? (transcript ? " " : "") + interimTranscript : "");

  return (
    <div
      className={`emerald-gradient-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 transition-all duration-1000 ${isFocusMode ? "bg-black/80" : ""}`}
    >
      <MysticalBackground />
      <FloatingParticles />
      <ChatWidget paragraphs={paragraphs} onChat={handleChat} />

      {/* ──────────────── Focus Mode Layers ──────────────── */}
      {/* 1. Deep vignette that covers the full screen */}
      <div
        className={`pointer-events-none fixed inset-0 z-[5] transition-opacity duration-700 ${
          isFocusMode ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      {/* 2. Blur overlay for background chrome */}
      <div
        className={`pointer-events-none fixed inset-0 z-[4] bg-background/80 backdrop-blur-sm transition-opacity duration-700 ${
          isFocusMode ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* 3. Pulsing ambient glow behind the document */}
      {isFocusMode && (
        <div
          className="pointer-events-none fixed z-[6]"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "72vw",
            height: "60vh",
            background:
              "radial-gradient(ellipse at center, hsl(var(--accent)/0.06) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
      )}
      {/* 4. Floating Exit Focus Mode pill */}
      {isFocusMode && (
        <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 animate-fade-in">
          <button
            onClick={() => setIsFocusMode(false)}
            className="font-tech flex items-center gap-2.5 border border-accent/30 bg-background/80 px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-accent shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:bg-accent/10"
          >
            <X className="h-3.5 w-3.5" />
            Exit Focus · Esc
          </button>
        </div>
      )}

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        forceShow={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Help Button — hidden in focus mode */}
      {!isFocusMode && (
        <button
          onClick={() => setShowOnboarding(true)}
          title="Open Tutorial"
          className="font-tech fixed bottom-6 left-6 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-sm text-primary/50 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:text-accent"
        >
          ?
        </button>
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onMouseEnter={() => playHover()}
        className="group fixed right-6 top-6 z-40 flex items-center gap-2.5 overflow-hidden rounded-sm border border-primary/20 bg-slate-950/80 px-4 py-2.5 text-primary shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:border-accent/50"
      >
        <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="tech-bracket-tl h-1.5 w-1.5" />
        <div className="tech-bracket-br h-1.5 w-1.5" />

        <Activity className="h-4 w-4 transition-all group-hover:scale-110 group-hover:text-accent" />
        <span className="font-tech mt-0.5 hidden text-xs font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-accent sm:block">
          System Log
        </span>

        {scribeLog.length > 0 && (
          <div className="relative ml-1 flex items-center justify-center rounded-sm border border-accent/40 bg-accent/20 px-2 py-0.5 sm:ml-2">
            <span className="absolute inset-0 animate-ping rounded-sm bg-accent/20 opacity-50" />
            <span className="relative z-10 font-mono text-[10px] font-bold tabular-nums text-accent">
              {scribeLog.length}
            </span>
          </div>
        )}
      </button>

      {/* User Status / Auth Navigation — top left */}
      {!isFocusMode && (
        <div className="fixed left-4 top-4 z-40 sm:left-6 sm:top-6">
          {user ? (
            <UserProfileIcon />
          ) : (
            <div className="flex animate-fade-in flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/login"
                onMouseEnter={() => playHover()}
                className="font-tech group flex items-center gap-2 rounded-sm border border-primary/20 bg-slate-950/80 px-3 py-1.5 text-[9px] uppercase tracking-widest text-primary/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:text-primary sm:px-4 sm:py-2 sm:text-[10px]"
              >
                <LogIn className="h-3 w-3 text-primary/40 transition-colors group-hover:text-accent sm:h-3.5 sm:w-3.5" />
                Login
              </Link>
              <Link
                to="/signup"
                onMouseEnter={() => playHover()}
                className="font-tech group flex items-center gap-2 rounded-sm border border-accent/20 bg-accent/5 px-3 py-1.5 text-[9px] uppercase tracking-widest text-accent/80 shadow-[0_0_15px_rgba(255,215,0,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-accent/40 hover:text-accent sm:px-4 sm:py-2 sm:text-[10px]"
              >
                <UserPlus className="h-3 w-3 text-accent/40 transition-colors group-hover:text-accent sm:h-3.5 sm:w-3.5" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      <ScribeSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        scribeLog={scribeLog}
        paragraphs={paragraphs}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt"
        className="hidden"
      />

      <main
        className={`relative mx-auto flex w-full max-w-5xl flex-col items-center gap-y-10 pt-8 transition-all duration-700 sm:pt-16 ${
          isListening
            ? "scale-[1.02] drop-shadow-[0_0_30px_hsl(var(--gold)/0.15)] filter"
            : "scale-100"
        } ${isFocusMode ? "z-[10]" : "z-10"} animate-fade-in`}
      >
        {/* Hero — collapses in focus mode */}
        <div
          className={`flex w-full flex-col items-center overflow-hidden transition-all duration-700 ${
            isFocusMode
              ? "pointer-events-none max-h-0 opacity-0"
              : "max-h-[1600px] opacity-100"
          }`}
        >
          <CyberHero fileName={fileName} paragraphsCount={paragraphs.length} />
        </div>

        {/* Upload + Export + Clear row — collapses in Focus Mode */}
        <div
          className={`w-full overflow-hidden transition-all duration-700 ${
            isFocusMode
              ? "pointer-events-none mb-0 max-h-0 opacity-0"
              : "mb-8 max-h-[500px] opacity-100"
          }`}
        >
          <div className="flex w-full flex-wrap items-center justify-center gap-3 px-4 sm:gap-4">
            <UploadButton
              onUpload={handleUpload}
              hasFile={!!fileName}
              fileName={fileName}
            />

            {/* Session Timer Badge */}
            {paragraphs.length > 0 && (
              <div className="flex animate-fade-in items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2">
                <Timer className="h-3.5 w-3.5 animate-pulse text-accent/60" />
                <span className="font-mono text-[11px] tabular-nums tracking-widest text-primary/70">
                  {sessionTime}
                </span>
                <span className="font-tech text-[8px] uppercase text-primary/30">
                  Session
                </span>
              </div>
            )}

            {paragraphs.length > 0 && (
              <>
                {/* Auto-Title Button */}
                <button
                  onClick={handleGenerateTitle}
                  onMouseEnter={() => playHover()}
                  disabled={isGeneratingTitle}
                  title="AI Auto-Title Generator"
                  className="font-tech group relative flex w-full animate-fade-in cursor-pointer items-center justify-center gap-2 overflow-hidden border border-primary/20 bg-primary/5 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:border-accent hover:bg-accent/5 hover:text-accent disabled:opacity-50 sm:w-auto sm:py-3 sm:text-[11px]"
                >
                  <div className="tech-bracket-tl h-1 w-1" />
                  <div className="tech-bracket-br h-1 w-1" />
                  {isGeneratingTitle ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12" />
                  )}
                  {isGeneratingTitle ? "Generating..." : "Suggest Title"}
                </button>

                {/* Save Version Button — only when logged in */}
                {user && (
                  <button
                    onClick={() => setShowVersionModal(true)}
                    onMouseEnter={() => playHover()}
                    title="Save Version to History"
                    className="font-tech group relative flex w-full animate-fade-in cursor-pointer items-center justify-center gap-2 overflow-hidden border border-primary/20 bg-primary/5 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:border-accent hover:bg-accent/5 hover:text-accent sm:w-auto sm:py-3 sm:text-[11px]"
                  >
                    <div className="tech-bracket-tl h-1 w-1" />
                    <div className="tech-bracket-br h-1 w-1" />
                    <Save className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                    Save Version
                  </button>
                )}

                <button
                  onClick={handleExport}
                  onMouseEnter={() => playHover()}
                  disabled={isExporting}
                  className="font-tech group relative flex w-full animate-fade-in cursor-pointer items-center justify-center gap-2 overflow-hidden border border-primary/20 bg-primary/5 px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:border-accent hover:bg-accent/5 hover:text-accent disabled:opacity-50 sm:w-auto sm:py-3 sm:text-[11px]"
                >
                  <div className="tech-bracket-tl h-1 w-1" />
                  <div className="tech-bracket-br h-1 w-1" />
                  {isExporting ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  ) : (
                    <Download className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                  )}
                  {isExporting ? "Exporting..." : "Export PDF"}
                </button>

                <button
                  onClick={handleClearDocument}
                  onMouseEnter={() => playHover()}
                  title="Clear document"
                  className="group flex animate-fade-in cursor-pointer items-center justify-center rounded-full border border-destructive/40 bg-transparent p-2.5 text-destructive/80 transition-all duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:p-3"
                >
                  <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110 sm:h-5 sm:w-5" />
                </button>

                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                  <button
                    onClick={() => {
                      if (history.length > 0) {
                        const prev = history[history.length - 1];
                        setFuture((f) => [...f, paragraphs]);
                        setParagraphs(prev);
                        setHistory((h) => h.slice(0, -1));
                        setCommandFeedback(
                          `↩ Undo — ${history.length - 1} step(s) left`,
                        );
                        setCommandSuccess(true);
                        playSuccess();
                        clearFeedback();
                      }
                    }}
                    disabled={history.length === 0}
                    title="Undo (Ctrl+Z)"
                    className="p-1.5 text-primary/40 transition-all hover:text-accent disabled:opacity-20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <span className="h-4 w-[1px] bg-primary/10" />
                  <button
                    onClick={() => {
                      if (future.length > 0) {
                        const next = future[future.length - 1];
                        setFuture((f) => f.slice(0, -1));
                        setHistory((h) => [...h, paragraphs]);
                        setParagraphs(next);
                        setCommandFeedback(
                          `↪ Redo — ${future.length - 1} step(s) left`,
                        );
                        setCommandSuccess(true);
                        playSuccess();
                        clearFeedback();
                      }
                    }}
                    disabled={future.length === 0}
                    title="Redo (Ctrl+Y)"
                    className="p-1.5 text-primary/40 transition-all hover:text-accent disabled:opacity-20"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <span className="h-4 w-[1px] bg-primary/10" />
                  <button
                    onClick={() => setShowHistoryPanel((p) => !p)}
                    title="Toggle History Viewer (Ctrl+H)"
                    className={`p-1.5 transition-all ${showHistoryPanel ? "text-accent" : "text-primary/40 hover:text-accent"}`}
                  >
                    <HistoryIcon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsFocusMode((p) => !p);
                    playTransition();
                  }}
                  onMouseEnter={() => playHover()}
                  title="Toggle Focus Mode (Ctrl+Shift+F)"
                  className="group flex animate-fade-in cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-transparent p-2.5 text-primary/50 transition-all duration-300 hover:border-accent/40 hover:text-accent sm:p-3"
                >
                  <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
          </div>
        </div>
        {/* end collapsing toolbar wrapper */}

        {!isSupported && (
          <p className="mt-2 font-body text-sm italic text-destructive/80">
            Speech recognition is not supported in this browser
          </p>
        )}

        {/* Mic + Waveform */}
        <div className="my-6 flex flex-col items-center gap-3">
          <MicButton isListening={isListening} onClick={handleMicToggle} />
          <GoldWaveform isActive={isListening} />
          <StatusIndicator
            status={
              isListening ? "listening" : isProcessing ? "processing" : "idle"
            }
            isCooldown={isCooldown}
          />

          {selectedParagraphIndex !== null && (
            <button
              onClick={() => handleSelectParagraph(null)}
              className="group flex animate-fade-in items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all hover:bg-accent/20"
            >
              <Target className="animate-spin-slow h-3 w-3 text-accent" />
              <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-accent">
                Targeting Seg {selectedParagraphIndex + 1}
              </span>
              <X className="h-2.5 w-2.5 text-accent/50 group-hover:text-accent" />
            </button>
          )}

          {displayTranscript && isListening && (
            <div className="group relative max-w-md animate-fade-in border-x border-accent/20 px-6 py-2 text-center font-mono text-[11px] tracking-wider text-accent">
              <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <p className="relative z-10 uppercase opacity-80">
                <span className="mr-2 opacity-40">Capture:</span>"
                {displayTranscript}"
                <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-accent/60" />
              </p>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {!isListening && isSupported && (
            <p className="gold-text-glow mt-1 select-none font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 sm:text-xs">
              Space · Ctrl+M to speak
            </p>
          )}
        </div>

        <div className="relative z-20 mb-6 flex w-full justify-center">
          <CommandHelp />
        </div>

        <GoldDivider />

        {/* ── History Timeline Panel ── */}
        {showHistoryPanel && history.length > 0 && (
          <div className="mb-4 w-full animate-fade-in overflow-hidden rounded-sm border border-primary/10 bg-primary/5">
            <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-4 py-2">
              <span className="font-tech text-[9px] uppercase tracking-widest text-primary/40">
                Edit History — {history.length} snapshot
                {history.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="text-primary/30 transition-colors hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="max-h-48 divide-y divide-primary/5 overflow-y-auto">
              {[...history].reverse().map((snap, i) => {
                const idx = history.length - 1 - i;
                const wordCount = snap.join(" ").trim().split(/\s+/).length;
                return (
                  <div
                    key={i}
                    className="group flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-[9px] tabular-nums text-primary/20">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-mono text-[10px] text-primary/60">
                          {snap.length} segments · {wordCount.toLocaleString()}{" "}
                          words
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFuture((f) => [...f, paragraphs]);
                        setParagraphs(snap);
                        setHistory((h) => h.slice(0, idx));
                        setCommandFeedback(`Restored snapshot ${idx + 1}.`);
                        setCommandSuccess(true);
                        playSuccess();
                        clearFeedback();
                        setShowHistoryPanel(false);
                      }}
                      className="font-tech rounded-sm border border-accent/20 bg-accent/5 px-3 py-1 text-[8px] uppercase tracking-widest text-accent opacity-0 transition-all hover:bg-accent/15 group-hover:opacity-100"
                    >
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`flex w-full flex-col items-center transition-all duration-1000 ${isFocusMode ? "mt-12" : "mt-0"}`}
        >
          <PreviewArea
            paragraphs={paragraphs}
            isLoading={isParsing}
            pageCount={pageCount}
            commandFeedback={commandFeedback}
            commandSuccess={commandSuccess}
            lastEditedIndices={lastEditedIndices}
            onParagraphEdit={(idx, newText) => {
              if (!newText || newText === paragraphs[idx]) return;
              setHistory((h) => [...h, paragraphs]);
              setParagraphs((prev) => {
                const updated = [...prev];
                updated[idx] = newText;
                return updated;
              });
              setLastEditedIndices([idx]);
              setTimeout(() => setLastEditedIndices([]), 3000);
              setCommandFeedback(`Segment ${idx + 1} updated manually.`);
              setCommandSuccess(true);
              playSuccess();
              clearFeedback();
            }}
            selectedParagraphIndex={selectedParagraphIndex}
            onSelectParagraph={handleSelectParagraph}
          />

          {/* Smart Suggestions — appears after each successful command */}
          {paragraphs.length > 0 && (
            <div className="mt-4 w-full px-2">
              <SmartSuggestions
                paragraphs={paragraphs}
                lastCommand={lastCommand}
                isVisible={showSuggestions}
                onSuggestionClick={(s) => {
                  setShowSuggestions(false);
                  handleCommand(s);
                }}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Save Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md border border-accent/30 bg-background p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="tech-bracket-tl" />
            <div className="tech-bracket-tr" />
            <div className="tech-bracket-bl" />
            <div className="tech-bracket-br" />
            <h2 className="font-tech mb-2 text-sm uppercase tracking-[0.3em] text-primary">
              Save Version to History
            </h2>
            <p className="mb-6 font-mono text-[10px] text-primary/40">
              // Leave blank for auto-timestamp label
            </p>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveVersion();
                if (e.key === "Escape") setShowVersionModal(false);
              }}
              placeholder="e.g. Draft_v2 or Final_Review"
              autoFocus
              className="mb-6 w-full rounded-sm border border-primary/20 bg-primary/5 px-4 py-3 font-mono text-sm text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVersionModal(false);
                  setVersionLabel("");
                }}
                className="font-tech border border-primary/10 px-5 py-2 text-[10px] uppercase tracking-widest text-primary/40 transition-all hover:border-primary/30 hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={isSavingVersion}
                className="font-tech flex items-center gap-2 border border-accent/30 bg-accent/5 px-5 py-2 text-[10px] uppercase tracking-widest text-accent transition-all hover:bg-accent/15 disabled:opacity-50"
              >
                {isSavingVersion ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-accent border-t-transparent" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {isSavingVersion ? "Saving..." : "Save Version"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
