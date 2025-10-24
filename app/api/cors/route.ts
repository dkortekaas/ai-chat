import { NextRequest, NextResponse } from "next/server";

/**
 * Generic CORS preflight handler
 * Note: This is a fallback handler. Specific API routes should implement
 * their own CORS validation based on chatbot allowedDomains settings.
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Chatbot-API-Key",
      "Access-Control-Max-Age": "86400",
    },
  });
}
