// components/home/Features.tsx
"use client";

import {
  Clock,
  CheckCircle,
  PieChart,
  Shield,
  Smartphone,
  CreditCard,
  Languages,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons = [
  Clock,
  CheckCircle,
  PieChart,
  Shield,
  Smartphone,
  CreditCard,
];

export default function Features() {
  const t = useTranslations("features");

  const features = [
    {
      icon: Zap,
      title: "Instant Antwoorden",
      description:
        "Beantwoord vragen direct en verhoog klanttevredenheid met razendsnelle AI-reacties.",
    },
    {
      icon: Shield,
      title: "Veilig & Privé",
      description:
        "GDPR-compliant en volledig beveiligd. Uw data blijft beschermd volgens hoogste standaarden.",
    },
    {
      icon: TrendingUp,
      title: "Verhoog Conversies",
      description:
        "Zet bezoekers om in klanten met intelligente suggesties en persoonlijke begeleiding.",
    },
    {
      icon: Clock,
      title: "24/7 Beschikbaar",
      description:
        "Nooit meer een vraag missen. Uw AI assistent werkt dag en nacht zonder pauze.",
    },
    {
      icon: Languages,
      title: "Meertalig",
      description:
        "Communiceer met klanten wereldwijd in hun eigen taal, automatisch vertaald.",
    },
    {
      icon: Settings,
      title: "Makkelijk Te Integreren",
      description:
        "Plug-and-play setup in minuten. Geen technische kennis vereist.",
    },
  ];

  return (
    <section className="py-24 bg-background" aria-labelledby="features-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2
            id="features-heading"
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Waarom kiezen voor <span className="text-indigo-500">EmbedIQ</span>?
          </h2>
          <p className="text-xl text-muted-foreground">
            Alles wat u nodig heeft voor uitmuntende klantenservice en meer
            conversies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group bg-card rounded-2xl p-8 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in-up border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
