import Stripe from "stripe";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanType,
} from "@/lib/subscriptionPlans";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

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
  BUSINESS: {
    ...SUBSCRIPTION_PLANS.BUSINESS,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
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
