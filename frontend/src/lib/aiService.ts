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
 */

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
JSON format:
{
  "success": boolean,
  "message": "confirmation",
  "updatedParagraphs": string[],
  "affectedIndices": number[],
  "scribeResponse": {"type":"summary"|"stats"|"info", "content":"result", "title":"title"},
  "structuredData": {"action":"delete|replace|add", "target":"string", "replacement":"string"}
}
EXAMPLES:
- User: "Delete hello" -> {"success":true, "message":"Word 'hello' excised.", "updatedParagraphs":["..."], "affectedIndices":[...]}
- User: "Add 'and more' to the end" -> {"success":true, "message":"Text appended.", "updatedParagraphs":["..."], "affectedIndices":[...]}
`);

const CHAT_SYSTEM_PROMPT = minifyPrompt(`
You are the "Gilded Scribe", a wise and helpful assistant. 
The user is currently editing a document, and you are here to chat, provide insights, answer questions, or just keep them company.
IMPORTANT: You are in "Chat Mode". Do NOT attempt to edit the document. 
If the user asks to "delete a paragraph" or "replace text", politely inform them that you are currently in chat mode and they should use voice commands or manual editing for that.
Keep your responses helpful, concise, and slightly mystical in tone to match the Gilded Scribe aesthetic.
`);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function processChatOnly(
  message: string,
  paragraphs: string[],
): Promise<string> {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) return "Authentication is required. Please log in.";

  const documentContext = buildSmartDocumentContext(paragraphs, message, 5);

  try {
    const response = await fetch(`${backendUrl}/edit/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash:free",
        max_tokens: 512,
        temperature: 0.7,
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Document Context (for reference):\n${documentContext}\n\nUser Message: "${message}"`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("API Connection failed.");

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content?.trim() || "No response received from the AI service."
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return "The AI service encountered an error. Please try again.";
  }
}

export async function processCommandWithAI(
  command: string,
  paragraphs: string[],
  retries = 2,
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

      const response = await fetch(`${backendUrl}/edit/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          max_tokens: 1024, // hard cap — free tier protection
          temperature: 0.2, // lower = more deterministic, fewer wasted tokens
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Command: "${command}"\n\nDocument:\n${documentContext}`,
            },
          ],
        }),
      });

      // 429 = rate limited
      if (response.status === 429) {
        const waitTime = (attempt + 1) * 3000;
        console.warn(`Rate limited. Retrying in ${waitTime / 1000}s...`);
        if (attempt < retries) {
          await delay(waitTime);
          continue;
        }
        return {
          success: false,
          message:
            "The service is busy. Please try again in a moment.",
          updatedParagraphs: paragraphs,
        };
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API Connection failed.");
      }

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
        return {
          success: false,
          message: `Connection unstable: ${error instanceof Error ? error.message : "Service error"}`,
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
