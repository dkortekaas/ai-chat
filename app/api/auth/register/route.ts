// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { logger } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const t = await getTranslations();

  try {
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        {
          message: t("error.invalidInput"),
          errors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, recaptchaToken } = validationResult.data;

    // Verify reCAPTCHA token (bot protection)
    const recaptchaResult = await verifyRecaptchaToken(
      recaptchaToken,
      'register',
      0.5 // Minimum score for registration
    );

    if (!recaptchaResult.success) {
      logger.warn(`[REGISTER_POST] reCAPTCHA failed for ${email}: ${recaptchaResult.error}`);
      return NextResponse.json(
        {
          message: t("error.botDetected"),
          error: recaptchaResult.error,
        },
        { status: 403 }
      );
    }

    // Check if user already exists in the same company
    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: t("error.userExistsInvite") },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Calculate trial period (30 days from now)
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Always create a default company for the registrant
    const companyName = name ? `${name}'s Company` : `${email}'s Company`;
    const company = await db.company.create({
      data: {
        name: companyName,
        description: "Default company created at registration",
      },
    });
    const companyId = company.id;

    // Create new user with trial period
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Registrant becomes ADMIN of their own company
        role: "ADMIN",
        subscriptionStatus: "TRIAL",
        trialStartDate: now,
        trialEndDate: trialEndDate,
        isActive: true,
        companyId: companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptionStatus: true,
        trialStartDate: true,
        trialEndDate: true,
        isActive: true,
        role: true,
        companyId: true,
      },
    });

    return NextResponse.json(
      {
        message: t("success.accountCreated"),
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(`[REGISTER_POST] Unexpected error: ${error}`);
    return NextResponse.json({ message: t("error.generic") }, { status: 500 });
  }
}
