import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Pricing from "@/components/home/Pricing";
import { useTranslations } from "next-intl";
import FAQ from "@/components/home/FAQ";

export default function Prices() {
  const t = useTranslations("pricing");

  const plans = ["starter", "professional", "enterprise"];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {t("title")}
              </h1>
              <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing />

        {/* FAQ Section */}
        <FAQ />
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "AI Flow",
            offers: plans.map((plan) => ({
              "@type": "Offer",
              name: t(`plans.${plan}.name`),
              price:
                t(`plans.${plan}.price`) === "Custom"
                  ? "0"
                  : t(`plans.${plan}.price`).replace("€", ""),
              priceCurrency: "EUR",
            })),
          }),
        }}
      />
    </div>
  );
}
