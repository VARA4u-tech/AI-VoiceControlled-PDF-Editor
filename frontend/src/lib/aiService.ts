import { CommandResult } from "./voiceCommands";
import { supabase } from "./supabase";
import {
  commandCache,
  dedupe,
  buildSmartDocumentContext,
  minifyPrompt,
  docFingerprint,
} from "./tokenOptimizer";

/**
 * AI Service — OpenRouter Direct Signal Protocol
 * Optimised: caching, deduplication, smart context windowing, prompt minification
 *
 * // ── Active model on OpenRouter ──────────────────────────────────────────────
 * // Change this single constant to swap the AI model across the whole app.
 */
// ── Fallback chain: tried in order until one succeeds ────────────────────────
// If a model is rate-limited (429/502), the next one is automatically tried.
const FREE_MODEL_CHAIN = ["nvidia/nemotron-3-nano-30b-a3b:free"];

// ── Shared fetch helper with model fallback ───────────────────────────────────
async function fetchWithFallback(
  backendUrl: string,
  token: string,
  bodyTemplate: (model: string) => object,
): Promise<Response> {
  let lastErr: Error = new Error("All models exhausted.");

  for (const model of FREE_MODEL_CHAIN) {
    const body = bodyTemplate(model);
    const response = await fetch(`${backendUrl}/edit/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // If rate-limited or model-not-found, move to the next model
    if (response.status === 429 || response.status === 404) {
      const raw = await response.text().catch(() => "");
      console.warn(
        `Model "${model}" unavailable (HTTP ${response.status}). Trying next model...`,
        raw,
      );
      lastErr = new Error(`HTTP ${response.status}: ${raw}`);
      continue;
    }

    // For 502/503 from backend (upstream model error), check if it's a model issue
    if (response.status === 502 || response.status === 503) {
      const raw = await response.text().catch(() => "");
      const isModelError =
        raw.includes("No endpoints found") ||
        raw.includes("rate-limited") ||
        raw.includes("429");
      if (isModelError) {
        console.warn(
          `Model "${model}" returned upstream error (HTTP ${response.status}). Trying next model...`,
          raw,
        );
        lastErr = new Error(`HTTP ${response.status}: ${raw}`);
        continue;
      }
      // Non-model 502 — surface immediately
      console.error(`Backend error (HTTP ${response.status}):`, raw);
      throw new Error(
        `API Connection failed (HTTP ${response.status}): ${raw}`,
      );
    }

    // All other non-OK responses (401, 500, etc.) — surface immediately
    if (!response.ok) {
      const raw = await response.text().catch(() => "(unreadable)");
      console.error(`API failed: HTTP ${response.status}`, raw);
      throw new Error(
        `API Connection failed (HTTP ${response.status}): ${raw}`,
      );
    }

    console.info(`Scribe Oracle: Connected via model "${model}".`);
    return response; // ✅ success
  }

  throw lastErr; // all models failed
}

const SYSTEM_PROMPT = minifyPrompt(`
You are the "Gilded Scribe", an AI voice editor assistant.
Interpret the user's command and apply it to the document (an array of paragraphs).
RULES:
1. Return ONLY a valid JSON object — no markdown, no explanation.
2. Keep "message" short (1 sentence max).
3. updatedParagraphs must contain ALL paragraphs (unchanged ones included).
4. For "delete word X", find the word X in the paragraphs and remove it. Keep surrounding punctuation and spacing clean.
5. For "add word X", append the text X to the specified paragraph or the end of the line.
6. For grammar check: detect errors, highlight using: <mark class='bg-red-500/20 text-red-500 px-1 rounded'>mistake</mark>.
7. For "translate", "rewrite", "simplify", or "summarize", apply the transformation to the requested paragraph(s) and return the modified text in updatedParagraphs. 
8. If asked for a summary, put the summary text inside the scribeResponse.content and DO NOT modify updatedParagraphs.
JSON format:
{
  "success": boolean,
  "message": "confirmation",
  "updatedParagraphs": string[],
  "affectedIndices": number[],
  "scribeResponse": {"type":"summary"|"stats"|"info", "content":"result", "title":"title"},
  "structuredData": {"action":"delete|replace|add|rewrite|translate", "target":"string", "replacement":"string"}
}
EXAMPLES:
- User: "Delete hello" -> {"success":true, "message":"Word 'hello' excised.", "updatedParagraphs":["..."], "affectedIndices":[...]}
- User: "Add 'and more' to the end" -> {"success":true, "message":"Text appended.", "updatedParagraphs":["..."], "affectedIndices":[...]}
`);

const CHAT_SYSTEM_PROMPT = minifyPrompt(`
You are a friendly, clear, and highly helpful AI assistant for a document editor.
The user is currently editing a document, and you are here to chat, provide insights, and answer their questions directly.
IMPORTANT: You are in "Chat Mode". Do NOT attempt to edit the document. 
If the user asks to "delete a paragraph" or "replace text", politely inform them that you are currently in chat mode and they should use voice commands or manual editing for that.
Speak in a normal, natural, and easy-to-understand conversational tone. Do not use overly complex or poetic words. Keep it simple.
`);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function detectLanguage(text: string): Promise<string> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Authentication is required.");

  const response = await fetch(`${backendUrl}/nlp/detect-language`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`Language detection failed: ${err}`);
  }

  const result = await response.json();
  return result.detected_name || result.detected_code || "Unknown";
}

export async function processChatOnly(
  message: string,
  paragraphs: string[],
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) return "Authentication is required. Please log in.";

  const documentContext = buildSmartDocumentContext(paragraphs, message, 5);

  try {
    const response = await fetchWithFallback(backendUrl, token, (model) => ({
      model,
      stream: !!onChunk,
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Document Context (for reference):\n${documentContext}\n\nUser Message: "${message}"`,
        },
      ],
    }));

    if (!onChunk) {
      const data = await response.json();
      return (
        data.choices?.[0]?.message?.content?.trim() ||
        "No response received from the AI service."
      );
    }

    if (!response.body)
      throw new Error("No response body available for streaming.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices?.[0]?.delta?.content || "";
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch (e) {
            // Ignore parse errors from incomplete lines
          }
        }
      }
    }
    return fullText.trim() || "No response received from the AI service.";
  } catch (error) {
    console.error("Chat API Error:", error);
    const errMsg = error instanceof Error ? error.message.toLowerCase() : "";
    if (
      errMsg.includes("429") ||
      errMsg.includes("rate limit") ||
      errMsg.includes("rate-limited")
    ) {
      return "AI Rate Limit Reached! Please wait a few seconds before chatting again.";
    }
    return "The AI service is currently busy across all providers. Please try again in a moment.";
  }
}

