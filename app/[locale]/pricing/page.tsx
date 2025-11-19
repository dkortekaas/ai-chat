"use client";

import { Check, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Starter",
    monthlyPrice: "€25",
    yearlyMonthPrice: "€17,50",
    yearlyPrice: "€300",
    description: "Perfect for small businesses starting with AI",
    features: [
      "Chat Assistant on 1 website",
      "Up to 50 conversations/month",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
  },
  {
    name: "Professional",
    monthlyPrice: "€49",
    yearlyMonthPrice: "€40",
    yearlyPrice: "€480",
    description: "For growing businesses that need more",
    features: [
      "Chat Assistant on unlimited websites",
      "Up to 400 conversations/month",
      "Email Assistant included",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    variant: "gradient" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "€145",
    yearlyMonthPrice: "€125",
    yearlyPrice: "€1500",
    description: "For large organizations with complex needs",
    features: [
      "Chat Assistant on unlimited websites",
      "Up to 3,000 conversations/month",
      "Email Assistant included",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
  },
];

const Pricing = () => {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations("pricing");
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            Maandelijks
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span
            className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            Jaarlijks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {pricingTiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular
                  ? "border-2 border-primary shadow-xl shadow-primary/20 md:scale-105"
                  : "border-2 hover:border-primary/50"
              } transition-all duration-300 hover:shadow-xl hover:shadow-primary/10`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {t("popular")}
                </div>
              )}

              <CardHeader className="text-center pb-6 sm:pb-8 pt-6 sm:pt-8">
                <CardTitle className="text-xl sm:text-2xl mb-2">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <div>
                    <span className="text-4xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {isYearly ? tier.yearlyMonthPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground ml-1 text-sm sm:text-base">
                      /maand
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-2">
                      <span className="text-base sm:text-lg text-muted-foreground">
                        {tier.yearlyPrice}/jaar
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-4 sm:px-6">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 px-4 sm:px-6">
                <Button
                  variant={tier.variant}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href={`/register`}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mb-20">
          <p className="text-muted-foreground mb-4">
            {t("allPlansIncludeFreeUpdatesAndNoHiddenFees")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("needSomethingCustom")}{" "}
            <Link
              href={`/${locale}/contact`}
              className="text-primary hover:underline font-medium"
            >
              {t("contactUs")}
            </Link>
          </p>
        </div>

        {/* Comparison Table Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("comparePlans")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{t("freeTrial")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{t("flexiblePlans")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{t("easyToUse")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{t("safeAndSecure")}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <Table className="min-w-full">
                  <colgroup>
                    <col className="w-48 sm:w-64 md:w-80" />
                    <col className="w-32 sm:w-auto" />
                    <col className="w-32 sm:w-auto" />
                    <col className="w-32 sm:w-auto" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="border-b-2">
                      <TableHead className="font-semibold text-sm sm:text-base px-3 sm:px-4 sticky left-0 bg-background z-10">
                        Feature
                      </TableHead>
                      <TableHead className="text-center font-semibold text-xs sm:text-sm px-2 sm:px-4">
                        Starter
                      </TableHead>
                      <TableHead className="text-center font-semibold text-xs sm:text-sm bg-primary/5 px-2 sm:px-4">
                        Professional
                      </TableHead>
                      <TableHead className="text-center font-semibold text-xs sm:text-sm px-2 sm:px-4">
                        Enterprise
                      </TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {/* Usage, Billing & Payment */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3 px-3 sm:px-4 text-sm sm:text-base sticky left-0 bg-muted/30 z-10">
                    {t("categories.usageBillingPayment")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.interactionsIncluded")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.interactionsIncludedDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    500
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    2,000
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.additionalInteractions")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.additionalInteractionsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    €1.00
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    €0.05
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.included")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.creditCardPayment")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.activeAIAssistants")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.activeAIAssistantsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    1
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.platformIntegrations")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.platformIntegrationsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.functionIntegrations")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.functionIntegrationsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                {/* Service & Support */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3 px-3 sm:px-4 text-sm sm:text-base sticky left-0 bg-muted/30 z-10">
                    {t("categories.serviceSupport")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.gettingStarted")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.selfService")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.selfService")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.personalisedOnboarding")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.aivantiAssistant")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.aivantiAssistantDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.supportChannels")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    Email
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    Email, Slack
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.responseTime")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.bestEffort")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.oneBusinessDay")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.roadmapFeatureUpvote")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.roadmapFeatureUpvoteDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                {/* Insight & Improvement */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3 px-3 sm:px-4 text-sm sm:text-base sticky left-0 bg-muted/30 z-10">
                    {t("categories.insightImprovement")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.reporting")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.reportingFeatures")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.reportingFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.analytics")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.analyticsFeatures")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.analyticsFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.caseAnalysis")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.caseAnalysisFeatures")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.caseAnalysisFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.knowledgeSourceSynch")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.knowledgeSourceSynchDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.manual")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.manual")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.automationPossible")}
                  </TableCell>
                </TableRow>

                {/* Application & Data Security */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3 px-3 sm:px-4 text-sm sm:text-base sticky left-0 bg-muted/30 z-10">
                    {t("categories.applicationDataSecurity")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.sso")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.latestEnterpriseLLM")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.latestEnterpriseLLMDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="line-clamp-2">
                        {t("features.applicationDataHosting")}
                      </span>
                      <Tooltip
                        content={
                          <p className="max-w-xs text-xs">
                            {t("features.applicationDataHostingDesc")}
                          </p>
                        }
                      >
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.awsEurope")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.awsEurope")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("features.awsEurope")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.encryptionDataAtRest")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.thirdPartyIntegrationSecurity")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.privacyPolicyDataProtection")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.personalInformationDetection")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.conversationTranscriptRetention")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.oneMonth")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.oneYear")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.twoYears")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.analyticsDataRetention")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="px-3 sm:px-4 text-xs sm:text-sm sticky left-0 bg-background z-10">
                    {t("features.analysisDataRetention")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5 px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center px-2 sm:px-4 text-xs sm:text-sm">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>
              </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {t("allPlansIncludeFreeUpdatesAndNoHiddenFees")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("needSomethingCustom")}{" "}
            <Link
              href={`/${locale}/contact`}
              className="text-primary hover:underline font-medium"
            >
              {t("contactUs")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
export default Pricing;
