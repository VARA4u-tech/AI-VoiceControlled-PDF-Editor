import {
  FileText,
  Loader2,
  Mic,
  Wand2,
  Languages,
  Eye,
  Type,
  AlignLeft,
  Clock,
  Search,
  X,
  Pencil,
  Check,
  Target,
} from "lucide-react";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";

interface PreviewAreaProps {
  paragraphs: string[];
  isLoading?: boolean;
  pageCount?: number;
  commandFeedback?: string | null;
  commandSuccess?: boolean;
  lastEditedIndices?: number[];
  onParagraphEdit?: (index: number, newText: string) => void;
  selectedParagraphIndex?: number | null;
  onSelectParagraph?: (index: number | null) => void;
}

const PreviewArea = ({
  paragraphs,
  isLoading,
  pageCount,
  commandFeedback,
  commandSuccess,
  lastEditedIndices = [],
  onParagraphEdit,
  selectedParagraphIndex = null,
  onSelectParagraph,
}: PreviewAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectionIndex, setSelectionIndex] = useState<number | null>(null);

  const startEdit = useCallback((i: number, text: string) => {
    setEditingIndex(i);
    setEditValue(text);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 30);
  }, []);

  const commitEdit = useCallback(() => {
    if (editingIndex === null) return;
    onParagraphEdit?.(editingIndex, editValue.trim());
    setEditingIndex(null);
    setEditValue("");
  }, [editingIndex, editValue, onParagraphEdit]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditValue("");
  }, []);

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commitEdit();
    }
  };

  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return paragraphs.reduce<number[]>((acc, p, i) => {
      if (p.toLowerCase().includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [searchQuery, paragraphs]);

  useEffect(() => {
    if (matchingIndices.length > 0) {
      const idx = matchingIndices[matchIndex % matchingIndices.length];
      paraRefs.current[idx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [matchIndex, matchingIndices]);

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") setMatchIndex((prev) => prev + 1);
  };

  const stats = useMemo(() => {
    const fullText = paragraphs.join(" ");
    const wordCount =
      fullText.trim() === "" ? 0 : fullText.trim().split(/\s+/).length;
    const sentenceCount = fullText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const readingMins = Math.max(1, Math.ceil(wordCount / 200));
    return { wordCount, sentenceCount, readingMins };
  }, [paragraphs]);

  useEffect(() => {
    if (lastEditedIndices.length > 0) {
      const firstActive = paraRefs.current[lastEditedIndices[0]];
      if (firstActive && scrollRef.current) {
        firstActive.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [lastEditedIndices]);

  return (
    <div
      ref={scrollRef}
      className="custom-scrollbar relative max-h-[600px] min-h-[400px] w-full max-w-4xl overflow-y-auto border border-primary/30 bg-background/90 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 sm:p-8 md:p-10 2xl:max-h-[800px]"
    >
      <div className="tech-bracket-tl" />
      <div className="tech-bracket-tr" />
      <div className="tech-bracket-bl" />
      <div className="tech-bracket-br" />

      {/* Tailwind SAFELIST for dynamic AI rendered content */}
      <div className="hidden rounded bg-red-500/20 px-1 text-red-500" />

      {/* Command feedback toast */}
      {commandFeedback && (
        <div
          className={`relative mb-6 animate-fade-in overflow-hidden border px-4 py-3 font-mono text-xs ${
            commandSuccess
              ? "border-accent/40 bg-accent/5 text-accent"
              : "border-destructive/40 bg-destructive/5 text-destructive/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="opacity-50">
              [{commandSuccess ? "SUCCESS" : "ERROR"}]
            </span>
            {commandFeedback}
          </div>
          <div
            className="absolute bottom-0 left-0 h-[1px] animate-[shimmer_2s_infinite] bg-accent/50"
            style={{ width: "100%" }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <div className="absolute inset-0 animate-pulse bg-accent/20 blur-xl" />
          </div>
          <p className="font-tech animate-pulse text-xs uppercase tracking-[0.4em] text-accent">
            Analyzing Data Stream...
          </p>
        </div>
      ) : paragraphs.length === 0 ? (
        <div className="relative flex h-full min-h-[500px] animate-fade-in flex-col items-center justify-center gap-8 p-6 sm:p-12">
          <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
            <div className="group relative mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-sm border border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(255,215,0,0.05)]">
              <div className="absolute inset-0 bg-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <FileText className="h-12 w-12 text-primary transition-all duration-500 group-hover:scale-110 group-hover:text-accent" />
              <div className="tech-bracket-tl h-3 w-3" />
              <div className="tech-bracket-br h-3 w-3" />
            </div>
            <h3 className="font-tech gold-text-glow mb-6 text-2xl uppercase leading-tight tracking-[0.4em] text-primary sm:text-4xl">
              Interface Standby
            </h3>
            <p className="mb-12 px-6 font-body text-lg leading-relaxed text-foreground opacity-90 sm:text-xl">
              Awaiting document injection. Once initialized, your vocal commands
              will modulate the content in real-time with sub-millisecond
              latencies.
            </p>

            <div className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2">
              <div className="group relative flex items-start gap-4 rounded-sm border border-primary/10 bg-primary/5 p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/5">
                <div className="tech-bracket-tl h-2 w-2" />
                <Mic className="mt-1 h-6 w-6 shrink-0 text-primary transition-all group-hover:scale-110 group-hover:text-accent" />
                <div>
                  <h4 className="font-tech mb-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                    Vocal Synthesis
                  </h4>
                  <p className="font-mono text-xs leading-snug text-foreground/70">
                    "Delete segment 4"
                  </p>
                </div>
              </div>
              <div className="group relative flex items-start gap-4 rounded-sm border border-primary/10 bg-primary/5 p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/5">
                <div className="tech-bracket-tl h-2 w-2" />
                <Wand2 className="mt-1 h-6 w-6 shrink-0 text-primary transition-all group-hover:-rotate-12 group-hover:text-accent" />
                <div>
                  <h4 className="font-tech mb-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                    AI Rewrite
                  </h4>
                  <p className="font-mono text-xs leading-snug text-foreground/70">
                    "Elevate tone for segment 1"
                  </p>
                </div>
              </div>
              <div className="group relative flex items-start gap-4 rounded-sm border border-primary/10 bg-primary/5 p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/5">
                <div className="tech-bracket-tl h-2 w-2" />
                <Languages className="mt-1 h-6 w-6 shrink-0 text-primary transition-all group-hover:text-accent" />
                <div>
                  <h4 className="font-tech mb-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                    Cipher Lingua
                  </h4>
                  <p className="font-mono text-xs leading-snug text-foreground/70">
                    "Translate segment 3 to Hindi"
                  </p>
                </div>
              </div>
              <div className="group relative flex items-start gap-4 rounded-sm border border-primary/10 bg-primary/5 p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/5">
                <div className="tech-bracket-tl h-2 w-2" />
                <Eye className="mt-1 h-6 w-6 shrink-0 text-primary transition-all group-hover:text-accent" />
                <div>
                  <h4 className="font-tech mb-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                    Sensory Focus
                  </h4>
                  <p className="font-mono text-xs leading-snug text-foreground/70">
                    "Activate Focus Mode"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-1">
          <div className="mb-6 flex flex-col gap-3 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-tech mb-1 text-[8px] tracking-[0.2em] text-primary/40">
                    DOCUMENT_ID
                  </span>
                  <span className="font-mono text-[11px] tracking-tight text-primary">
                    VCORE_
                    {Math.random().toString(36).substring(7).toUpperCase()}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-primary/10" />
                <div className="flex flex-col">
                  <span className="font-tech mb-1 text-[8px] tracking-[0.2em] text-primary/40">
                    SEGMENTS
                  </span>
                  <span className="font-mono text-[11px] tracking-tight text-primary">
                    {paragraphs.length}
                  </span>
                </div>
              </div>
              {pageCount && (
                <div className="rounded-sm border border-accent/20 bg-accent/5 px-3 py-1">
                  <span className="font-tech text-[9px] tracking-[0.2em] text-accent">
                    {pageCount} PG_UNITS
                  </span>
                </div>
              )}
            </div>

            {/* Live Stats Bar */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1.5 rounded-sm border border-primary/10 bg-primary/5 px-3 py-1.5">
                <Type className="h-3 w-3 text-accent/60" />
                <span className="font-mono text-[10px] text-primary/70">
                  {stats.wordCount.toLocaleString()}
                </span>
                <span className="font-tech text-[8px] uppercase tracking-widest text-primary/30">
                  Words
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-sm border border-primary/10 bg-primary/5 px-3 py-1.5">
                <AlignLeft className="h-3 w-3 text-accent/60" />
                <span className="font-mono text-[10px] text-primary/70">
                  {stats.sentenceCount}
                </span>
                <span className="font-tech text-[8px] uppercase tracking-widest text-primary/30">
                  Sentences
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-sm border border-primary/10 bg-primary/5 px-3 py-1.5">
                <Clock className="h-3 w-3 text-accent/60" />
                <span className="font-mono text-[10px] text-primary/70">
                  ~{stats.readingMins} min
                </span>
                <span className="font-tech text-[8px] uppercase tracking-widest text-primary/30">
                  Read
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-primary/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMatchIndex(0);
              }}
              onKeyDown={handleSearchKey}
              placeholder="Search_Archive... (Enter = next match)"
              className="w-full rounded-sm border border-primary/10 bg-primary/5 py-2 pl-9 pr-20 font-mono text-[11px] text-primary transition-colors placeholder:text-primary/20 focus:border-accent/30 focus:outline-none"
            />
            {searchQuery && (
              <div className="absolute right-3 flex items-center gap-2">
                <span className="font-mono text-[9px] text-accent/60">
                  {matchingIndices.length > 0
                    ? `${(matchIndex % matchingIndices.length) + 1}/${matchingIndices.length}`
                    : "0/0"}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMatchIndex(0);
                  }}
                >
                  <X className="h-3 w-3 text-primary/30 transition-colors hover:text-primary" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {paragraphs.map((para, i) => {
              const isMatch = matchingIndices.includes(i);
              const isActive =
                matchingIndices[matchIndex % matchingIndices.length] === i;
              const isEditing = editingIndex === i;
              const isSelectedForVoice = selectedParagraphIndex === i;

              return (
                <div
                  key={i}
                  ref={(el) => (paraRefs.current[i] = el)}
                  className={`group relative flex gap-4 border-l-2 border-transparent px-2 py-3 transition-all duration-300 ${
                    isEditing
                      ? "rounded-r-lg border-l-accent/80 bg-accent/5"
                      : isSelectedForVoice
                        ? "rounded-r-lg border-l-accent bg-accent/15 shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                        : isActive
                          ? "rounded-r-lg border-l-accent bg-accent/10"
                          : isMatch
                            ? "rounded-r-lg border-l-accent/30 bg-accent/5"
                            : lastEditedIndices.includes(i)
                              ? "rounded-r-lg border-l-accent/50 bg-accent/5"
                              : "hover:border-primary/20"
                  }`}
                >
                  {/* Paragraph number + Target indicator */}
                  <div className="flex w-8 shrink-0 flex-col items-center gap-1">
                    <span
                      className={`font-mono text-[10px] tabular-nums ${isSelectedForVoice ? "font-bold text-accent" : "text-primary/30"}`}
                    >
                      [{String(i + 1).padStart(2, "00")}]
                    </span>
                    {isSelectedForVoice && (
                      <Target className="h-3 w-3 animate-pulse text-accent" />
                    )}
                  </div>

                  {/* Content — view or edit */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <>
                        <textarea
                          ref={textareaRef}
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            // Auto-resize
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                          onKeyDown={handleEditKeyDown}
                          rows={3}
                          className="w-full resize-none rounded-sm border border-accent/20 bg-transparent px-3 py-2 font-body text-base leading-relaxed text-foreground/90 transition-colors focus:border-accent/50 focus:outline-none"
                          style={{ minHeight: "4rem" }}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={commitEdit}
                            className="font-tech flex items-center gap-1.5 rounded-sm border border-accent/30 bg-accent/10 px-3 py-1 text-[9px] uppercase tracking-widest text-accent transition-all hover:bg-accent/20"
                          >
                            <Check className="h-3 w-3" /> Save · Ctrl+↵
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="font-tech flex items-center gap-1.5 rounded-sm border border-primary/10 px-3 py-1 text-[9px] uppercase tracking-widest text-primary/40 transition-all hover:border-primary/30 hover:text-primary"
                          >
                            <X className="h-3 w-3" /> Cancel · Esc
                          </button>
                          <span className="ml-auto font-mono text-[9px] text-primary/20">
                            {
                              editValue.trim().split(/\s+/).filter(Boolean)
                                .length
                            }{" "}
                            words
                          </span>
                        </div>
                      </>
                    ) : (
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setSelectionIndex(i)}
                        title="Select editing mode"
                      >
                        <p
                          className={`pr-12 font-body text-base leading-relaxed transition-colors duration-200 ${
                            isSelectedForVoice
                              ? "font-medium text-accent"
                              : "text-foreground/90 group-hover:text-foreground"
                          }`}
                          dangerouslySetInnerHTML={{ __html: para }}
                        />

                        {/* Mode Selection UI */}
                        {selectionIndex === i && (
                          <div className="absolute inset-0 z-20 flex animate-fade-in items-center justify-center rounded-sm bg-background/80 backdrop-blur-md">
                            <div className="flex flex-wrap items-center justify-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectParagraph?.(i);
                                  setSelectionIndex(null);
                                }}
                                className="font-tech flex h-10 items-center justify-center gap-2 border border-accent/40 bg-accent/20 px-4 text-[10px] uppercase tracking-[0.2em] text-accent transition-all hover:bg-accent/30"
                              >
                                <Mic className="h-3 w-3" />
                                Voice Command
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(i, para);
                                  setSelectionIndex(null);
                                }}
                                className="font-tech flex h-10 items-center justify-center gap-2 border border-primary/40 bg-primary/20 px-4 text-[10px] uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary/30"
                              >
                                <Pencil className="h-3 w-3" />
                                Manual Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectionIndex(null);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/20 hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {onSelectParagraph && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectParagraph(
                                  isSelectedForVoice ? null : i,
                                );
                              }}
                              className={`rounded-full p-1.5 transition-all ${
                                isSelectedForVoice
                                  ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                                  : "text-primary/30 hover:bg-accent/10 hover:text-accent"
                              }`}
                              title={
                                isSelectedForVoice
                                  ? "Deselect for voice edit"
                                  : "Select for voice edit"
                              }
                            >
                              <Target
                                className={`h-3.5 w-3.5 ${isSelectedForVoice ? "animate-spin-slow" : ""}`}
                              />
                            </button>
                          )}

                          {onParagraphEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectionIndex(i);
                              }}
                              className="rounded-full p-1.5 text-primary/30 transition-all hover:bg-accent/10 hover:text-accent"
                              title="Edit modes"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;
