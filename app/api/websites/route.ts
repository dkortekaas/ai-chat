import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/websites - Get all websites for a specific assistant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get("assistantId");

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Load current user with company for scoping
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the company
    const assistant = await db.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        users: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        users: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    const websites = await db.website.findMany({
      where: {
        assistantId: assistantId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    );
  }
}

// POST /api/websites - Create a new website
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, name, description, syncInterval, assistantId } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Load current user with company for scoping
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the company
    const assistant = await db.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        users: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        users: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    // Normalize URL for comparison (remove trailing slash, convert to lowercase)
    const normalizedUrl = url.toLowerCase().replace(/\/$/, "");

    // Check if website already exists for this assistant
    const existingWebsite = await db.website.findFirst({
      where: {
        assistantId: assistantId,
        url: {
          equals: normalizedUrl,
          mode: "insensitive",
        },
      },
    });

    if (existingWebsite) {
      return NextResponse.json(
        {
          error:
            "This website URL has already been added to this assistant. Please choose a different URL or edit the existing one.",
          code: "DUPLICATE_URL",
        },
        { status: 409 }
      );
    }

    const website = await db.website.create({
      data: {
        assistantId: assistantId,
        url: normalizedUrl,
        name: name || null,
        description: description || null,
        syncInterval: syncInterval || "never",
        status: "PENDING",
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error: unknown) {
    // Prisma unique constraint -> duplicate URL
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Deze website URL is al toegevoegd. Kies een andere URL of bewerk de bestaande.",
          code: "DUPLICATE_URL",
        },
        { status: 409 }
      );
    }
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    );
  }
}
