import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateToken } from "@/lib/token";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export async function POST(req: Request) {
  try {
    const { email, recaptchaToken } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify reCAPTCHA token (prevent password reset spam)
    const recaptchaResult = await verifyRecaptchaToken(
      recaptchaToken,
      'forgot_password',
      0.5 // Minimum score
    );

    if (!recaptchaResult.success) {
      console.warn(`[FORGOT_PASSWORD] reCAPTCHA failed for ${email}: ${recaptchaResult.error}`);
      return NextResponse.json(
        { error: "Bot detected. Please try again." },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive a password reset email",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateToken();

    // Store reset token and expiry in database
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      },
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, {
      id: user.id,
      companyId: user.companyId,
    });

    return NextResponse.json(
      {
        message:
          "If an account exists, you will receive a password reset email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
