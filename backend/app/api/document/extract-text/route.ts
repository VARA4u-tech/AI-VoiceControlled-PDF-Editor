import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import rateLimit from "@/lib/rateLimit";
import { marked } from "marked";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

async function parsePdfWithLlamaParse(
  fileBuffer: ArrayBuffer,
  filename: string,
  apiKey: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer]), filename);

  const uploadRes = await fetch(
    "https://api.cloud.llamaindex.ai/api/parsing/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
  );

  if (!uploadRes.ok) {
    throw new Error(
      `Failed to upload to LlamaParse: ${await uploadRes.text()}`,
    );
  }

  const uploadData = await uploadRes.json();
  const jobId = uploadData.id;

  // Poll for completion (max 60 iterations = ~2 minutes)
  let status = "PENDING";
  let iterations = 0;
  while (
    (status === "PENDING" || status === "IN_PROGRESS") &&
    iterations < 60
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    iterations++;

    const statusRes = await fetch(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    );

    if (!statusRes.ok) {
      throw new Error(`Failed to check job status: ${await statusRes.text()}`);
    }

    const statusData = await statusRes.json();
    status = statusData.status;

    if (status === "ERROR") {
      throw new Error("LlamaParse job failed.");
    }
  }

  if (status !== "SUCCESS") {
    throw new Error("LlamaParse job timed out.");
  }

  // Get Markdown result
  const resultRes = await fetch(
    `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  if (!resultRes.ok) {
    throw new Error(
      `Failed to fetch parsed markdown: ${await resultRes.text()}`,
    );
  }

  const resultData = await resultRes.json();
  return resultData.markdown;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      await limiter.check(10, ip);
    } catch {
      return NextResponse.json(
        { detail: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      await verifyToken(req);
    } catch (e: any) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { detail: "No file uploaded." },
        { status: 400 },
      );
    }

    const apiKey = process.env.LLAMAPARSE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { detail: "LLAMAPARSE_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json(
        { detail: "File too large. Maximum size is 25MB." },
        { status: 413 },
      );
    }

    try {
      // 1. Extract markdown using LlamaParse REST API
      const markdown = await parsePdfWithLlamaParse(
        arrayBuffer,
        file.name,
        apiKey,
      );

      // 2. Convert to structural HTML using Marked
      const html = await marked.parse(markdown);

      return NextResponse.json({
        filename: file.name,
        full_text: html, // We return HTML so TipTap can render it directly
        raw_markdown: markdown,
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
