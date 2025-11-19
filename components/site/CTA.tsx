// components/home/CTA.tsx
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-radial">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            {t("title")}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent inline-block mt-1 sm:mt-0 sm:ml-2">
              {t("subtitle")}
            </span>
          </h3>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
            <Button size="xl" variant="hero" className="w-full sm:w-auto">
              {t("cta")}
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("noCreditCardRequired")}
          </p>
        </div>
      </div>
    </section>
  );
}
