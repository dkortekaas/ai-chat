// components/home/Footer.tsx
import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import config from "@/config";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 mb-4 group"
              aria-label="AI Flow Home"
            >
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <span className="text-xl font-bold text-foreground">AI Flow</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Intelligente AI chat assistentie voor betere klantbeleving en meer
              conversies.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Prijzen
                </Link>
              </li>
              <li>
                <Link
                  href="#integrations"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Integraties
                </Link>
              </li>
              <li>
                <Link
                  href="#api"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Bedrijf</h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="#about"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Over Ons
                </Link>
              </li>
              <li>
                <Link
                  href="#blog"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#careers"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Carrières
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Juridisch</h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="#privacy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Algemene Voorwaarden
                </Link>
              </li>
              <li>
                <Link
                  href="#security"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Beveiliging
                </Link>
              </li>
              <li>
                <Link
                  href="#cookies"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AI Flow. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <span className="sr-only">Twitter</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <span className="sr-only">GitHub</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
