import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
// import { EMBEDDINGS_ENABLED } from "@/lib/openai";
// import { semanticSearch } from "@/lib/VectorSearch";
import { z } from "zod";

const messageSchema = z.object({
  question: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, sessionId, metadata } = messageSchema.parse(body);

    // Get API key from headers
    const apiKey = request.headers.get("X-Chatbot-API-Key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing API key" },
        { status: 401 }
      );
    }

    // For testing, try to get the first available assistant
    let chatbotSettings;
    if (apiKey === "cbk_test_123456789") {
      try {
        // Get the first available assistant for testing
        const firstAssistant = await db.chatbotSettings.findFirst({
          include: {
            user: true,
          },
        });

        if (firstAssistant) {
          chatbotSettings = firstAssistant;
        } else {
          // Fallback to mock data if no assistant found
          chatbotSettings = {
            id: "test_chatbot",
            name: "Test Bot",
            welcomeMessage: "Welkom bij de test chatbot! Hoe kan ik je helpen?",
            placeholderText: "Stel een test vraag...",
            primaryColor: "#FF6B6B",
            secondaryColor: "#FF5252",
            position: "bottom-right",
            showBranding: true,
            fallbackMessage:
              "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie.",
            isActive: true,
            user: { id: "test_user" },
          } as any;
        }
      } catch (error) {
        console.error("Error fetching test assistant:", error);
        // Fallback to mock data
        chatbotSettings = {
          id: "test_chatbot",
          name: "Test Bot",
          welcomeMessage: "Welkom bij de test chatbot! Hoe kan ik je helpen?",
          placeholderText: "Stel een test vraag...",
          primaryColor: "#FF6B6B",
          secondaryColor: "#FF5252",
          position: "bottom-right",
          showBranding: true,
          fallbackMessage:
            "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie.",
          isActive: true,
          user: { id: "test_user" },
        } as any;
      }
    } else {
      // For real API keys, try database lookup
      try {
        chatbotSettings = await db.chatbotSettings.findUnique({
          where: { apiKey },
          include: {
            user: true,
          },
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          { success: false, error: "Database connection error" },
          { status: 500 }
        );
      }
    }

    if (!chatbotSettings || !chatbotSettings.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Check rate limiting (basic implementation)
    // TODO: Implement proper rate limiting with Redis

    // Generate session ID if not provided
    const finalSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Search for relevant documents
    let sources: any[] = [];
    let answer = chatbotSettings.fallbackMessage;

    // For testing, provide a simple response without vector search
    if (
      question.toLowerCase().includes("hallo") ||
      question.toLowerCase().includes("hello")
    ) {
      answer = "Hallo! Welkom bij de test chatbot. Hoe kan ik je helpen?";
    } else if (
      question.toLowerCase().includes("help") ||
      question.toLowerCase().includes("hulp")
    ) {
      answer =
        "Ik kan je helpen met vragen over onze diensten. Stel gerust een vraag!";
    } else {
      answer = `Je vroeg: "${question}". Dit is een test response van de chatbot widget.`;
    }

    // Save conversation (optional - for analytics)
    // Temporarily disabled for testing
    // try {
    //   await db.conversation.create({
    //     data: {
    //       sessionId: finalSessionId,
    //       question,
    //       answer,
    //       userAgent: metadata?.userAgent,
    //       referrer: metadata?.referrer,
    //       responseTime: Date.now(), // TODO: Calculate actual response time
    //     },
    //   });
    // } catch (error) {
    //   console.error("Error saving conversation:", error);
    //   // Don't fail the request if saving fails
    // }

    return NextResponse.json({
      success: true,
      data: {
        conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        answer,
        sources,
        responseTime: Date.now(), // TODO: Calculate actual response time
        sessionId: finalSessionId,
      },
    });
  } catch (error) {
    console.error("Error in chat message endpoint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
