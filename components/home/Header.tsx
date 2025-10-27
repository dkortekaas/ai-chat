// components/Header.tsx - Updated with proper routing
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import config from "@/config";
import { Button } from "@/components/ui";

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function Header() {
  const t = useTranslations("header");
  const [isOpen, setIsOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const locale = params?.locale as string;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = async (newLocale: string) => {
    if (isTransitioning || newLocale === locale) return;

    setIsTransitioning(true);
    setIsLangDropdownOpen(false);

    // Set the NEXT_LOCALE cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Get current path without locale
    const currentPath =
      pathname.replace(
        new RegExp(`^/(${languages.map((l) => l.code).join("|")})`),
        ""
      ) || "/";

    // Navigate to new locale path
    try {
      // Full page reload for proper locale switching
      window.location.href = `/${newLocale}${currentPath}`;
    } catch (error) {
      console.error("Error switching locale:", error);
      setIsTransitioning(false);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Hoofdnavigatie"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="EmbedIQ Home"
          >
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare
                className="w-6 h-6 text-white"
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-bold text-foreground">EmbedIQ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("features")}
            </Link>
            <Link
              href="/pricing"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t("contact")}
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className="text-foreground hover:text-primary font-medium"
            >
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button className="bg-indigo-500 hover:bg-indigo-500-dark text-primary-foreground font-semibold">
              {t("tryFree")}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/#features"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {t("features")}
              </Link>
              <Link
                href="/pricing"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {t("pricing")}
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {t("contact")}
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  asChild
                  className="text-foreground hover:text-primary font-medium justify-start"
                >
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button className="bg-indigo-500 hover:bg-indigo-500-dark text-primary-foreground font-semibold">
                  {t("tryFree")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
