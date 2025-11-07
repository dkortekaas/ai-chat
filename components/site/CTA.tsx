// components/home/CTA.tsx
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 md:py-32 bg-gradient-radial">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h3 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t("title")}
            <span className="ml-3 bg-gradient-primary bg-clip-text text-transparent">
              {t("subtitle")}
            </span>
          </h3>

          <p className="text-lg text-muted-foreground">{t("description")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="hero">
              {t("cta")}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {t("noCreditCardRequired")}
          </p>
        </div>
      </div>
    </section>
  );
}
