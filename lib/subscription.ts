import { db } from "@/lib/db";
import { SUBSCRIPTION_PLANS, SubscriptionPlanType } from "@/lib/stripe";

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  plan: SubscriptionPlanType | null;
  trialDaysRemaining: number;
  subscriptionEndDate: Date | null;
  canCreateAssistant: boolean;
  canCreateDocument: boolean;
  canCreateWebsite: boolean;
  assistantsLimit: number;
  documentsLimit: number;
  websitesLimit: number;
  conversationsLimit: number;
}

export async function getUserSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionPlan: true,
      trialStartDate: true,
      trialEndDate: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      subscriptionCanceled: true,
      subscriptionCancelAt: true,
    },
  });

  if (!user) {
    return getDefaultSubscriptionStatus();
  }

  const now = new Date();
  const isTrial = user.subscriptionStatus === "TRIAL";
  const isActive = user.subscriptionStatus === "ACTIVE";
  const isExpired = isTrial
    ? user.trialEndDate
      ? user.trialEndDate < now
      : false
    : user.subscriptionEndDate
      ? user.subscriptionEndDate < now
      : false;

  const trialDaysRemaining = user.trialEndDate
    ? Math.max(
        0,
        Math.ceil(
          (user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const plan = user.subscriptionPlan as SubscriptionPlanType | null;
  const planConfig = plan ? SUBSCRIPTION_PLANS[plan] : null;

  // Check if user can perform actions
  const canCreateAssistant =
    !isExpired && (planConfig ? planConfig.limits.assistants === -1 : true);
  const canCreateDocument = !isExpired;
  const canCreateWebsite = !isExpired;

  return {
    isActive: isActive && !isExpired,
    isTrial,
    isExpired,
    plan,
    trialDaysRemaining,
    subscriptionEndDate: user.subscriptionEndDate,
    canCreateAssistant,
    canCreateDocument,
    canCreateWebsite,
    assistantsLimit: planConfig?.limits.assistants || 1,
    documentsLimit: planConfig?.limits.documentsPerAssistant || 10,
    websitesLimit: planConfig?.limits.websitesPerAssistant || 3,
    conversationsLimit: planConfig?.limits.conversationsPerMonth || 100,
  };
}

export function getDefaultSubscriptionStatus(): SubscriptionStatus {
  return {
    isActive: false,
    isTrial: false,
    isExpired: true,
    plan: null,
    trialDaysRemaining: 0,
    subscriptionEndDate: null,
    canCreateAssistant: false,
    canCreateDocument: false,
    canCreateWebsite: false,
    assistantsLimit: 0,
    documentsLimit: 0,
    websitesLimit: 0,
    conversationsLimit: 0,
  };
}

export async function checkUserLimits(
  userId: string,
  action: "assistant" | "document" | "website"
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getUserSubscriptionStatus(userId);

  if (status.isExpired) {
    return {
      allowed: false,
      reason:
        "Je trial periode is verlopen. Upgrade naar een betaald abonnement om door te gaan.",
    };
  }

  switch (action) {
    case "assistant":
      if (!status.canCreateAssistant) {
        return {
          allowed: false,
          reason: `Je hebt de limiet van ${status.assistantsLimit} chatbot(s) bereikt. Upgrade je abonnement voor meer chatbots.`,
        };
      }
      break;
    case "document":
      if (!status.canCreateDocument) {
        return {
          allowed: false,
          reason: "Je hebt geen toegang om documenten toe te voegen.",
        };
      }
      break;
    case "website":
      if (!status.canCreateWebsite) {
        return {
          allowed: false,
          reason: "Je hebt geen toegang om websites toe te voegen.",
        };
      }
      break;
  }

  return { allowed: true };
}

export async function getUsageStats(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      chatbot_settings: true,
    },
  });

  if (!user) {
    return null;
  }

  // Get basic counts - relationships are complex in this schema
  const [totalDocuments, totalWebsites, monthlyConversations] =
    await Promise.all([
      db.document.count(),
      db.website.count(),
      db.conversation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
          },
        },
      }),
    ]);

  return {
    assistants: user.chatbot_settings.length,
    documents: totalDocuments,
    websites: totalWebsites,
    conversations: monthlyConversations,
  };
}
