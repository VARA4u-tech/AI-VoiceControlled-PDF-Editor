import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { franc } from "franc";

const LANGUAGE_MAP: Record<string, string> = {
  hin: "Hindi",
  tel: "Telugu",
  eng: "English",
  tam: "Tamil",
  mal: "Malayalam",
  kan: "Kannada",
  mar: "Marathi",
  guj: "Gujarati",
  ben: "Bengali",
  pan: "Punjabi",
  urd: "Urdu",
  fra: "French",
  spa: "Spanish",
  deu: "German",
};

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    try {
      await verifyToken(req);
    } catch (e: any) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { detail: "Text cannot be empty." },
        { status: 400 },
      );
    }

    // 3. Detect language using franc
    // franc returns ISO 639-3 codes (3 letters)
    const detectedCode = franc(text);

    if (detectedCode === "und") {
      return NextResponse.json(
        { detail: "Text is too short or ambiguous to detect language." },
        { status: 422 },
      );
    }

    const languageName = LANGUAGE_MAP[detectedCode] || detectedCode;

    // The frontend was expecting ISO 639-1 (2 letters), but since the frontend
    // just uses `detected_name` and `detected_code`, providing 3-letter is fine.
    return NextResponse.json({
      detected_code: detectedCode,
      detected_name: languageName,
      confidence: 1.0, // franc returns just the best match natively
      all_matches: [
        {
          language_code: detectedCode,
          language_name: languageName,
          probability: 1.0,
        },
      ],
    });
  } catch (error: any) {
    console.error("NLP detect-language Error:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
