"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Upload,
  Sparkles,
  Code,
  TrendingUp,
  Zap,
  Target,
  Palette,
  Shield,
  BarChart3,
  Globe,
  CheckCircle2,
} from "lucide-react";
import Navigation from "@/components/home/Navigation";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";

const Index = () => {
  const params = useParams();
  const locale = params?.locale as string;

  const benefits = [
    {
      icon: Zap,
      title: "Snel en eenvoudig",
      description:
        "Van upload tot live in minder dan 5 minuten. Geen technische kennis vereist.",
    },
    {
      icon: Target,
      title: "Altijd accurate antwoorden",
      description:
        "Gebaseerd op uw eigen content. Elke antwoord toont de gebruikte bronnen.",
    },
    {
      icon: Palette,
      title: "100% op maat",
      description:
        "Pas kleuren, toon en gedrag volledig aan aan uw merkidentiteit.",
    },
    {
      icon: BarChart3,
      title: "Volledige controle",
      description:
        "Zie elk gesprek, beoordeel antwoorden en identificeer kennishiaten.",
    },
    {
      icon: Shield,
      title: "Veilig en privé",
      description:
        "GDPR-compliant. Self-hosted optie beschikbaar. Enterprise-grade beveiliging.",
    },
    {
      icon: Globe,
      title: "Schaalt mee",
      description:
        "Van 10 tot 10.000 gesprekken per maand. Infrastructuur schaalt automatisch.",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload uw content",
      description:
        "Sleep PDF's, Word-documenten of voeg URLs toe. Ondersteunt handleidingen, FAQ's en meer.",
    },
    {
      icon: Sparkles,
      title: "AI leert van uw content",
      description:
        "Geavanceerde GPT-4 technologie verwerkt uw documenten en leert alle belangrijke informatie.",
    },
    {
      icon: Code,
      title: "Integreer in 1 minuut",
      description:
        "Kopieer één regel code en plak in uw website. De chatbot is direct live.",
    },
    {
      icon: TrendingUp,
      title: "Verbeter continu",
      description:
        "Bekijk gesprekken, beoordeel antwoorden en verfijn voor steeds betere resultaten.",
    },
  ];

  const useCases = [
    "Customer support teams",
    "Sales teams",
    "HR afdelingen",
    "Product documentatie",
    "FAQ's en kennisbanken",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h1 className="mb-6 bg-primary bg-clip-text text-transparent font-bold text-6xl leading-tight">
                Van Document naar Chatbot in 5 Minuten
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Transformeer uw kennisbank in een intelligente AI-assistent.
                Upload documenten, voeg URLs toe, en krijg binnen minuten een
                chatbot die accurate antwoorden geeft - 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8" asChild>
                  <a href="#gratis-starten" id="gratis-starten">
                    Gratis Starten
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  asChild
                >
                  <a href="#hoe-het-werkt">Hoe Het Werkt</a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                ✓ Geen creditcard vereist ✓ 50 gesprekken gratis ✓ Setup in 5
                minuten
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="hoe-het-werkt" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="mb-4 text-5xl font-bold">Hoe Het Werkt</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                In 4 eenvoudige stappen van documenten naar een werkende
                AI-chatbot
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="text-center border-2 hover:border-primary transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-8 pb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                      <step.icon
                        className="w-8 h-8 text-primary-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-sm font-semibold text-primary mb-2">
                      Stap {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="features" className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="mb-4 text-5xl font-bold">
                Waarom Kiezen Voor Ons Platform?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                De krachtigste features voor de beste chatbot ervaring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="animate-fade-in-up hover:shadow-glow transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent>
                    <benefit.icon
                      className="w-12 h-12 text-primary mb-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-xl font-semibold mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="mb-4 text-5xl font-bold">Perfect Voor</h2>
                <p className="text-xl text-muted-foreground">
                  Ideaal voor teams die efficiënter willen communiceren
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                {useCases.map((useCase, index) => (
                  <Card
                    key={index}
                    className="hover:border-primary transition-colors"
                  >
                    <CardContent className="flex items-center space-x-4 py-6">
                      <CheckCircle2
                        className="w-6 h-6 text-primary flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-lg font-medium">{useCase}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <Bot className="w-16 h-16 mx-auto mb-6" aria-hidden="true" />
              <h2 className="mb-6 text-primary-foreground text-5xl font-bold">
                Klaar om te Beginnen?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Start vandaag nog gratis. Geen creditcard vereist. Binnen 5
                minuten uw eerste chatbot live.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
                  asChild
                >
                  <Link href={`/${locale}/register`}>Maak Gratis Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href={`/${locale}/pricing`}>Bekijk Prijzen</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
