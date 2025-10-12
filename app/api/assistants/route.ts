import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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

    const assistants = await prisma.chatbotSettings.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assistants);
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return NextResponse.json(
      { error: "Failed to fetch assistants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const assistant = await prisma.chatbotSettings.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: name || "AI Assistent",
        description: description || "",
        welcomeMessage: welcomeMessage || "Hallo! Hoe kan ik je helpen?",
        placeholderText: placeholderText || "Stel een vraag...",
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#1E40AF",
        fontFamily: fontFamily || "Inter",
        assistantName: assistantName || name || "AI Assistent",
        assistantSubtitle: assistantSubtitle || "We helpen je graag verder!",
        selectedAvatar: selectedAvatar || "chat-bubble",
        tone: tone || "professional",
        language: language || "nl",
        maxResponseLength: maxResponseLength || 500,
        temperature: temperature || 0.7,
        fallbackMessage:
          fallbackMessage ||
          "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie.",
        position: position || "bottom-right",
        showBranding: showBranding !== undefined ? showBranding : true,
        isActive: isActive !== undefined ? isActive : true,
        allowedDomains: allowedDomains || [],
        rateLimit: rateLimit || 10,
        apiKey: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(assistant, { status: 201 });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json(
      { error: "Failed to create assistant" },
      { status: 500 }
    );
  }
}
