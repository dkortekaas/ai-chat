import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { SubscriptionStatus } from "@prisma/client";
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
      // Check if user is in trial - sync is only for paid subscriptions
      const userWithStatus = await db.user.findUnique({
        where: { id: user.id },
        select: { subscriptionStatus: true },
      });
      
      if (userWithStatus?.subscriptionStatus === "TRIAL") {
        return NextResponse.json(
          { error: "Sync is only available for paid subscriptions. Trial users don't have a Stripe customer yet." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    let activeSubscription: Stripe.Subscription | null = null;

    // If we already have a subscription ID, fetch it directly
    if (user.stripeSubscriptionId) {
      try {
        activeSubscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
        console.log(`Retrieved subscription ${activeSubscription.id} directly`);
      } catch (error) {
        console.log(`Failed to retrieve subscription ${user.stripeSubscriptionId}, falling back to list`);
        activeSubscription = null;
      }
    }

    // If we don't have a subscription yet, or retrieval failed, list all subscriptions
    if (!activeSubscription) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 10,
        expand: ['data.items.data.price'],
      });

      console.log(`Found ${subscriptions.data.length} subscriptions for customer ${user.stripeCustomerId}`);

      // Find the active or most recent subscription
      activeSubscription = subscriptions.data.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
      ) || subscriptions.data[0];

      if (!activeSubscription) {
        return NextResponse.json(
          { error: "No subscription found in Stripe" },
          { status: 404 }
        );
      }
    }

    // At this point, activeSubscription is guaranteed to be non-null
    const subscription: Stripe.Subscription = activeSubscription;

    console.log(`Active subscription: ${subscription.id}, status: ${subscription.status}`);
    console.log(`Subscription details:`, {
      current_period_start: (subscription as any).current_period_start,
      current_period_end: (subscription as any).current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: (subscription as any).cancel_at,
    });

    // Get the price ID from the subscription
    const priceId = subscription.items.data[0]?.price.id;
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
    let status: SubscriptionStatus = "ACTIVE";
    switch (subscription.status) {
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

    // Validate and prepare dates
    const startDate = (subscription as any).current_period_start
      ? new Date((subscription as any).current_period_start * 1000)
      : new Date();

    const endDate = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now

    const cancelAt = (subscription as any).cancel_at
      ? new Date((subscription as any).cancel_at * 1000)
      : null;

    // Validate dates
    if (isNaN(startDate.getTime())) {
      console.error("Invalid start date:", (subscription as any).current_period_start);
      return NextResponse.json(
        { error: "Invalid subscription start date" },
        { status: 400 }
      );
    }

    if (isNaN(endDate.getTime())) {
      console.error("Invalid end date:", (subscription as any).current_period_end);
      return NextResponse.json(
        { error: "Invalid subscription end date" },
        { status: 400 }
      );
    }

    console.log(`Dates to save:`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      cancelAt: cancelAt?.toISOString(),
    });

    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionCanceled: subscription.cancel_at_period_end || false,
        subscriptionCancelAt: cancelAt,
      },
    });

    console.log(`Updated user ${user.id}: plan=${plan}, status=${status}`);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: plan,
        status: status,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
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
