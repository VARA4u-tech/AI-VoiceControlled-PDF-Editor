import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import rateLimit from '@/lib/rateLimit';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    try {
      await limiter.check(20, ip); // 20 requests per minute
    } catch {
      return NextResponse.json({ detail: 'Rate limit exceeded' }, { status: 429 });
    }

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

    const body = await req.json();
    body.stream = true; // Force streaming

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

    // Return the stream directly
    return new Response(openRouterRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Text Stream Proxy Error:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
