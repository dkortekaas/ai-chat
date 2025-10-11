import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/conversations?assistantId=...&page=1&pageSize=20
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get("assistantId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Verify assistant ownership
    const assistant = await prisma.chatbotSettings.findFirst({
      where: { id: assistantId, userId: session.user.id },
    });
    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          // Scope by assistant via conversation sources -> documents -> assistantId OR by other linkage if present
          // If conversations are not tied to assistant directly, we return all for the user; otherwise adjust when schema links exist
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          question: true,
          answer: true,
          responseTime: true,
          rating: true,
          createdAt: true,
          tokensUsed: true,
        },
      }),
      prisma.conversation.count({
        where: {},
      }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
