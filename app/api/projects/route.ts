import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  getPaginationParams,
  getPrismaOptions,
  createPaginatedResponse,
} from "@/lib/pagination";

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

/**
 * GET /api/projects
 * List all projects for the current user's company
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load current user with company
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser?.companyId) {
      return NextResponse.json(
        { error: "User must belong to a company" },
        { status: 403 }
      );
    }

    // Parse pagination parameters
    const pagination = getPaginationParams(request);

    const where = { companyId: currentUser.companyId };

    // Get total count
    const total = await db.project.count({ where });

    // Get projects with document count
    const projects = await db.project.findMany({
      where,
      include: {
        _count: {
          select: { documents: true, assistants: true },
        },
      },
      orderBy: { createdAt: "desc" },
      ...getPrismaOptions(pagination),
    });

    return NextResponse.json(
      createPaginatedResponse(projects, pagination.page, pagination.limit, total)
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load current user with company
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser?.companyId) {
      return NextResponse.json(
        { error: "User must belong to a company" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Create the project
    const project = await db.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        companyId: currentUser.companyId,
        createdById: currentUser.id,
      },
      include: {
        _count: {
          select: { documents: true, assistants: true },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
