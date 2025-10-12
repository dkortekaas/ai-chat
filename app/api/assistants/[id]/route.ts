import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Debug: Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const assistant = await prisma.chatbotSettings.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assistant);
  } catch (error) {
    console.error("Error fetching assistant:", error);
    return NextResponse.json(
      { error: "Failed to fetch assistant" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Debug: Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      welcomeMessage,
      placeholderText,
      primaryColor,
      secondaryColor,
      fontFamily,
      assistantName,
      assistantSubtitle,
      selectedAvatar,
      tone,
      language,
      maxResponseLength,
      temperature,
      fallbackMessage,
      position,
      showBranding,
      isActive,
      allowedDomains,
      rateLimit,
    } = body;

    // Check if assistant exists and belongs to user
    const existingAssistant = await prisma.chatbotSettings.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAssistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const assistant = await prisma.chatbotSettings.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        welcomeMessage,
        placeholderText,
        primaryColor,
        secondaryColor,
        fontFamily,
        assistantName,
        assistantSubtitle,
        selectedAvatar,
        tone,
        language,
        maxResponseLength,
        temperature,
        fallbackMessage,
        position,
        showBranding,
        isActive,
        allowedDomains,
        rateLimit,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(assistant);
  } catch (error) {
    console.error("Error updating assistant:", error);
    return NextResponse.json(
      { error: "Failed to update assistant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Debug: Check if user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    // Check if assistant exists and belongs to user
    const existingAssistant = await prisma.chatbotSettings.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAssistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    // Delete assistant (this will cascade delete all related data)
    await prisma.chatbotSettings.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Assistant deleted successfully" });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    return NextResponse.json(
      { error: "Failed to delete assistant" },
      { status: 500 }
    );
  }
}
