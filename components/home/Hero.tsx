"use client";

import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Shield,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui";

export default function Hero() {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations("hero");

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-indigo-500"
      aria-labelledby="hero-heading"
    >
      {/* Animated background elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500-light/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-white space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium">
                Powered by Advanced AI
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Help & Converteer 24/7 met{" "}
              <span className="text-accent">AI Chat</span>
            </h1>

            <p className="text-xl text-white/90 max-w-xl leading-relaxed">
              AI Flow assisteert direct uw klanten en medewerkers met
              betekenisvolle interacties die vertrouwen en merkloyaliteit
              opbouwen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex-1 max-w-md">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label htmlFor="email-input" className="sr-only">
                    E-mailadres
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="Voer uw zakelijke e-mail in"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/95 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-required="true"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow"
                  >
                    Probeer Gratis
                  </Button>
                </form>
                <p className="text-sm text-white/70 mt-2">
                  ✓ Geen creditcard nodig &nbsp;&nbsp; ✓ Onbeperkte gratis
                  proefversie
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 pt-4 text-sm">
              <div>
                <div className="text-3xl font-bold">1M+</div>
                <div className="text-white/70">Gesprekken</div>
              </div>
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-white/70">Tevredenheid</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-white/70">Beschikbaarheid</div>
              </div>
            </div>
          </div>

          {/* Right column - Chat Preview */}
          <div
            className="relative animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <MessageSquare
                    className="w-5 h-5 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    AI Flow Assistant
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      aria-label="Online"
                    />
                    Online
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div
                className="space-y-4 py-6"
                role="log"
                aria-label="Chat berichten"
              >
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Hallo! Hoe kan ik u vandaag helpen?
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      11:48
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="bg-indigo-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-primary-foreground">
                      Wat zijn uw openingstijden?
                    </p>
                    <span className="text-xs text-primary-foreground/70 mt-1 block">
                      11:49
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Wij zijn 24/7 beschikbaar! Het team staat altijd voor u
                      klaar. 🎯
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      11:49
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat input */}
              <div className="pt-4 border-t">
                <label htmlFor="chat-input" className="sr-only">
                  Typ uw vraag
                </label>
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Typ uw vraag hier..."
                  className="w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                  aria-label="Chat invoerveld (demo)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
