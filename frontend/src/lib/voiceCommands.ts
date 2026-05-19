export interface CommandResult {
  success: boolean;
  message: string;
  updatedParagraphs: string[];
  affectedIndices?: number[];
  scribeResponse?: {
    type: "summary" | "stats" | "info" | "error";
    content: string;
    title?: string;
  };
  structuredData?: {
    action: string;
    target?: string;
    replacement?: string;
  };
}

type CommandHandler = (
  paragraphs: string[],
  match: RegExpMatchArray,
  selectedParagraphIndex?: number | null,
) => CommandResult;

interface CommandPattern {
  pattern: RegExp;
  handler: CommandHandler;
  description: string;
  example: string;
}

const commands: CommandPattern[] = [
  {
    pattern:
      /^replace\s+(?:word\s+)?["']?(.+?)["']?\s+with\s+["']?(.+?)["']?$/i,
    description: "Replace word or phrase with another",
    example: "replace hello with greetings",
    handler: (paragraphs, match) => {
      const search = match[1].trim();
      const replacement = match[2].trim();
      let count = 0;
      const updated = paragraphs.map((p) => {
        const regex = new RegExp(escapeRegex(search), "gi");
        const matches = p.match(regex);
        if (matches) count += matches.length;
        return p.replace(regex, replacement);
      });
      if (count === 0) {
        return {
          success: false,
          message: `"${search}" not found in the document.`,
          updatedParagraphs: paragraphs,
        };
      }
      return {
        success: true,
        message: `Replaced ${count} occurrence(s) of "${search}" with "${replacement}".`,
        updatedParagraphs: updated,
        affectedIndices: updated.reduce((acc, p, i) => {
          if (paragraphs[i] !== p) acc.push(i);
          return acc;
        }, [] as number[]),
        structuredData: {
          action: "replace",
          target: search,
          replacement: replacement,
        },
      };
    },
  },

  {
    pattern:
      /^(?:delete|remove)\s+(?:word\s+)?["']?(.+?)["']?\s+from\s+(?:the\s+)?(?:selected\s+)?(?:line|paragraph)(?:\s+(\d+))?$/i,
    description: "Delete a word from source",
    example: "delete hello from selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      const word = match[1].trim();
      const pNum = match[2];
      const idx = pNum ? parseInt(pNum, 10) - 1 : selectedParagraphIndex;

      if (
        idx === null ||
        idx === undefined ||
        idx < 0 ||
        idx >= paragraphs.length
      ) {
        return {
          success: false,
          message: pNum
            ? `Paragraph ${pNum} does not exist.`
            : "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }

      const original = paragraphs[idx];
      // Try with word boundaries first for accuracy
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
      let updatedText = original.replace(regex, "");

      // If nothing changed (maybe it's not a full word or contains non-alphanumeric), try without \b
      if (updatedText === original) {
        const fallbackRegex = new RegExp(escapeRegex(word), "gi");
        updatedText = original.replace(fallbackRegex, "");
      }

      if (updatedText === original) {
        return {
          success: false,
          message: `Could not find "${word}" in the target line.`,
          updatedParagraphs: paragraphs,
        };
      }

      // Cleanup extra whitespace
      updatedText = updatedText.replace(/\s+/g, " ").trim();
      const updated = [...paragraphs];
      updated[idx] = updatedText;

      return {
        success: true,
        message: `Deleted "${word}" from the paragraph.`,
        updatedParagraphs: updated,
        affectedIndices: [idx],
        structuredData: {
          action: "delete",
          target: word,
        },
      };
    },
  },
  {
    pattern:
      /^add\s+["']?(.+?)["']?\s+(?:to|at|in|on)\s+(?:the\s+)?(?:end\s+of\s+)?(?:the\s+)?(?:selected\s+)?(?:line|paragraph)(?:\s+(\d+))?$/i,
    description: "Append text to source",
    example: "add 'the end' to selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      const text = match[1].trim();
      const pNum = match[2];
      const idx = pNum ? parseInt(pNum, 10) - 1 : selectedParagraphIndex;

      if (
        idx === null ||
        idx === undefined ||
        idx < 0 ||
        idx >= paragraphs.length
      ) {
        return {
          success: false,
          message: pNum
            ? `Paragraph ${pNum} does not exist.`
            : "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }

      const updated = [...paragraphs];
      const current = updated[idx];
      // Append text with appropriate spacing
      updated[idx] =
        current.length > 0
          ? current.endsWith(" ")
            ? current + text
            : current + " " + text
          : text;

      return {
        success: true,
        message: `Appended text to ${pNum ? "paragraph " + pNum : "the selected line"}.`,
        updatedParagraphs: updated,
        affectedIndices: [idx],
        structuredData: {
          action: "add",
          target: text,
        },
      };
    },
  },
  {
    pattern:
      /^add\s+["']?(.+?)["']?\s+(?:at|to|in|on)\s+(?:the\s+)?(?:start|beginning|starting)\s+of\s+(?:the\s+)?(?:selected\s+)?(?:line|paragraph)(?:\s+(\d+))?$/i,
    description: "Prepend text to source",
    example: "add 'Attention' at the start of selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      const text = match[1].trim();
      const pNum = match[2];
      const idx = pNum ? parseInt(pNum, 10) - 1 : selectedParagraphIndex;

      if (
        idx === null ||
        idx === undefined ||
        idx < 0 ||
        idx >= paragraphs.length
      ) {
        return {
          success: false,
          message: pNum
            ? `Paragraph ${pNum} does not exist.`
            : "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }

      const updated = [...paragraphs];
      const current = updated[idx];
      // Prepend text with appropriate spacing
      updated[idx] =
        current.length > 0
          ? text.endsWith(" ")
            ? text + current
            : text + " " + current
          : text;

      return {
        success: true,
        message: `Prepended text to ${pNum ? "paragraph " + pNum : "the selected line"}.`,
        updatedParagraphs: updated,
        affectedIndices: [idx],
        structuredData: {
          action: "add_start",
          target: text,
        },
      };
    },
  },

  {
    pattern:
      /^(?:summarize|summary)(?:\s+the)?\s+(?:selected\s+)?(?:line|text)$/i,
    description: "Summarize selected text (AI)",
    example: "summarize the selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      if (
        selectedParagraphIndex === null ||
        selectedParagraphIndex === undefined
      ) {
        return {
          success: false,
          message: "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }
      return {
        success: false,
        message: "Not recognized. Route to AI",
        updatedParagraphs: paragraphs,
      };
    },
  },
  {
    pattern:
      /^(?:simplify|shorten)(?:\s+the)?\s+(?:selected\s+)?(?:line|text)$/i,
    description: "Simplify selected text (AI)",
    example: "simplify the selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      if (
        selectedParagraphIndex === null ||
        selectedParagraphIndex === undefined
      ) {
        return {
          success: false,
          message: "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }
      return {
        success: false,
        message: "Not recognized. Route to AI",
        updatedParagraphs: paragraphs,
      };
    },
  },
  {
    pattern:
      /^(?:check|analyze|highlight|fix)?\s*(?:grammar|grammar\s+mistakes)(?:\s+in)?(?:\s+the)?\s*(?:selected\s+)?(?:line|text)?$/i,
    description: "Check grammar in selected text (AI)",
    example: "check grammar in the selected line",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      if (
        selectedParagraphIndex === null ||
        selectedParagraphIndex === undefined
      ) {
        return {
          success: false,
          message: "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }
      return {
        success: false,
        message: "Not recognized. Route to AI",
        updatedParagraphs: paragraphs,
      };
    },
  },

  {
    pattern:
      /^(?:rewrite|format|change\s+tone\s+of)\s+paragraph\s+(\d+)\s+to\s+be\s+(professional|poetic|simple|shorter)$/i,
    description: "Rewrite Tone (Style Adjuster)",
    example: "rewrite paragraph 1 to be professional",
    handler: (paragraphs, match) => {
      const idx = parseInt(match[1], 10) - 1;
      const tone = match[2].toLowerCase();

      if (idx < 0 || idx >= paragraphs.length) {
        return {
          success: false,
          message: `Paragraph ${idx + 1} does not exist.`,
          updatedParagraphs: paragraphs,
        };
      }

      const original = paragraphs[idx];
      let rewritten = original;

      // Simulated AI Tone Shifting logic
      if (tone === "professional") {
        rewritten = `It should be noted that ${original.charAt(0).toLowerCase()}${original.slice(1).replace(/[!?]/g, ".")}`;
        if (!rewritten.endsWith(".")) rewritten += " regarding this matter.";
      } else if (tone === "poetic") {
        rewritten = `Like gold upon velvet, ${original.charAt(0).toLowerCase()}${original.slice(1)}`;
      } else if (tone === "simple") {
        rewritten = original.split(".")[0] + ". Basically, it means this.";
      } else if (tone === "shorter") {
        rewritten =
          original.slice(0, Math.floor(original.length * 0.6)) + "...";
      }

      const updated = [...paragraphs];
      updated[idx] = rewritten;

      return {
        success: true,
        message: `Paragraph ${idx + 1} has been rewritten in a ${tone} tone.`,
        updatedParagraphs: updated,
        affectedIndices: [idx],
        scribeResponse: {
          type: "info",
          content: `Tone adjustment complete: Paragraph ${idx + 1} is now ${tone}.`,
          title: "Style Adjuster",
        },
        structuredData: {
          action: "rewrite",
          target: `paragraph ${idx + 1}`,
          replacement: tone,
        },
      };
    },
  },

  {
    pattern:
      /^(?:read|speak|narrate)(?:\s+the)?\s+(?:selected\s+)?(?:line|paragraph)(?:\s+(\d+))?$/i,
    description: "Read text aloud",
    example: "read paragraph 1",
    handler: (paragraphs, match, selectedParagraphIndex) => {
      const pNum = match[1];
      const idx = pNum ? parseInt(pNum, 10) - 1 : selectedParagraphIndex;

      if (
        idx === null ||
        idx === undefined ||
        idx < 0 ||
        idx >= paragraphs.length
      ) {
        return {
          success: false,
          message: pNum
            ? `Paragraph ${pNum} does not exist.`
            : "Please select a specific line/paragraph first.",
          updatedParagraphs: paragraphs,
        };
      }
      return {
        success: true,
        message: `Voice Assistant: Reading ${pNum ? "paragraph " + pNum : "selected line"} aloud...`,
        updatedParagraphs: paragraphs,
        structuredData: {
          action: "read",
          target: paragraphs[idx],
        },
      };
    },
  },
  {
    pattern:
      /^(?:translate|translation|transmute)\s+paragraph\s+(\d+)\s+(?:to|into)\s+(.+)$/i,
    description: "Language Translation",
    example: "translate paragraph 1 to Telugu",
    handler: (paragraphs, match) => {
      const idx = parseInt(match[1], 10) - 1;
      const lang = match[2].toLowerCase();

      if (idx < 0 || idx >= paragraphs.length) {
        return {
          success: false,
          message: `Paragraph ${idx + 1} does not exist.`,
          updatedParagraphs: paragraphs,
        };
      }

      // Mock Translation Logic
      let translation = "[Translation Service Offline]";
      if (lang.includes("telugu")) {
        translation =
          "ఈ అనువాదం ప్రాసెస్ చేయబడింది (This translation was processed).";
      } else if (lang.includes("hindi")) {
        translation =
          "यह अनुवाद संसाधित किया गया था (This translation was processed).";
      } else {
        translation = `[Mock ${lang} Translation of Para ${idx + 1}]`;
      }

      const updated = [...paragraphs];
      updated[idx] = translation;

      return {
        success: true,
        message: `Paragraph ${idx + 1} translated to ${lang}.`,
        updatedParagraphs: updated,
        affectedIndices: [idx],
        scribeResponse: {
          type: "info",
          content: `Document translated into ${lang}.`,
          title: "Translation",
        },
      };
    },
  },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function processVoiceCommand(
  command: string,
  paragraphs: string[],
  selectedParagraphIndex?: number | null,
): CommandResult {
  const trimmed = command.trim().replace(/[.,!?;]+$/, "");
  const lowerCmd = trimmed.toLowerCase();

  for (const cmd of commands) {
    const match = trimmed.match(cmd.pattern);
    if (match) {
      return cmd.handler([...paragraphs], match, selectedParagraphIndex);
    }
  }

  // Fuzzy suggestion fallback
  let suggestion = "Try: 'delete paragraph 2' or 'find [word]'";
  if (lowerCmd.includes("replace"))
    suggestion = "Did you mean: 'replace X with Y'?";
  else if (lowerCmd.includes("add"))
    suggestion =
      "Did you mean: 'add [text] after paragraph N' or 'add [text] to the selected line'?";
  else if (lowerCmd.includes("swap") || lowerCmd.includes("move"))
    suggestion = "Did you mean: 'swap paragraph A with B'?";
  else if (lowerCmd.includes("delete") || lowerCmd.includes("remove"))
    suggestion =
      "Did you mean: 'delete paragraph N' or 'delete [word] from selected line'?";
  else if (lowerCmd.includes("read") || lowerCmd.includes("speak"))
    suggestion = "Did you mean: 'read paragraph N'?";
  else if (lowerCmd.includes("rewrite") || lowerCmd.includes("tone"))
    suggestion = "Did you mean: 'rewrite paragraph N to be professional'?";
  else if (lowerCmd.includes("focus"))
    suggestion = "Did you mean: 'enter focus mode'?";
  else if (lowerCmd.includes("translate"))
    suggestion = "Did you mean: 'translate paragraph N to Telugu'?";
  else if (lowerCmd.includes("bold") || lowerCmd.includes("italic"))
    suggestion = "Did you mean: 'bold paragraph N'?";
  else if (lowerCmd.includes("ask") || lowerCmd.includes("question"))
    suggestion = "Did you mean: 'ask Scribe: [your question]'?";

  return {
    success: false,
    message: `Not recognized. ${suggestion}`,
    updatedParagraphs: paragraphs,
  };
}

export function getAvailableCommands(): Array<{
  description: string;
  example: string;
}> {
  return commands
    .filter((c) => c.description !== "Undo the last change") // shown separately in UI
    .map((c) => ({ description: c.description, example: c.example }));
}
