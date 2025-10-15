import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Starting snippets API call...");
    console.log("Prisma client:", db ? "initialized" : "undefined");

    // Test database connection first
    await db.$connect();
    console.log("Database connected successfully");

    // Get all categories with their snippets
    console.log("Querying snippet categories...");
    const categories = await (db as any).snippetCategory.findMany({
      where: {
        enabled: true,
      },
      include: {
        snippets: {
          where: {
            enabled: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    console.log(`Found ${categories.length} categories`);

    // Transform the data to match the expected format
    const transformedCategories = categories.map((category: any) => ({
      id: category.name === "all" ? "all" : category.name,
      label: category.label,
      count: category.snippets.length,
    }));

    // Add the "All" category with total count
    const allCategory = {
      id: "all",
      label: "All",
      count: categories.reduce(
        (total: number, cat: any) => total + cat.snippets.length,
        0
      ),
    };

    // Ensure "All" is first
    const finalCategories = [
      allCategory,
      ...transformedCategories.filter((cat: any) => cat.id !== "all"),
    ];

    // Get all snippets for the "All" category
    const allSnippets = categories.flatMap((category: any) =>
      category.snippets.map((snippet: any) => ({
        id: snippet.id,
        text: snippet.text,
        category: category.label,
        title: snippet.title,
      }))
    );

    console.log(
      `Returning ${finalCategories.length} categories and ${allSnippets.length} snippets`
    );

    return NextResponse.json({
      categories: finalCategories,
      snippets: allSnippets,
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch snippets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}
