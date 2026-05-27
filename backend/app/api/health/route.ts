import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "backend-next API",
    message: "Next.js API is running",
  });
}
