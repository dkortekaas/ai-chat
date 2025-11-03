import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navigation from "@/components/home/Navigation";
import Footer from "@/components/home/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Gratis",
      description: "Voor kleine websites en testen",
      features: [
        { text: "50 gesprekken per maand", included: true },
        { text: "5 documenten (max 5MB)", included: true },
        { text: "1 website", included: true },
        { text: "Basis aanpassingen", included: true },
        { text: "Email support (48u)", included: true },
        { text: "Verwijder branding", included: false },
        { text: "API toegang", included: false },
        { text: "Data export", included: false },
      ],
      cta: "Gratis Starten",
      popular: false,
    },
    {
      name: "Professional",
      price: "€49",
      period: "/maand",
      description: "Voor groeiende bedrijven",
      yearlyPrice: "€470/jaar - bespaar €118",
      features: [
        { text: "1.000 gesprekken per maand", included: true },
        { text: "50 documenten (max 10MB)", included: true },
        { text: "3 websites", included: true },
        { text: "Volledige UI aanpassingen", included: true },
        { text: "Verwijder branding", included: true },
        { text: "Prioriteit support (24u)", included: true },
        { text: "Conversatie export (CSV)", included: true },
        { text: "URL scraping (10 URLs)", included: true },
      ],
      cta: "Start Professional",
      popular: true,
    },
    {
      name: "Business",
      price: "€149",
      period: "/maand",
      description: "Voor professionele organisaties",
      yearlyPrice: "€1.430/jaar - bespaar €358",
      features: [
        { text: "5.000 gesprekken per maand", included: true },
        { text: "Onbeperkt documenten", included: true },
        { text: "10 websites", included: true },
        { text: "API toegang", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom domein", included: true },
        { text: "Chat support (4u)", included: true },
        { text: "Team accounts (5 users)", included: true },
      ],
      cta: "Start Business",
      popular: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Voor grote organisaties",
      features: [
        { text: "Onbeperkt gesprekken", included: true },
        { text: "Onbeperkt documenten", included: true },
        { text: "Self-hosted optie", included: true },
        { text: "99.9% SLA garantie", included: true },
        { text: "24/7 support", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "SSO/SAML authenticatie", included: true },
        { text: "Custom integraties", included: true },
      ],
      cta: "Neem Contact Op",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Kan ik van plan wisselen?",
      answer:
        "Ja, u kunt op elk moment upgraden naar een hoger plan. Bij een downgrade blijft uw huidige plan actief tot het einde van de facturatieperiode.",
    },
    {
      question: "Wat gebeurt er als ik mijn limiet overschrijd?",
      answer:
        "U ontvangt een melding wanneer u 80% van uw limiet bereikt. U kunt dan upgraden of extra gesprekken bijkopen. De chatbot blijft beschikbaar.",
    },
    {
      question: "Is er een money-back garantie?",
      answer:
        "Ja, voor Professional en Business plannen bieden we 30 dagen geld-terug-garantie zonder vragen.",
    },
    {
      question: "Welke betaalmethoden accepteren jullie?",
      answer:
        "We accepteren creditcard (Visa, Mastercard, Amex), iDEAL, SEPA Incasso en facturen (vanaf Business plan).",
    },
    {
      question: "Zijn er setup kosten?",
      answer:
        "Nee, er zijn geen setup kosten. U betaalt alleen het maandelijkse abonnement.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Header */}
        <section className="py-20 bg-gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <h1 className="mb-6">Transparante Prijzen voor Elk Bedrijf</h1>
              <p className="text-xl text-muted-foreground">
                Begin gratis en upgrade wanneer u groeit. Geen verborgen kosten,
                opzeggen wanneer u wilt.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col animate-fade-in-up ${
                    plan.popular ? "border-primary shadow-glow" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                        Populair
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.period && (
                          <span className="text-muted-foreground ml-1">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      {plan.yearlyPrice && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.yearlyPrice}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check
                              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={
                              feature.included
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <a href="#gratis-starten">{plan.cta}</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-center mb-12">Veelgestelde Vragen</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-6">Klaar om te Beginnen?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Start gratis en upgrade wanneer u overtuigd bent. Geen
                creditcard vereist.
              </p>
              <Button size="lg" asChild>
                <a href="#gratis-starten">Gratis Account Aanmaken</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
