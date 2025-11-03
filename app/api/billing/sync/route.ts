import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, getPlanByPriceId } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    // Fetch all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 10,
    });

    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${user.stripeCustomerId}`);

    // Find the active or most recent subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    ) || subscriptions.data[0];

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "No subscription found in Stripe" },
        { status: 404 }
      );
    }

    console.log(`Active subscription: ${activeSubscription.id}, status: ${activeSubscription.status}`);

    // Get the price ID from the subscription
    const priceId = activeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      return NextResponse.json(
        { error: "No price ID found in subscription" },
        { status: 400 }
      );
    }

    console.log(`Price ID: ${priceId}`);

    // Map price ID to plan
    const plan = getPlanByPriceId(priceId);
    if (!plan) {
      console.error(`Unknown price ID: ${priceId}`);
      return NextResponse.json(
        { error: `Unknown price ID: ${priceId}` },
        { status: 400 }
      );
    }

    console.log(`Mapped to plan: ${plan}`);

    // Map Stripe subscription status to our status
    let status = "ACTIVE";
    switch (activeSubscription.status) {
      case "active":
        status = "ACTIVE";
        break;
      case "past_due":
        status = "PAST_DUE";
        break;
      case "unpaid":
        status = "UNPAID";
        break;
      case "canceled":
        status = "CANCELED";
        break;
      case "incomplete":
        status = "INCOMPLETE";
        break;
      case "incomplete_expired":
        status = "INCOMPLETE_EXPIRED";
        break;
      case "paused":
        status = "PAUSED";
        break;
      case "trialing":
        status = "ACTIVE";
        break;
    }

    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: activeSubscription.id,
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionStartDate: new Date(activeSubscription.current_period_start * 1000),
        subscriptionEndDate: new Date(activeSubscription.current_period_end * 1000),
        subscriptionCanceled: activeSubscription.cancel_at_period_end,
        subscriptionCancelAt: activeSubscription.cancel_at
          ? new Date(activeSubscription.cancel_at * 1000)
          : null,
      },
    });

    console.log(`Updated user ${user.id}: plan=${plan}, status=${status}`);

    return NextResponse.json({
      success: true,
      subscription: {
        id: activeSubscription.id,
        plan: plan,
        status: status,
        currentPeriodStart: new Date(activeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      },
    });
  } catch (error: any) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription", details: error.message },
      { status: 500 }
    );
  }
}
