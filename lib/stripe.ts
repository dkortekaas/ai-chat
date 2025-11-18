import Stripe from "stripe";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanType,
} from "@/lib/subscriptionPlans";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Please check your .env.local file. See docs/STRIPE_SETUP_NL.md for setup instructions."
  );
}

// Validate the Stripe key format
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey.startsWith("sk_test_") && !stripeKey.startsWith("sk_live_")) {
  console.warn(
    "⚠️  WARNING: STRIPE_SECRET_KEY does not appear to be valid. It should start with 'sk_test_' or 'sk_live_'. See docs/STRIPE_SETUP_NL.md"
  );
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

// Warn about missing price IDs
const missingPriceIds: string[] = [];
if (!process.env.STRIPE_STARTER_PRICE_ID) missingPriceIds.push("STARTER");
if (!process.env.STRIPE_PROFESSIONAL_PRICE_ID)
  missingPriceIds.push("PROFESSIONAL");
if (!process.env.STRIPE_ENTERPRISE_PRICE_ID) missingPriceIds.push("ENTERPRISE");

if (missingPriceIds.length > 0) {
  console.warn(
    `⚠️  WARNING: Missing Stripe Price IDs for: ${missingPriceIds.join(", ")}`
  );
  console.warn(
    "   Subscription upgrades for these plans will fail. See docs/STRIPE_SETUP_NL.md"
  );
}

// Add price IDs to subscription plans
export const SUBSCRIPTION_PLANS_WITH_PRICES = {
  STARTER: {
    ...SUBSCRIPTION_PLANS.STARTER,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  PROFESSIONAL: {
    ...SUBSCRIPTION_PLANS.PROFESSIONAL,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  },
  ENTERPRISE: {
    ...SUBSCRIPTION_PLANS.ENTERPRISE,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string): SubscriptionPlanType | null {
  for (const [planKey, plan] of Object.entries(
    SUBSCRIPTION_PLANS_WITH_PRICES
  )) {
    if (plan.priceId === priceId) {
      return planKey as SubscriptionPlanType;
    }
  }
  return null;
}

// Re-export subscription plans and types for server-side use
export { SUBSCRIPTION_PLANS, type SubscriptionPlanType };
