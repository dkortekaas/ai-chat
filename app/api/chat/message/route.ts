import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  EMBEDDINGS_ENABLED,
  generateAIResponse,
  getCachedOrGenerate,
} from "@/lib/openai";
import { searchRelevantContext, unifiedSearch } from "@/lib/search";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getCorsHeaders, validateCorsOrigin } from "@/lib/cors";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";
import { checkGracePeriod } from "@/lib/subscription";

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
  // Get origin early for CORS headers in error cases
  const origin = request.headers.get("origin");
  let corsHeaders = getCorsHeaders(origin, []);

  try {
    const body = await request.json();
    const { question, sessionId, metadata } = messageSchema.parse(body);

    // Get API key from headers
    const apiKey = request.headers.get("X-Chatbot-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing API key" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Lookup chatbot settings by API key
    let chatbotSettings;
    try {
      chatbotSettings = await db.chatbotSettings.findUnique({
        where: { apiKey },
        include: {
          users: {
            select: {
              id: true,
              subscriptionStatus: true,
              trialEndDate: true,
              subscriptionEndDate: true,
              subscriptionCanceled: true,
              isActive: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database connection error" },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!chatbotSettings || !chatbotSettings.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Check if user's subscription is active
    const user = chatbotSettings.users;
    if (!user || !user.isActive) {
      corsHeaders = getCorsHeaders(origin, chatbotSettings.allowedDomains);
      return NextResponse.json(
        { success: false, error: "User account is inactive" },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Check subscription status with grace period support
    const gracePeriodCheck = checkGracePeriod(
      user.subscriptionStatus,
      user.trialEndDate,
      user.subscriptionEndDate
    );

    // Only block access if grace period has ended
    if (gracePeriodCheck.shouldBlockAccess) {
      corsHeaders = getCorsHeaders(origin, chatbotSettings.allowedDomains);
      return NextResponse.json(
        {
          success: false,
          error:
            "Subscription expired. Please renew your subscription to continue using the chatbot.",
          gracePeriod: gracePeriodCheck.isInGracePeriod
            ? {
                active: true,
                daysRemaining: gracePeriodCheck.daysRemainingInGrace,
                message: gracePeriodCheck.message,
              }
            : { active: false },
        },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Log if in grace period (for monitoring)
    if (gracePeriodCheck.isInGracePeriod) {
      console.log(
        `⚠️ Widget used during grace period: ${user.id}, ${gracePeriodCheck.daysRemainingInGrace} days remaining`
      );
    }

    // Validate CORS origin against allowed domains
    const corsError = validateCorsOrigin(
      origin,
      chatbotSettings.allowedDomains
    );
    corsHeaders = getCorsHeaders(origin, chatbotSettings.allowedDomains);

    if (corsError) {
      return NextResponse.json(
        { success: false, error: "Origin not allowed" },
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Check rate limiting
    // Use API key as the rate limit key, with limit from chatbot settings
    const rateLimit = chatbotSettings.rateLimit || 10; // requests per minute
    const rateLimitResult = checkRateLimit(apiKey, rateLimit, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...getRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    // Generate session ID if not provided - use crypto for security
    const finalSessionId =
      sessionId || `session_${randomBytes(16).toString("hex")}`;

    // Search for relevant information in all knowledge base tables
    let sources: any[] = [];
    let answer =
      "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie in onze knowledge base.";
    let tokensUsed = 0;
    let confidence = 0;
    let finalTokensUsed = 0;
    let assistantMessage: any = null;

    try {
      console.log("🔍 Searching for question:", question);
      console.log("🤖 Chatbot ID:", chatbotSettings.id);

      // Check if we have any FAQs for this assistant
      const totalFaqs = await db.fAQ.count({
        where: { assistantId: chatbotSettings.id },
      });
      console.log("📊 Total FAQs in database for this assistant:", totalFaqs);

      // If no FAQs exist, create some test data
      if (totalFaqs === 0) {
        console.log("🔧 Creating test FAQ data...");
        try {
          await db.fAQ.createMany({
            data: [
              {
                assistantId: chatbotSettings.id,
                question: "Wat zijn de prijzen?",
                answer:
                  "Onze prijzen variëren afhankelijk van het pakket. Neem contact met ons op voor een offerte op maat.",
                enabled: true,
                order: 1,
              },
              {
                assistantId: chatbotSettings.id,
                question: "Hoe kan ik contact opnemen?",
                answer:
                  "Je kunt contact met ons opnemen via email (info@example.com) of telefoon (0123-456789).",
                enabled: true,
                order: 2,
              },
              {
                assistantId: chatbotSettings.id,
                question: "Wat zijn jullie openingstijden?",
                answer:
                  "Wij zijn geopend van maandag tot vrijdag van 9:00 tot 17:00 uur.",
                enabled: true,
                order: 3,
              },
            ],
          });
          console.log("✅ Test FAQ data created");
        } catch (createError) {
          console.error("❌ Error creating test FAQ data:", createError);
        }
      }

      // Search all knowledge base tables
      console.log("🧠 Searching all knowledge base tables...");
      console.log("🔍 Search parameters:", {
        question: question,
        assistantId: chatbotSettings.id,
        limit: 8,
        threshold: 0.5, // 50% minimum relevance voor unified search
        useAI: EMBEDDINGS_ENABLED,
      });

      const knowledgeResults = await searchRelevantContext(
        question,
        chatbotSettings.id,
        {
          limit: 8,
          threshold: 0.5, // 50% minimum relevance
        }
      );

      console.log("📚 Found knowledge base results:", knowledgeResults.length);
      if (knowledgeResults.length > 0) {
        console.log("📋 Knowledge base results details:");
        knowledgeResults.forEach((result, index) => {
          console.log(`  ${index + 1}. [${result.type}] ${result.title}`);
          console.log(`     Relevance: ${(result.score * 100).toFixed(1)}%`);
          console.log(
            `     Content preview: ${result.content.substring(0, 100)}...`
          );
          if (result.url) console.log(`     URL: ${result.url}`);
        });
      }

      if (knowledgeResults.length > 0) {
        // Use AI to generate response based on knowledge base context (with caching)
        try {
          console.log("🤖 Generating AI response...");
          console.log("⚙️ AI Settings:", {
            model: "gpt-4o-mini",
            temperature: chatbotSettings.temperature || 0.7,
            maxTokens: chatbotSettings.maxResponseLength || 500,
            language: chatbotSettings.language || "nl",
            tone: chatbotSettings.tone || "professional",
            hasCustomPrompt: !!chatbotSettings.mainPrompt,
          });

          const aiResponse = await getCachedOrGenerate(
            question,
            knowledgeResults,
            {
              model: "gpt-4o-mini",
              temperature: chatbotSettings.temperature || 0.7,
              maxTokens: chatbotSettings.maxResponseLength || 500,
              systemPrompt: chatbotSettings.mainPrompt || undefined,
              language: chatbotSettings.language || "nl",
              tone: chatbotSettings.tone || "professional",
            }
          );

          // Only accept AI response if confidence is high enough
          // Raised threshold to 0.5 (50%) for better quality responses
          if (aiResponse.confidence >= 0.5) {
            answer = aiResponse.answer;
            tokensUsed = aiResponse.tokensUsed;
            confidence = aiResponse.confidence;
            sources = aiResponse.sources; // Sources komen al van de cache functie

            // Update project context cache confidence if using projects
            if (chatbotSettings.projectId) {
              updateCacheConfidence(finalSessionId, confidence);
            }

            console.log("✅ AI response accepted (high confidence)");
            console.log("🎯 Final Answer:", answer);
            console.log(
              "📊 Confidence Score:",
              (confidence * 100).toFixed(1) + "%"
            );
            console.log("🔢 Tokens Used:", tokensUsed);
            console.log(
              "📚 Sources Used:",
              sources.length,
              "sources with relevance:",
              sources
                .map((s) => `${(s.relevanceScore * 100).toFixed(0)}%`)
                .join(", ")
            );
          } else {
            console.log(
              "❌ AI response rejected (low confidence):",
              (aiResponse.confidence * 100).toFixed(1) + "%"
            );
            console.log("🔄 Using fallback message instead");
            // Keep the default fallback message
          }
        } catch (aiError) {
          console.error("❌ AI response generation failed:", aiError);
          console.log("🔄 Falling back to best knowledge base result...");

          // Fallback to best knowledge base result
          const bestResult = knowledgeResults[0];
          if (bestResult) {
            answer = bestResult.content;
            sources = [
              {
                documentName: bestResult.title,
                documentType: bestResult.type,
                relevanceScore: bestResult.score,
                url: bestResult.url,
              },
            ];
            confidence = bestResult.score;
            console.log("✅ Using fallback result:", bestResult.title);
          }
        }
      }

      // If no knowledge base results found, don't provide fallback answers
      if (knowledgeResults.length === 0) {
        console.log(
          "❌ No knowledge base results found - will use fallback message"
        );
        // Keep the original fallback message - don't try other methods
      }

      // Handle greeting messages - only if no knowledge base results found
      if (
        knowledgeResults.length === 0 &&
        (question.toLowerCase().includes("hallo") ||
          question.toLowerCase().includes("hello") ||
          question.toLowerCase().includes("hi"))
      ) {
        console.log(
          "👋 Detected greeting message with no knowledge base results"
        );
        answer =
          chatbotSettings.welcomeMessage || "Hallo! Hoe kan ik je helpen?";
        sources = [];
        confidence = 1.0;
        console.log("✅ Using welcome message");
      }

      // If no good answer found, provide a clear fallback message
      if (
        !answer ||
        answer ===
          "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie."
      ) {
        console.log(
          "❌ No suitable answer found, using knowledge base fallback"
        );
        answer =
          "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie in onze knowledge base. Neem contact op met ons team voor persoonlijke assistentie.";
        sources = [];
        confidence = 0.1; // Very low confidence since no knowledge base info was found
      }
    } catch (searchError) {
      console.error("❌ Search error:", searchError);
      // Keep the fallback message if search fails
    }

    console.log("🎯 Final answer:", answer.substring(0, 100) + "...");
    console.log("📚 Sources found:", sources.length);

    // Save conversation session and messages
    try {
      const startTime = Date.now();
      finalTokensUsed =
        tokensUsed || Math.ceil((question.length + answer.length) / 4); // Use actual tokens or estimate

      // Get or create conversation session
      let conversationSession = await db.conversationSession.findUnique({
        where: { sessionId: finalSessionId },
      });

      if (!conversationSession) {
        // Create new session
        conversationSession = await db.conversationSession.create({
          data: {
            sessionId: finalSessionId,
            assistantId: chatbotSettings.id,
            projectId: chatbotSettings.projectId || undefined,
            ipAddress:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip"),
            userAgent: metadata?.userAgent,
            referrer: metadata?.referrer,
            startedAt: new Date(),
            lastActivity: new Date(),
            messageCount: 0,
            totalTokens: 0,
          },
        });
      } else {
        // Update existing session
        await db.conversationSession.update({
          where: { sessionId: finalSessionId },
          data: {
            lastActivity: new Date(),
            messageCount: { increment: 2 }, // User message + assistant response
            totalTokens: { increment: finalTokensUsed },
          },
        });
      }

      // Save user message
      const userMessage = await db.conversationMessage.create({
        data: {
          sessionId: finalSessionId,
          messageType: "USER",
          content: question,
          createdAt: new Date(),
        },
      });

      // Save assistant response
      assistantMessage = await db.conversationMessage.create({
        data: {
          sessionId: finalSessionId,
          messageType: "ASSISTANT",
          content: answer,
          responseTime: Date.now() - startTime,
          tokensUsed: finalTokensUsed,
          model: "gpt-4o-mini", // Updated model
          confidence: confidence,
          createdAt: new Date(),
        },
      });

      // Save sources for the assistant message
      if (sources && sources.length > 0) {
        for (const source of sources) {
          // Find document by name or create a reference
          const document = await db.document.findFirst({
            where: { name: source.documentName },
          });

          if (document) {
            await db.conversationSource.create({
              data: {
                messageId: assistantMessage.id,
                documentId: document.id,
                chunkContent: source.documentName,
                relevanceScore: source.relevanceScore || 0.8,
              },
            });
          }
        }
      }

      console.log("✅ Conversation saved successfully");
    } catch (error) {
      console.error("❌ Error saving conversation:", error);
      // Don't fail the request if saving fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          conversationId: `conv_${randomBytes(16).toString("hex")}`,
          messageId:
            assistantMessage?.id || `msg_${randomBytes(12).toString("hex")}`,
          answer,
          sources,
          responseTime: Date.now(),
          sessionId: finalSessionId,
          confidence: confidence,
          tokensUsed: finalTokensUsed,
          feedbackEnabled: true, // Enable feedback for this response
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in chat message endpoint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  // For OPTIONS preflight requests, we need to allow the request
  // The actual CORS validation happens in the POST request
  // This is standard practice since OPTIONS doesn't have API key yet
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Chatbot-API-Key",
      "Access-Control-Max-Age": "86400",
    },
  });
}
