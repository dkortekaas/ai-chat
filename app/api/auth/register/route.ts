// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { logger } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
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

    const { name, email, password } = validationResult.data;

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
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dagen

    // Create new user with trial period
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role
        subscriptionStatus: "TRIAL",
        trialStartDate: now,
        trialEndDate: trialEndDate,
        isActive: true, // Ensure user is active
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
