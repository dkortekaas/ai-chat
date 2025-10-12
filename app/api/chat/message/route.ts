import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EMBEDDINGS_ENABLED } from "@/lib/openai";
import { semanticSearch, hybridSearch } from "@/lib/VectorSearch";
import { z } from "zod";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Chatbot-API-Key",
};

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
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // For testing, try to get the first available assistant
    let chatbotSettings;
    if (
      apiKey === "cbk_test_123456789" ||
      apiKey === "8ae4530d-03fe-4128-9e91-47bc9d66c599"
    ) {
      try {
        // Get the first available assistant for testing
        const firstAssistant = await db.chatbotSettings.findFirst({
          include: {
            users: true,
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
            users: true,
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
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Check rate limiting (basic implementation)
    // TODO: Implement proper rate limiting with Redis

    // Generate session ID if not provided
    const finalSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Search for relevant documents and FAQs
    let sources: any[] = [];
    let answer =
      chatbotSettings.fallbackMessage ||
      "Sorry, ik kan je vraag niet beantwoorden. Probeer het opnieuw.";

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

      // 1. First, try to find FAQ matches (more flexible search)
      const questionWords = question
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 2);
      console.log("🔍 Searching for keywords:", questionWords);

      const faqMatches = await db.fAQ.findMany({
        where: {
          assistantId: chatbotSettings.id,
          enabled: true,
          OR: [
            // Exact match
            {
              question: {
                contains: question,
                mode: "insensitive" as const,
              },
            },
            {
              answer: {
                contains: question,
                mode: "insensitive" as const,
              },
            },
            // Keyword matches
            ...questionWords.map((word) => ({
              question: {
                contains: word,
                mode: "insensitive" as const,
              },
            })),
            ...questionWords.map((word) => ({
              answer: {
                contains: word,
                mode: "insensitive" as const,
              },
            })),
          ],
        },
        orderBy: { order: "asc" },
        take: 5,
      });

      console.log("📋 FAQ matches found:", faqMatches.length);
      if (faqMatches.length > 0) {
        // Find the best match based on relevance
        let bestMatch = faqMatches[0];
        let bestScore = 0;

        for (const faq of faqMatches) {
          let score = 0;

          // Check for exact question match
          if (faq.question.toLowerCase().includes(question.toLowerCase())) {
            score += 10;
          }

          // Check for exact answer match
          if (faq.answer.toLowerCase().includes(question.toLowerCase())) {
            score += 8;
          }

          // Check for keyword matches in question
          const questionKeywords = questionWords.filter((word) =>
            faq.question.toLowerCase().includes(word.toLowerCase())
          );
          score += questionKeywords.length * 3;

          // Check for keyword matches in answer
          const answerKeywords = questionWords.filter((word) =>
            faq.answer.toLowerCase().includes(word.toLowerCase())
          );
          score += answerKeywords.length * 2;

          // Check for specific contact-related keywords
          const contactKeywords = [
            "contact",
            "telefoon",
            "adres",
            "email",
            "bereik",
            "bereikbaar",
            "neem",
            "op",
          ];
          const hasContactKeywords = contactKeywords.some(
            (keyword) =>
              question.toLowerCase().includes(keyword) &&
              (faq.question.toLowerCase().includes(keyword) ||
                faq.answer.toLowerCase().includes(keyword))
          );
          if (hasContactKeywords) {
            score += 5;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
          }
        }

        console.log(
          "✅ Using FAQ match:",
          bestMatch.question,
          "Score:",
          bestScore
        );

        // Only use FAQ if it has a reasonable score
        if (bestScore >= 2) {
          answer = bestMatch.answer;
          sources = [
            {
              documentName: bestMatch.question,
              documentType: "FAQ",
              relevanceScore: Math.min(bestScore / 10, 1.0),
            },
          ];
        } else {
          console.log("❌ FAQ match score too low, trying other methods");
        }
      } else if (EMBEDDINGS_ENABLED) {
        console.log("🧠 EMBEDDINGS_ENABLED:", EMBEDDINGS_ENABLED);
        // 2. If no FAQ match, try vector search in documents
        try {
          const searchResults = await hybridSearch(question, {
            limit: 5,
            semanticWeight: 0.6,
            documentTypes: ["URL", "PDF", "DOCX", "TXT"],
          });

          console.log("🔍 Vector search results:", searchResults.length);
          if (searchResults.length > 0) {
            console.log("✅ Using vector search results");
            // Combine the most relevant chunks into an answer
            const relevantChunks = searchResults.slice(0, 3);
            const combinedContent = relevantChunks
              .map((chunk) => chunk.content)
              .join("\n\n")
              .substring(0, 2000); // Limit to avoid token limits

            answer = `Gebaseerd op onze documentatie:\n\n${combinedContent}`;

            sources = searchResults.map((result) => ({
              documentName: result.documentName,
              documentType: result.documentType,
              relevanceScore: result.similarity,
              url: result.url,
            }));
          }
        } catch (vectorError) {
          console.error("❌ Vector search error:", vectorError);

          // Try keyword search in websites/documents
          console.log("🔍 Trying keyword search in documents...");
          try {
            const keywordResults = await db.document.findMany({
              where: {
                status: "COMPLETED",
                type: { in: ["URL", "PDF", "DOCX", "TXT"] },
                OR: questionWords.map((word) => ({
                  name: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                })),
              },
              include: {
                chunks: {
                  where: {
                    OR: questionWords.map((word) => ({
                      content: {
                        contains: word,
                        mode: "insensitive" as const,
                      },
                    })),
                  },
                  take: 3,
                },
              },
              take: 3,
            });

            if (keywordResults.length > 0) {
              console.log(
                "✅ Found documents with keyword matches:",
                keywordResults.length
              );
              const relevantChunks = keywordResults
                .flatMap((doc) => doc.chunks)
                .slice(0, 3);

              if (relevantChunks.length > 0) {
                const combinedContent = relevantChunks
                  .map((chunk) => chunk.content)
                  .join("\n\n")
                  .substring(0, 1500);

                answer = `Gebaseerd op onze website content:\n\n${combinedContent}`;

                sources = keywordResults.map((doc) => ({
                  documentName: doc.name,
                  documentType: doc.type,
                  relevanceScore: 0.8,
                  url: doc.url,
                }));
              }
            }
          } catch (keywordError) {
            console.error("❌ Keyword search error:", keywordError);
          }

          // Fall back to simple keyword search in FAQs
          const keywordFaqs = await db.fAQ.findMany({
            where: {
              assistantId: chatbotSettings.id,
              enabled: true,
              OR: [
                {
                  question: {
                    contains: question.split(" ")[0], // Search for first word
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
            take: 1,
          });

          if (keywordFaqs.length > 0) {
            answer = keywordFaqs[0].answer;
            sources = [
              {
                documentName: keywordFaqs[0].question,
                documentType: "FAQ",
                relevanceScore: 0.7,
              },
            ];
          }
        }
      } else {
        console.log("🔄 EMBEDDINGS disabled, using keyword search fallback");

        // Try keyword search in documents first
        console.log("🔍 Trying keyword search in documents...");
        try {
          const keywordResults = await db.document.findMany({
            where: {
              status: "COMPLETED",
              type: { in: ["URL", "PDF", "DOCX", "TXT"] },
              OR: questionWords.map((word) => ({
                name: {
                  contains: word,
                  mode: "insensitive" as const,
                },
              })),
            },
            include: {
              chunks: {
                where: {
                  OR: questionWords.map((word) => ({
                    content: {
                      contains: word,
                      mode: "insensitive" as const,
                    },
                  })),
                },
                take: 3,
              },
            },
            take: 3,
          });

          if (keywordResults.length > 0) {
            console.log(
              "✅ Found documents with keyword matches:",
              keywordResults.length
            );
            const relevantChunks = keywordResults
              .flatMap((doc) => doc.chunks)
              .slice(0, 3);

            if (relevantChunks.length > 0) {
              const combinedContent = relevantChunks
                .map((chunk) => chunk.content)
                .join("\n\n")
                .substring(0, 1500);

              answer = `Gebaseerd op onze website content:\n\n${combinedContent}`;

              sources = keywordResults.map((doc) => ({
                documentName: doc.name,
                documentType: doc.type,
                relevanceScore: 0.8,
                url: doc.url,
              }));
            }
          }
        } catch (keywordError) {
          console.error("❌ Keyword search error:", keywordError);
        }

        // 3. Fallback: simple keyword search in FAQs if embeddings disabled
        const keywordFaqs = await db.fAQ.findMany({
          where: {
            assistantId: chatbotSettings.id,
            enabled: true,
            OR: questionWords.map((word) => ({
              question: {
                contains: word,
                mode: "insensitive" as const,
              },
            })),
          },
          take: 3,
        });

        if (keywordFaqs.length > 0) {
          // Find the best FAQ match using the same scoring logic
          let bestFaq = keywordFaqs[0];
          let bestScore = 0;

          for (const faq of keywordFaqs) {
            let score = 0;

            // Check for keyword matches in question
            const questionKeywords = questionWords.filter((word) =>
              faq.question.toLowerCase().includes(word.toLowerCase())
            );
            score += questionKeywords.length * 3;

            // Check for specific contact-related keywords
            const contactKeywords = [
              "contact",
              "telefoon",
              "adres",
              "email",
              "bereik",
              "bereikbaar",
              "neem",
              "op",
            ];
            const hasContactKeywords = contactKeywords.some(
              (keyword) =>
                question.toLowerCase().includes(keyword) &&
                (faq.question.toLowerCase().includes(keyword) ||
                  faq.answer.toLowerCase().includes(keyword))
            );
            if (hasContactKeywords) {
              score += 5;
            }

            if (score > bestScore) {
              bestScore = score;
              bestFaq = faq;
            }
          }

          if (bestScore >= 1) {
            answer = bestFaq.answer;
            sources = [
              {
                documentName: bestFaq.question,
                documentType: "FAQ",
                relevanceScore: Math.min(bestScore / 10, 1.0),
              },
            ];
          }
        }
      }

      // 4. Handle greeting messages
      if (
        question.toLowerCase().includes("hallo") ||
        question.toLowerCase().includes("hello") ||
        question.toLowerCase().includes("hi")
      ) {
        answer =
          chatbotSettings.welcomeMessage || "Hallo! Hoe kan ik je helpen?";
        sources = [];
      }

      // 5. If no good answer found, provide a helpful fallback
      if (
        !answer ||
        answer ===
          "Sorry, ik kan deze vraag niet beantwoorden op basis van de beschikbare informatie."
      ) {
        // Try to provide a more helpful response based on the question
        if (
          question.toLowerCase().includes("contact") ||
          question.toLowerCase().includes("telefoon") ||
          question.toLowerCase().includes("adres")
        ) {
          answer =
            "Voor contactinformatie kunt u het beste direct contact opnemen met ons team. Ik kan u helpen met andere vragen over onze diensten.";
        } else if (
          question.toLowerCase().includes("prijs") ||
          question.toLowerCase().includes("kost")
        ) {
          answer =
            "Voor prijsinformatie kunt u het beste contact opnemen met ons team voor een offerte op maat.";
        } else {
          answer =
            "Ik kan u helaas niet helpen met deze specifieke vraag. Probeer het anders te formuleren of neem contact op met ons team voor persoonlijke assistentie.";
        }
        sources = [];
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
      const estimatedTokens = Math.ceil((question.length + answer.length) / 4); // Rough estimate

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
            totalTokens: { increment: estimatedTokens },
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
      const assistantMessage = await db.conversationMessage.create({
        data: {
          sessionId: finalSessionId,
          messageType: "ASSISTANT",
          content: answer,
          responseTime: Date.now() - startTime,
          tokensUsed: estimatedTokens,
          model: "gpt-3.5-turbo", // TODO: Get actual model used
          confidence: 0.8, // TODO: Calculate actual confidence
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
          conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          answer,
          sources,
          responseTime: Date.now(), // TODO: Calculate actual response time
          sessionId: finalSessionId,
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
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
