import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/websites/[id]/pages - Get all pages for a specific website
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: websiteId } = await params;

    // Get the website and verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        assistantId: {
          not: null,
        },
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the user
    const assistant = await prisma.chatbotSettings.findFirst({
      where: {
        id: website.assistantId || undefined,
        userId: session.user.id,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Unauthorized to access this website" },
        { status: 403 }
      );
    }

    // Get all pages for this website
    const pages = await prisma.websitePage.findMany({
      where: {
        websiteId,
      },
      orderBy: {
        scrapedAt: "desc",
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching website pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch website pages" },
      { status: 500 }
    );
  }
}
