// components/home/CTA.tsx
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <section
      className="py-24 bg-indigo-500 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white animate-fade-in-up">
          <h2
            id="cta-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Klaar om uw klantenservice te transformeren?
          </h2>

          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Sluit u aan bij honderden bedrijven die al profiteren van
            AI-gedreven klantenservice. Start vandaag nog gratis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="w-full sm:w-auto">
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="cta-email-input" className="sr-only">
                  E-mailadres
                </label>
                <input
                  id="cta-email-input"
                  type="email"
                  placeholder="uw.email@bedrijf.nl"
                  className="px-6 py-4 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-80"
                  aria-required="true"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow"
                >
                  Start Nu
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
              </form>
            </div>
          </div>

          <p className="text-sm text-white/70 mt-6">
            Geen creditcard vereist • Setup in 5 minuten • Cancel op elk moment
          </p>

          <div className="mt-12 pt-12 border-t border-white/20">
            <p className="text-white/80 mb-6">
              Vertrouwd door toonaangevende bedrijven
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for company logos */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-32 h-12 bg-white/20 rounded-lg"
                  aria-label={`Partner bedrijf ${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
