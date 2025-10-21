// app/api/chat/search/route.ts
// Next.js 15 App Router API route voor AI chat search

import { NextRequest, NextResponse } from "next/server";
import { searchRelevantContext, formatContextForAI } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchRequest {
  query: string;
  assistantId: string;
  limit?: number;
  threshold?: number;
}

/**
 * POST /api/chat/search
 * Zoekt relevante context voor een chatbot vraag
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    // Validatie
    if (!body.query || !body.assistantId) {
      return NextResponse.json(
        { error: "Query and assistantId are required" },
        { status: 400 }
      );
    }

    // Voer search uit
    const results = await searchRelevantContext(body.query, body.assistantId, {
      limit: body.limit || 5,
      threshold: body.threshold || 0.7,
    });

    // Format voor AI
    const formattedContext = formatContextForAI(results);

    return NextResponse.json({
      success: true,
      results,
      context: formattedContext,
      count: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/search?query=...&assistantId=...
 * Alternatieve GET endpoint voor eenvoudige queries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const assistantId = searchParams.get("assistantId");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || !assistantId) {
      return NextResponse.json(
        { error: "Query and assistantId parameters are required" },
        { status: 400 }
      );
    }

    const results = await searchRelevantContext(query, assistantId, { limit });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
