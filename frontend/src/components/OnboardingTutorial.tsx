import React, { useState, useEffect } from "react";
import {
  Mic,
  FileText,
  Wand2,
  Download,
  Search,
  Save,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Trophy,
  Timer,
} from "lucide-react";

const ONBOARDING_KEY = "gilded-scribe-onboarded-v2";

interface Step {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  commands: string[];
  tip: string;
  color: string;
}

const STEPS: Step[] = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Welcome to Voice Scribe",
    subtitle: "Voice Controlled PDF Editor — Edit documents with your voice",
    commands: [],
    tip: "This short guide will show you how to master the system. You can dismiss it anytime.",
    color: "from-amber-500/20 to-transparent",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Upload Your Document",
    subtitle: "Import a PDF or text file into the editor",
    commands: [
      "Click Upload Document in the toolbar",
      "Supports text-based PDFs & plain text files",
      "Scanned PDFs require OCR pre-processing",
    ],
    tip: "Once uploaded, your document is auto-saved locally so you can resume later.",
    color: "from-blue-500/20 to-transparent",
  },
  {
    icon: <Mic className="h-8 w-8" />,
    title: "Activate Voice Control",
    subtitle: "Speak naturally — the AI is listening",
    commands: [
      '"Delete segment 3"',
      '"Replace segment 5 with Hello World"',
      '"Summarise the document"',
      '"Translate segment 2 to Telugu"',
    ],
    tip: "Press SPACE or Ctrl+M as a keyboard shortcut to toggle the microphone.",
    color: "from-green-500/20 to-transparent",
  },
  {
    icon: <Wand2 className="h-8 w-8" />,
    title: "AI-Powered Commands",
    subtitle: "Voice Scribe understands complex instructions",
    commands: [
      '"Fix grammar mistakes in segment 1"',
      '"Make segment 4 shorter and simpler"',
      '"Add a conclusion paragraph"',
      '"Elevate the tone of segment 2"',
    ],
    tip: "Commands are processed by an AI model — be patient on the free tier (rate limits apply).",
    color: "from-purple-500/20 to-transparent",
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "Search & Navigate",
    subtitle: "Find any word instantly across the document",
    commands: [
      "Use the Search bar in the document panel",
      "Type to highlight all matching paragraphs",
      "Press Enter to jump to the next match",
    ],
    tip: "The live word count, sentence count, and reading time are displayed at the top of the panel.",
    color: "from-cyan-500/20 to-transparent",
  },
  {
    icon: <Save className="h-8 w-8" />,
    title: "Save & Export",
    subtitle: "Store your work or download a formatted PDF",
    commands: [
      "Save Version — stores the current state to the cloud",
      "Export PDF — downloads a clean PDF instantly",
      "Auto Title — let AI name your document",
    ],
    tip: "Visit the History page to restore any previously saved version.",
    color: "from-rose-500/20 to-transparent",
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Track Your Progress",
    subtitle: "Analytics, Usage & Session History",
    commands: [
      "Analytics — See your command history & success rate",
      "History — Browse all sessions and restore documents",
      "Session Timer — Tracks time spent on each document",
    ],
    tip: "Log in to sync everything with the cloud. Your documents await.",
    color: "from-yellow-500/20 to-transparent",
  },
];

interface OnboardingTutorialProps {
  forceShow?: boolean;
  onClose?: () => void;
}

const OnboardingTutorial = ({
  forceShow = false,
  onClose,
}: OnboardingTutorialProps) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen || forceShow) setVisible(true);
  }, [forceShow]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
    onClose?.();
  };

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 180);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      {/* Modal */}
      <div className="relative w-full max-w-xl overflow-hidden border border-primary/30 bg-background shadow-[0_0_80px_rgba(0,0,0,0.9)] duration-300 animate-in fade-in zoom-in">
        {/* Corner brackets */}
        <div className="tech-bracket-tl" />
        <div className="tech-bracket-tr" />
        <div className="tech-bracket-bl" />
        <div className="tech-bracket-br" />

        {/* Gradient accent top */}
        <div
          className={`absolute left-0 top-0 h-40 w-full bg-gradient-to-b ${current.color} pointer-events-none opacity-60`}
        />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-5 top-5 z-10 p-2 text-primary/40 transition-colors hover:text-primary"
          title="Skip Tutorial"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step content */}
        <div
          className={`p-8 pt-10 transition-all duration-150 ${animating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
        >
          {/* Icon + Step counter */}
          <div className="mb-8 flex items-start justify-between">
            <div className="border border-accent/40 bg-accent/10 p-4 text-accent shadow-[0_0_20px_rgba(255,215,0,0.1)]">
              {current.icon}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === step
                      ? "w-8 bg-accent shadow-[0_0_10px_rgba(255,215,0,0.4)]"
                      : "w-2.5 bg-primary/20 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 font-heading text-2xl leading-tight tracking-tight text-primary sm:text-3xl">
            {current.title}
          </h2>
          <p className="mb-8 font-mono text-xs font-medium uppercase tracking-[0.25em] text-accent/90 sm:text-sm">
            {current.subtitle}
          </p>

          {/* Command Examples */}
          {current.commands.length > 0 && (
            <ul className="mb-8 space-y-3">
              {current.commands.map((cmd, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-sm border border-primary/10 bg-primary/5 px-5 py-3.5 transition-colors hover:border-primary/30"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-accent/60">
                    ❯
                  </span>
                  <span className="font-mono text-xs leading-relaxed text-foreground/90 sm:text-sm">
                    {cmd}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Tip */}
          <div className="border-l-3 mb-10 border-accent/60 bg-accent/5 px-5 py-4 ring-1 ring-inset ring-accent/5">
            <p className="font-body text-sm italic leading-relaxed text-foreground/80">
              <span className="mr-2 not-italic">💡</span>
              {current.tip}
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-auto flex items-center justify-between">
            <button
              onClick={() => (isFirst ? dismiss() : goTo(step - 1))}
              className="font-tech flex items-center gap-2.5 text-xs uppercase tracking-widest text-primary/50 transition-all hover:translate-x-[-2px] hover:text-primary"
            >
              {isFirst ? (
                <span className="opacity-80">Skip Tutorial</span>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </>
              )}
            </button>

            <button
              onClick={() => (isLast ? dismiss() : goTo(step + 1))}
              className="font-tech flex items-center gap-2.5 border border-accent/40 bg-accent/15 px-8 py-3.5 text-xs uppercase tracking-widest text-accent transition-all hover:border-accent hover:bg-accent/25 hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] active:scale-95"
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" /> Start Editing
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
