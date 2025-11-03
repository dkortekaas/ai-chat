"use client";

import Link from "next/link";
import { Bot, Mail, Phone } from "lucide-react";
import { useParams } from "next/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const params = useParams();
  const locale = params?.locale as string;

  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Bot
                  className="w-6 h-6 text-primary-foreground"
                  aria-hidden="true"
                />
              </div>
              <span className="font-bold text-xl">AI Chatbot</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transformeer uw kennisbank in een intelligente AI-assistent.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}#features`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Prijzen
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/register`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Gratis Starten
                </Link>
              </li>
            </ul>
          </div>

          {/* Bedrijf */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Bedrijf</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/voorwaarden`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voorwaarden
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <Link
                  href="mailto:info@aiflow.app"
                  className="hover:text-primary transition-colors"
                >
                  info@aiflow.app
                </Link>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <Link
                  href="tel:+31201234567"
                  className="hover:text-primary transition-colors"
                >
                  +31 20 123 4567
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} AI Chatbot Platform. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
