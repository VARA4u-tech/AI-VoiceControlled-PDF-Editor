import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    try {
      await verifyToken(req);
    } catch (e: any) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }

    // 2. Read multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { detail: "No file uploaded." },
        { status: 400 },
      );
    }

    if (
      file.type !== "application/pdf" &&
      file.type !== "application/octet-stream"
    ) {
      return NextResponse.json(
        { detail: "Only PDF files are supported." },
        { status: 415 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { detail: "File too large. Maximum size is 25MB." },
        { status: 413 },
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { detail: "Uploaded PDF is empty." },
        { status: 400 },
      );
    }

    // 3. Extract text
    try {
      const data = await pdfParse(buffer);

      // pdf-parse doesn't perfectly segment by pages out of the box in the same way PyPDF2 does,
      // but it does provide the raw text with page breaks.
      // We will emulate the page-by-page structure for compatibility.
      const pagesText = data.text.split("\n\n\n"); // Approximate page splits

      const pages = pagesText
        .map((text, i) => ({
          page: i + 1,
          text: text.trim(),
        }))
        .filter((p) => p.text);

      const fullText = pages.map((p) => p.text).join("\n\n");

      return NextResponse.json({
        filename: file.name,
        total_pages: data.numpages,
        full_text: fullText,
        pages: pages,
      });
    } catch (e: any) {
      return NextResponse.json(
        { detail: `Failed to parse PDF: ${e.message}` },
        { status: 422 },
      );
    }
  } catch (error: any) {
    console.error("Document Extract Error:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}
