import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import {
  suggestionCache,
  docFingerprint,
  minifyPrompt,
} from "@/lib/tokenOptimizer";
import { supabase } from "@/lib/supabase";

interface SmartSuggestionsProps {
  paragraphs: string[];
  lastCommand: string;
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

const SmartSuggestions = ({
  paragraphs,
  lastCommand,
  onSuggestionClick,
  isVisible,
}: SmartSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!paragraphs.length || !lastCommand) return;

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;

    if (!token) return;

    // ── Cache lookup ─────────────────────────────────────────────────────
    const fp = docFingerprint(paragraphs);
    const cached = suggestionCache.get(lastCommand, fp);
    if (cached) {
      setSuggestions(cached as string[]);
      return;
    }

    setLoading(true);
    setSuggestions([]);

    // Only send the first 400 chars of the document as context
    const sample = paragraphs.slice(0, 4).join(" ").slice(0, 400);
    const systemMsg = minifyPrompt(
      `You are an AI editor. Based on the last command, suggest exactly 3 short follow-up voice commands.
       Reply ONLY with a JSON array of 3 strings. Each under 8 words. Example: ["Fix grammar in segment 2","Shorten segment 3","Summarise segment 1"]`,
    );

    try {
      const response = await fetch(`${backendUrl}/edit/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          max_tokens: 150, // suggestions are short — hard cap
          temperature: 0.4,
          messages: [
            { role: "system", content: systemMsg },
            {
              role: "user",
              content: `Last command: "${lastCommand}"\nDoc excerpt: ${sample}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || "[]";
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          const results = parsed.slice(0, 3);
          setSuggestions(results);
          suggestionCache.set(lastCommand, fp, results);
        }
      }
    } catch {
      // Silent fail — suggestions are non-critical
    } finally {
      setLoading(false);
    }
  }, [paragraphs, lastCommand]);

  useEffect(() => {
    if (isVisible && lastCommand) {
      fetchSuggestions();
    }
  }, [isVisible, lastCommand, fetchSuggestions]);

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-accent/60" />
        <span className="font-tech text-[9px] uppercase tracking-[0.25em] text-primary/40">
          AI Suggestions
        </span>
        {loading && (
          <Loader2 className="ml-1 h-3 w-3 animate-spin text-accent/40" />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {loading
          ? // Skeleton chips while loading
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-8 w-36 animate-pulse rounded-sm border border-primary/10 bg-primary/5"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))
          : suggestions.length > 0
            ? suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(s)}
                  className="group flex items-center gap-1.5 rounded-sm border border-primary/15 bg-primary/5 px-4 py-2 font-mono text-[10px] text-primary/70 transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ChevronRight className="h-3 w-3 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  {s}
                </button>
              ))
            : null}
      </div>
    </div>
  );
};

export default SmartSuggestions;
