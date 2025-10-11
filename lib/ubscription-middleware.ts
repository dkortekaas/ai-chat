// lib/subscription-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Middleware to check if user can create declarations based on subscription
 */
export async function checkDeclarationLimit(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Je moet ingelogd zijn" },
        { status: 401 }
      );
    }

    // Get user's company
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { error: "Je bent niet verbonden aan een bedrijf" },
        { status: 400 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Declaration limit check failed:", error);
    return NextResponse.json(
      {
        error:
          "Er is een fout opgetreden bij het controleren van je declaratie limiet",
      },
      { status: 500 }
    );
  }
}

/**
 * Middleware to check if user can invite other users based on subscription
 */
export async function checkInviteLimit(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Je moet ingelogd zijn" },
        { status: 401 }
      );
    }

    // Get user's company
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json(
        { error: "Je bent niet verbonden aan een bedrijf" },
        { status: 400 }
      );
    }

    // If check passes, continue to next middleware/handler
    return NextResponse.next();
  } catch (error) {
    console.error("Invite limit check failed:", error);
    return NextResponse.json(
      {
        error:
          "Er is een fout opgetreden bij het controleren van je uitnodiging limiet",
      },
      { status: 500 }
    );
  }
}

/**
 * Generic subscription middleware wrapper
 * Use this to easily apply subscription checks to API routes
 */
export function withSubscriptionCheck(
  handler: (req: NextRequest) => Promise<NextResponse>,
  checkType: "declaration" | "invite"
) {
  return async (req: NextRequest) => {
    // Apply the appropriate check
    const checkResult =
      checkType === "declaration"
        ? await checkDeclarationLimit(req)
        : await checkInviteLimit(req);

    // If check failed, return the error response
    if (checkResult.status !== 200) {
      return checkResult;
    }

    // If check passed, continue to the actual handler
    return handler(req);
  };
}
