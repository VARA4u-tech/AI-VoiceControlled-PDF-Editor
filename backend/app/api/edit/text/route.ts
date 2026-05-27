import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    try {
      await verifyToken(req);
    } catch (e: any) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { detail: "OpenRouter API key not configured on server" },
        { status: 500 },
      );
    }

    // 2. Parse request body
    const body = await req.json();

    // We forward the exact body to OpenRouter
    const openRouterRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-voice-editor.app",
          "X-Title": "AI Voice Editor",
        },
        body: JSON.stringify(body),
      },
    );

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      return NextResponse.json(
        { detail: `OpenAI API error: ${errorText}` },
        { status: openRouterRes.status === 401 ? 502 : openRouterRes.status },
      );
    }

    const data = await openRouterRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Text Edit Proxy Error:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
