"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui";
import heroIllustration from "@/public/hero-illustration.jpg";
import Link from "next/link";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-radial py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t("title")}
              <span className="ml-3 bg-gradient-primary bg-clip-text text-transparent">
                {t("aiAssistant")}
              </span>
            </h1>

            <h2 className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              {t("description")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="xl" variant="hero" asChild>
                <Link href="/register">{t("getStartedForFree")}</Link>
              </Button>
              {/* <Button size="xl" variant="outline">
                {t("watchDemo")}
              </Button> */}
            </div>

            <p className="text-sm text-muted-foreground">
              {t("noCreditCardRequired")}
            </p>
          </div>

          <div className="relative">
            <Image
              src={heroIllustration.src}
              alt="AI chat bubbles connecting across multiple devices"
              className="w-full h-auto rounded-2xl shadow-2xl"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
