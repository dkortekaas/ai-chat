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
    cta: "Get Started",
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
    cta: "Get Started",
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

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular
                  ? "border-2 border-primary shadow-xl shadow-primary/20 scale-105"
                  : "border-2 hover:border-primary/50"
              } transition-all duration-300 hover:shadow-xl hover:shadow-primary/10`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {t("popular")}
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-base">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <div>
                    <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {isYearly ? tier.yearlyMonthPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground ml-1">/maand</span>
                  </div>
                  {isYearly && (
                    <div className="mt-2">
                      <span className="text-lg text-muted-foreground">
                        {tier.yearlyPrice}/jaar
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
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

          <div className="overflow-x-auto">
            <Table className="min-w-full" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "300px" }} />
                <col style={{ width: "calc((100% - 300px) / 3)" }} />
                <col style={{ width: "calc((100% - 300px) / 3)" }} />
                <col style={{ width: "calc((100% - 300px) / 3)" }} />
              </colgroup>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-semibold text-base">
                    Feature
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Starter
                  </TableHead>
                  <TableHead className="text-center font-semibold bg-primary/5">
                    Professional
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Usage, Billing & Payment */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3">
                    {t("categories.usageBillingPayment")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.interactionsIncluded")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.interactionsIncludedDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">500</TableCell>
                  <TableCell className="text-center bg-primary/5">
                    2,000
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.additionalInteractions")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.additionalInteractionsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">€1.00</TableCell>
                  <TableCell className="text-center bg-primary/5">
                    €0.05
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.included")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.creditCardPayment")}</TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.activeAIAssistants")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.activeAIAssistantsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.platformIntegrations")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.platformIntegrationsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.functionIntegrations")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.functionIntegrationsDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                {/* Service & Support */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3">
                    {t("categories.serviceSupport")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.gettingStarted")}</TableCell>
                  <TableCell className="text-center">
                    {t("features.selfService")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.selfService")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.personalisedOnboarding")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.aivantiAssistant")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.aivantiAssistantDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.supportChannels")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    Email
                  </TableCell>
                  <TableCell className="text-center">Email, Slack</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.responseTime")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.bestEffort")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.oneBusinessDay")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.roadmapFeatureUpvote")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.roadmapFeatureUpvoteDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                {/* Insight & Improvement */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3">
                    {t("categories.insightImprovement")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.reporting")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.reportingFeatures")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.reportingFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.analytics")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.analyticsFeatures")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.analyticsFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.caseAnalysis")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.caseAnalysisFeatures")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.caseAnalysisFeatures")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.knowledgeSourceSynch")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.knowledgeSourceSynchDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.manual")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.manual")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.automationPossible")}
                  </TableCell>
                </TableRow>

                {/* Application & Data Security */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-semibold py-3">
                    {t("categories.applicationDataSecurity")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.sso")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.latestEnterpriseLLM")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.latestEnterpriseLLMDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t("features.applicationDataHosting")}
                      <Tooltip
                        content={
                          <p className="max-w-xs">
                            {t("features.applicationDataHostingDesc")}
                          </p>
                        }
                      >
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.awsEurope")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("features.awsEurope")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("features.awsEurope")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.encryptionDataAtRest")}</TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    {t("features.thirdPartyIntegrationSecurity")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    {t("features.privacyPolicyDataProtection")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    {t("features.personalInformationDetection")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.notIncluded")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    {t("features.conversationTranscriptRetention")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.oneMonth")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.oneYear")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.twoYears")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.analyticsDataRetention")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t("features.analysisDataRetention")}</TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    {t("values.unlimited")}
                  </TableCell>
                  <TableCell className="text-center">
                    {t("values.unlimited")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