export async function processCommandWithAI(
  command: string,
  paragraphs: string[],
  retries = 1,
): Promise<CommandResult> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return {
      success: false,
      message: "Authentication is required. Please log in.",
      updatedParagraphs: paragraphs,
    };
  }

  // ── Deduplication: skip if same command fired within 3s ──────────────────
  if (dedupe.isDuplicate(command)) {
    console.info("Token_Optimizer: Duplicate command blocked.", command);
    return {
      success: false,
      message: "Duplicate command ignored. Please wait a moment.",
      updatedParagraphs: paragraphs,
    };
  }

  // ── Cache lookup ─────────────────────────────────────────────────────────
  const fingerprint = docFingerprint(paragraphs);
  const cached = commandCache.get(command, fingerprint);
  if (cached) {
    console.info("Token_Optimizer: Cache HIT — no API call needed.");
    return cached as CommandResult;
  }

  // ── Build optimised context (smart windowing + per-para truncation) ──────
  const documentContext = buildSmartDocumentContext(paragraphs, command, 12);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `Scribe Core: Processing request (attempt ${attempt + 1})...`,
        command,
      );

      const response = await fetchWithFallback(backendUrl, token, (model) => ({
        model,
        max_tokens: 1024,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Command: "${command}"\n\nDocument:\n${documentContext}`,
          },
        ],
      }));

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || "{}";

      try {
        const cleaned = aiContent.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleaned);
        const result: CommandResult = {
          ...parsedResult,
          updatedParagraphs: parsedResult.updatedParagraphs || paragraphs,
        };
        // ── Cache the successful result ──────────────────────────────────
        if (result.success) {
          commandCache.set(command, fingerprint, result);
        }
        return result;
      } catch {
        console.error("AI Response Parsing Error:", aiContent);
        return {
          success: false,
          message: "The AI response could not be parsed.",
          updatedParagraphs: paragraphs,
        };
      }
    } catch (error) {
      if (attempt === retries) {
        console.error("AI Direct API Error:", error);
        const errMsg =
          error instanceof Error ? error.message.toLowerCase() : "";
        let displayMessage =
          "All AI providers are currently busy. Please try again in a moment.";
        if (
          errMsg.includes("429") ||
          errMsg.includes("rate limit") ||
          errMsg.includes("rate-limited")
        ) {
          displayMessage =
            "AI Rate Limit Reached! Please wait a few seconds before your next command.";
        }
        return {
          success: false,
          message: displayMessage,
          updatedParagraphs: paragraphs,
        };
      }
      await delay((attempt + 1) * 2000);
    }
  }

  return {
    success: false,
    message: "Unknown error.",
    updatedParagraphs: paragraphs,
  };
}

const SELECTION_SYSTEM_PROMPT = minifyPrompt(`
You are the "Gilded Scribe", an elite AI voice editor assistant.
The user has selected a specific portion of their document (provided as HTML) and issued a voice command to edit ONLY that selection.
RULES:
1. Return ONLY the modified HTML. Do NOT return markdown formatting (no \`\`\`html tags), do NOT explain your reasoning.
2. Preserve all existing HTML formatting (bold, italics, headings, tables, etc.) unless the voice command explicitly asks to change it.
3. Apply the user's voice command to the selected HTML.
4. If the command asks to "simplify", "rewrite", or "translate", modify the text but keep the structural HTML tags intact if possible.
5. If the voice command asks to delete, remove, or clear the text, return exactly the word: <DELETE>
6. If the command is unrelated or unclear, return the original HTML unmodified.
`);

export async function processSelectionEditWithAI(
  selectedHtml: string,
  voiceCommand: string,
  retries = 1,
): Promise<string> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("Authentication is required. Please log in.");
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `Scribe Core: Processing selection edit (attempt ${attempt + 1})...`,
        voiceCommand,
      );

      const response = await fetchWithFallback(backendUrl, token, (model) => ({
        model,
        max_tokens: 1500,
        temperature: 0.3, // Slightly higher for rewriting, but low enough to follow strict instructions
        messages: [
          { role: "system", content: SELECTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Voice Command: "${voiceCommand}"\n\nSelected HTML to edit:\n${selectedHtml}`,
          },
        ],
      }));

      const data = await response.json();
      let aiContent = data.choices?.[0]?.message?.content || "";

      // Clean up markdown blocks if the AI accidentally adds them
      aiContent = aiContent
        .replace(/^```html\n?/, "")
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      if (aiContent === "<DELETE>" || !aiContent) {
        return "<DELETE>";
      }

      return aiContent;
    } catch (error) {
      if (attempt === retries) {
        console.error("Selection Edit API Error:", error);
        const errMsg =
          error instanceof Error ? error.message.toLowerCase() : "";
        if (
          errMsg.includes("429") ||
          errMsg.includes("rate limit") ||
          errMsg.includes("rate-limited")
        ) {
          throw new Error("AI Rate Limit Reached! Please wait a few seconds.");
        }
        throw new Error(
          "All AI providers are currently busy. Please try again.",
        );
      }
      await delay((attempt + 1) * 2000);
    }
  }

  return selectedHtml;
}
