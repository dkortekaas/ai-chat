import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { WebsiteScraper } from "@/lib/WebsiteScraper";
import { chunkWebsiteContent } from "@/lib/chunking";
import {
  generateEmbeddings,
  estimateTokens,
  EMBEDDINGS_ENABLED,
} from "@/lib/openai";

const prisma = new PrismaClient();

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

    // Verify the assistant belongs to the user
    const assistant = await prisma.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        userId: session.user.id,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    const websites = await prisma.website.findMany({
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

    // Verify the assistant belongs to the user
    const assistant = await prisma.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        userId: session.user.id,
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
    const existingWebsite = await prisma.website.findFirst({
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

    const website = await prisma.website.create({
      data: {
        assistantId: assistantId,
        url: normalizedUrl,
        name: name || null,
        description: description || null,
        syncInterval: syncInterval || "never",
        status: "PENDING",
      },
    });

    // Start scraping in the background
    scrapeWebsiteInBackground(website.id, normalizedUrl);

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

// Background scraping function
async function scrapeWebsiteInBackground(websiteId: string, url: string) {
  try {
    // Update status to SYNCING
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: "SYNCING",
        lastSync: new Date(),
      },
    });

    const scraper = new WebsiteScraper(10, 2); // Max 10 pages, depth 2
    const scrapedData = await scraper.scrapeWebsite(url);

    // Combine all content from all pages
    const combinedContent = scrapedData.pages
      .map((page) => page.content)
      .filter((content) => content.trim().length > 0)
      .join("\n\n");

    // Extract all unique links
    const allLinks = scrapedData.pages
      .flatMap((page) => page.links)
      .filter((link, index, array) => array.indexOf(link) === index); // Remove duplicates

    // Update website with scraped content
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: scrapedData.errors.length > 0 ? "ERROR" : "COMPLETED",
        scrapedContent: combinedContent,
        scrapedLinks: allLinks,
        pageCount: scrapedData.pages.length,
        errorMessage:
          scrapedData.errors.length > 0 ? scrapedData.errors.join("; ") : null,
        lastSync: new Date(),
      },
    });

    // Save individual pages and create document chunks for RAG
    for (const page of scrapedData.pages) {
      const websitePage = await prisma.websitePage.create({
        data: {
          websiteId,
          url: page.url,
          title: page.title,
          content: page.content,
          links: page.links,
          status: page.error ? "ERROR" : "COMPLETED",
          errorMessage: page.error,
          scrapedAt: new Date(),
        },
      });

      // Create document chunks for RAG if content exists and OpenAI is available
      if (
        page.content &&
        page.content.trim().length > 0 &&
        !page.error &&
        process.env.OPENAI_API_KEY &&
        EMBEDDINGS_ENABLED
      ) {
        try {
          await createDocumentChunksForPage(
            {
              ...websitePage,
              links: Array.isArray(websitePage.links)
                ? websitePage.links.filter(
                    (link): link is string => typeof link === "string"
                  )
                : undefined,
            },
            { id: websiteId, url: url }
          );
        } catch (embeddingError) {
          console.warn(
            `Failed to create embeddings for page ${page.url}:`,
            embeddingError
          );
          // Continue without embeddings - the page is still saved
        }
      }
    }

    console.log(
      `Successfully scraped website ${url}: ${scrapedData.pages.length} pages`
    );
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);

    // Update website status to ERROR
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: "ERROR",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
        lastSync: new Date(),
      },
    });
  }
}

// Create document chunks for RAG system
async function createDocumentChunksForPage(
  websitePage: {
    id: string;
    url: string;
    title: string | null;
    content: string;
    scrapedAt: Date | null;
    links?: string[];
  },
  website: { id: string; url: string }
) {
  try {
    // Create a document entry for this page
    const document = await prisma.document.create({
      data: {
        name: websitePage.title || websitePage.url,
        originalName: websitePage.title || websitePage.url,
        type: "URL",
        url: websitePage.url,
        contentText: websitePage.content,
        status: "PROCESSING",
        metadata: {
          websiteId: website.id,
          websiteUrl: website.url,
          pageUrl: websitePage.url,
          scrapedAt: websitePage.scrapedAt,
          links: websitePage.links || [],
        },
      },
    });

    // Chunk the content
    const chunks = chunkWebsiteContent(
      websitePage.content,
      websitePage.url,
      websitePage.title || undefined,
      {
        chunkSize: 1000,
        chunkOverlap: 200,
        metadata: {
          websiteId: website.id,
          pageId: websitePage.id,
          documentId: document.id,
        },
      }
    );

    if (chunks.length === 0) {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "COMPLETED",
          errorMessage: "No chunks generated",
        },
      });
      return;
    }

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((chunk) => chunk.content);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Create document chunks with embeddings
    const documentChunks = chunks.map((chunk, index) => ({
      documentId: document.id,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      embedding: embeddings[index],
      tokenCount: estimateTokens(chunk.content),
      metadata: chunk.metadata,
    }));

    // Save chunks in batches
    for (const chunk of documentChunks) {
      await prisma.documentChunk.create({
        data: {
          ...chunk,
          metadata: chunk.metadata as Prisma.InputJsonValue,
        },
      });
    }

    // Update document status
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "COMPLETED",
        metadata: {
          ...((document.metadata as object) || {}),
          chunksCreated: chunks.length,
          totalTokens: documentChunks.reduce(
            (sum, chunk) => sum + chunk.tokenCount,
            0
          ),
        },
      },
    });

    console.log(`Created ${chunks.length} chunks for page: ${websitePage.url}`);
  } catch (error) {
    console.error(`Error creating chunks for page ${websitePage.url}:`, error);

    // Update document status to failed
    try {
      const existingDocument = await prisma.document.findFirst({
        where: {
          url: websitePage.url,
          type: "URL",
        },
      });

      if (existingDocument) {
        await prisma.document.update({
          where: { id: existingDocument.id },
          data: {
            status: "FAILED",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    } catch (updateError) {
      console.error("Error updating document status:", updateError);
    }
  }
}
