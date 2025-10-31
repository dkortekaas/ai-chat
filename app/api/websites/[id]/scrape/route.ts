import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { WebsiteScraper } from "@/lib/WebsiteScraper";
import { chunkWebsiteContent } from "@/lib/chunking";
import {
  generateEmbeddings,
  estimateTokens,
  EMBEDDINGS_ENABLED,
} from "@/lib/openai";

const prisma = new PrismaClient();

// POST /api/websites/[id]/scrape - Manually trigger scraping for a website
export async function POST(
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
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the user
    if (!website.assistantId) {
      return NextResponse.json(
        { error: "Website has no associated assistant" },
        { status: 400 }
      );
    }

    const assistant = await prisma.chatbotSettings.findFirst({
      where: {
        id: website.assistantId,
        userId: session.user.id,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Unauthorized to access this website" },
        { status: 403 }
      );
    }

    // Start scraping in the background
    scrapeWebsiteInBackground(websiteId, website.url);

    return NextResponse.json({
      message: "Scraping started",
      status: "SYNCING",
    });
  } catch (error) {
    console.error("Error starting website scraping:", error);
    return NextResponse.json(
      { error: "Failed to start scraping" },
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

    // Clear existing pages
    await prisma.websitePage.deleteMany({
      where: { websiteId },
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

    // Count successfully scraped pages (pages with content and no error)
    const successfulPages = scrapedData.pages.filter(
      (page) => page.content.trim().length > 0 && !page.error
    );

    // Only mark as ERROR if NO pages were successfully scraped
    // If at least some pages succeeded, mark as COMPLETED (partial success is still success)
    const status = successfulPages.length > 0 ? "COMPLETED" : "ERROR";

    // Update website with scraped content
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: status,
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
              id: websitePage.id,
              url: websitePage.url,
              title: websitePage.title,
              content: websitePage.content,
              scrapedAt: websitePage.scrapedAt,
              links: (websitePage.links as string[]) || [],
            },
            { id: websiteId, url: websitePage.url }
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

    // Batch insert all chunks at once for better performance
    await (
      prisma.documentChunk as unknown as {
        createMany: (args: unknown) => Promise<unknown>;
      }
    ).createMany({
      data: documentChunks,
    });

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
