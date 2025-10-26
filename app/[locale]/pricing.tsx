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

export default function Prices() {
  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/maand",
      description: "Perfect voor kleine bedrijven die net beginnen",
      features: [
        "1.000 gesprekken per maand",
        "Basis AI assistent",
        "E-mail ondersteuning",
        "1 website integratie",
        "Basis analytics",
      ],
      cta: "Start Gratis",
      popular: false,
    },
    {
      name: "Professional",
      price: "€149",
      period: "/maand",
      description: "Voor groeiende bedrijven met meer volume",
      features: [
        "10.000 gesprekken per maand",
        "Geavanceerde AI assistent",
        "Priority support",
        "5 website integraties",
        "Uitgebreide analytics",
        "Custom branding",
        "API toegang",
      ],
      cta: "Start Nu",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Voor grote organisaties met specifieke behoeften",
      features: [
        "Onbeperkte gesprekken",
        "Dedicated AI model",
        "24/7 support & training",
        "Onbeperkte integraties",
        "Custom analytics dashboard",
        "White-label oplossing",
        "Dedicated account manager",
        "SLA garantie",
      ],
      cta: "Contact Ons",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Simpele, transparante prijzen
              </h1>
              <p className="text-xl text-muted-foreground">
                Kies het plan dat past bij uw bedrijf. Upgrade of downgrade op
                elk moment.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing />

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Veelgestelde vragen
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Kan ik op elk moment opzeggen?
                  </h3>
                  <p className="text-muted-foreground">
                    Ja, u kunt uw abonnement op elk moment opzeggen. Er zijn
                    geen lange termijn contracten of verborgen kosten.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Wat gebeurt er als ik mijn limiet overschrijd?
                  </h3>
                  <p className="text-muted-foreground">
                    We sturen u een notificatie wanneer u 80% van uw limiet
                    bereikt. U kunt dan upgraden of extra gesprekken bijkopen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Is er een gratis proefperiode?
                  </h3>
                  <p className="text-muted-foreground">
                    Ja, alle plannen hebben een 14-dagen gratis proefperiode.
                    Geen creditcard vereist om te starten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "EmbedIQ",
            offers: plans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              price:
                plan.price === "Custom" ? "0" : plan.price.replace("€", ""),
              priceCurrency: "EUR",
            })),
          }),
        }}
      />
    </div>
  );
}
