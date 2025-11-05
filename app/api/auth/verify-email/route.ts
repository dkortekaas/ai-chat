import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token in the database
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token: token,
      },
    });

    if (!verificationToken) {
      logger.warn("[VERIFY_EMAIL] Invalid verification token provided");
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({
        where: {
          token: token,
        },
      });

      logger.warn("[VERIFY_EMAIL] Expired verification token used");
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Extract email from identifier
    const email = verificationToken.identifier;

    // Find user by email
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      logger.warn(`[VERIFY_EMAIL] User not found for email: ${email.substring(0, 3)}***`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      // Delete the token since it's no longer needed
      await db.verificationToken.delete({
        where: {
          token: token,
        },
      });

      return NextResponse.json(
        {
          message: "Email already verified",
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Update user's emailVerified field
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the verification token
    await db.verificationToken.delete({
      where: {
        token: token,
      },
    });

    logger.info(`[VERIFY_EMAIL] Email verified successfully for user: ${user.id}`);

    return NextResponse.json(
      {
        message: "Email verified successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`[VERIFY_EMAIL] Unexpected error: ${error}`);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
