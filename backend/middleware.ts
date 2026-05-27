import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "https://ai-voice-controlled-pdf-editor.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const CORS_HEADERS = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, HTTP-Referer, X-Title",
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
      },
    });
  }

  // For actual requests, add CORS headers to the response
  const response = NextResponse.next();
  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
