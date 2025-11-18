"use client";

import { useTranslations } from "next-intl";
import {
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Languages,
  Settings,
  MessageSquare,
  FileText,
  BarChart3,
  Palette,
  Globe,
  Lock,
  Smartphone,
  Cpu,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FeaturesContent() {
  const t = useTranslations("featuresPage");
  const params = useParams();
  const locale = params?.locale as string;

  const mainFeatures = [
    {
      icon: Zap,
      title: t("mainFeatures.instantAnswers.title"),
      description: t("mainFeatures.instantAnswers.description"),
    },
    {
      icon: Shield,
      title: t("mainFeatures.securePrivate.title"),
      description: t("mainFeatures.securePrivate.description"),
    },
    {
      icon: TrendingUp,
      title: t("mainFeatures.increaseConversions.title"),
      description: t("mainFeatures.increaseConversions.description"),
    },
    {
      icon: Clock,
      title: t("mainFeatures.available247.title"),
      description: t("mainFeatures.available247.description"),
    },
    {
      icon: Languages,
      title: t("mainFeatures.multilingual.title"),
      description: t("mainFeatures.multilingual.description"),
    },
    {
      icon: Settings,
      title: t("mainFeatures.easyIntegration.title"),
      description: t("mainFeatures.easyIntegration.description"),
    },
  ];

  const advancedFeatures = [
    {
      icon: FileText,
      title: t("advancedFeatures.knowledgeBase.title"),
      description: t("advancedFeatures.knowledgeBase.description"),
      items: [
        t("advancedFeatures.knowledgeBase.item1"),
        t("advancedFeatures.knowledgeBase.item2"),
        t("advancedFeatures.knowledgeBase.item3"),
      ],
    },
    {
      icon: Palette,
      title: t("advancedFeatures.customization.title"),
      description: t("advancedFeatures.customization.description"),
      items: [
        t("advancedFeatures.customization.item1"),
        t("advancedFeatures.customization.item2"),
        t("advancedFeatures.customization.item3"),
      ],
    },
    {
      icon: BarChart3,
      title: t("advancedFeatures.analytics.title"),
      description: t("advancedFeatures.analytics.description"),
      items: [
        t("advancedFeatures.analytics.item1"),
        t("advancedFeatures.analytics.item2"),
        t("advancedFeatures.analytics.item3"),
      ],
    },
    {
      icon: MessageSquare,
      title: t("advancedFeatures.conversations.title"),
      description: t("advancedFeatures.conversations.description"),
      items: [
        t("advancedFeatures.conversations.item1"),
        t("advancedFeatures.conversations.item2"),
        t("advancedFeatures.conversations.item3"),
      ],
    },
  ];

  const technicalFeatures = [
    {
      icon: Cpu,
      title: t("technicalFeatures.aiPowered.title"),
      description: t("technicalFeatures.aiPowered.description"),
    },
    {
      icon: Globe,
      title: t("technicalFeatures.websiteScraping.title"),
      description: t("technicalFeatures.websiteScraping.description"),
    },
    {
      icon: Lock,
      title: t("technicalFeatures.gdprCompliant.title"),
      description: t("technicalFeatures.gdprCompliant.description"),
    },
    {
      icon: Smartphone,
      title: t("technicalFeatures.mobileResponsive.title"),
      description: t("technicalFeatures.mobileResponsive.description"),
    },
    {
      icon: RefreshCw,
      title: t("technicalFeatures.continuousLearning.title"),
      description: t("technicalFeatures.continuousLearning.description"),
    },
    {
      icon: Users,
      title: t("technicalFeatures.multiTenant.title"),
      description: t("technicalFeatures.multiTenant.description"),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t("hero.subtitle")}
            </p>
            <Link href={`/${locale}/pricing`}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold shadow-glow"
              >
                {t("hero.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {t("mainFeatures.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("mainFeatures.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {t("advancedFeatures.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("advancedFeatures.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {advancedFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-8 shadow-card border border-border animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {feature.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {t("technicalFeatures.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("technicalFeatures.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technicalFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-primary/10 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/pricing`}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold shadow-glow"
                >
                  {t("cta.startFree")}
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 font-semibold"
                >
                  {t("cta.contact")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
