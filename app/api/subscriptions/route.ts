import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  SUBSCRIPTION_PLANS_WITH_PRICES,
  type SubscriptionPlanType,
} from "@/lib/stripe";
import { stripe } from "@/lib/stripe";
import { checkGracePeriod } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartDate: true,
        trialEndDate: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionCancelAt: true,
        subscriptionCanceled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate trial status
    const now = new Date();
    const isTrialActive =
      user.subscriptionStatus === "TRIAL" &&
      user.trialEndDate &&
      user.trialEndDate > now;

    const trialDaysRemaining = user.trialEndDate
      ? Math.max(
          0,
          Math.ceil(
            (user.trialEndDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    // Check grace period status
    const gracePeriodCheck = checkGracePeriod(
      user.subscriptionStatus,
      user.trialEndDate,
      user.subscriptionEndDate
    );

    return NextResponse.json({
      user: {
        ...user,
        isTrialActive,
        trialDaysRemaining,
        currentPlan: user.subscriptionPlan
          ? SUBSCRIPTION_PLANS_WITH_PRICES[user.subscriptionPlan]
          : null,
        gracePeriod: {
          isInGracePeriod: gracePeriodCheck.isInGracePeriod,
          daysRemaining: gracePeriodCheck.daysRemainingInGrace,
          endsAt: gracePeriodCheck.gracePeriodEndsAt,
          message: gracePeriodCheck.message,
          urgency: gracePeriodCheck.urgency,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (
      !plan ||
      !SUBSCRIPTION_PLANS_WITH_PRICES[plan as SubscriptionPlanType]
    ) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const selectedPlan =
      SUBSCRIPTION_PLANS_WITH_PRICES[plan as SubscriptionPlanType];

    if (!selectedPlan.priceId) {
      return NextResponse.json(
        { error: "Plan not configured" },
        { status: 400 }
      );
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session_url = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/account?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/account?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session_url.url });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
