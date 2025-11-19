"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui";
import heroIllustration from "@/public/hero-illustration.jpg";
import Link from "next/link";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-radial py-12 sm:py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              {t("title")}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent inline-block mt-1 sm:mt-0 sm:ml-2">
                {t("aiAssistant")}
              </span>
            </h1>

            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t("description")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <Button size="xl" variant="hero" asChild className="w-full sm:w-auto">
                <Link href="/register">{t("getStartedForFree")}</Link>
              </Button>
              {/* <Button size="xl" variant="outline" className="w-full sm:w-auto">
                {t("watchDemo")}
              </Button> */}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("noCreditCardRequired")}
            </p>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <Image
              src={heroIllustration.src}
              alt="AI chat bubbles connecting across multiple devices"
              className="w-full h-auto rounded-lg sm:rounded-2xl shadow-xl sm:shadow-2xl"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
