import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

// This is required for Stripe webhook signature verification
export const runtime = "nodejs";

// Disable body parsing to get raw body for webhook signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  // Map price ID to plan
  const plan = getPlanByPriceId(priceId);
  if (!plan) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user subscription info
  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionPlan: plan,
      subscriptionStatus:
        subscription.status === "active" ? "ACTIVE" : "INCOMPLETE",
      subscriptionStartDate: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscriptionEndDate: new Date(
        (subscription as any).current_period_end * 1000
      ),
      subscriptionCanceled: false,
      subscriptionCancelAt: null,
    },
  });

  console.log(`Subscription created for user ${user.id}: ${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  // Map price ID to plan
  const plan = getPlanByPriceId(priceId);

  // Map Stripe subscription status to our status
  let status = user.subscriptionStatus;
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
  }

  // Update user subscription info
  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscriptionId,
      ...(plan && { subscriptionPlan: plan }),
      subscriptionStatus: status,
      subscriptionStartDate: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscriptionEndDate: new Date(
        (subscription as any).current_period_end * 1000
      ),
      subscriptionCanceled: (subscription as any).cancel_at_period_end,
      subscriptionCancelAt: (subscription as any).cancel_at
        ? new Date((subscription as any).cancel_at * 1000)
        : null,
    },
  });

  console.log(
    `Subscription updated for user ${user.id}: status=${status}, plan=${plan}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Update user to canceled status
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "CANCELED",
      subscriptionCanceled: true,
      subscriptionEndDate: new Date(),
    },
  });

  console.log(`Subscription deleted for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) {
    // Not a subscription payment, ignore
    return;
  }

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // If subscription was past_due or unpaid, update to active
  if (
    user.subscriptionStatus === "PAST_DUE" ||
    user.subscriptionStatus === "UNPAID"
  ) {
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "ACTIVE",
      },
    });
    console.log(`Payment succeeded, user ${user.id} reactivated`);
  }

  console.log(`Payment succeeded for user ${user.id}, invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) {
    // Not a subscription payment, ignore
    return;
  }

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Update subscription status to past_due
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "PAST_DUE",
    },
  });

  console.log(`Payment failed for user ${user.id}, invoice ${invoice.id}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    // Not a subscription checkout, ignore
    return;
  }

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Fetch the subscription to get plan details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  const plan = getPlanByPriceId(priceId);
  if (!plan) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user with subscription info
  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionPlan: plan,
      subscriptionStatus: "ACTIVE",
      subscriptionStartDate: new Date(
        (subscription as any).current_period_start * 1000
      ),
      subscriptionEndDate: new Date(
        (subscription as any).current_period_end * 1000
      ),
      subscriptionCanceled: false,
      subscriptionCancelAt: null,
    },
  });

  console.log(`Checkout completed for user ${user.id}: ${plan}`);
}
