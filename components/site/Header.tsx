// components/Header.tsx - Updated with proper routing
"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import config from "@/config";
import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import Navigation from "./Navigation";

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function Header() {
  const t = useTranslations("header");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const locale = params?.locale as string;

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${locale}`}
              title={config.appTitle}
              aria-label={config.appTitle}
            >
              <Image
                src={config.appLogo}
                alt={config.appTitle}
                className="h-16 sm:h-20 w-auto object-contain"
                width={100}
                height={100}
                sizes="(max-width: 640px) 64px, 80px"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <Navigation />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <DropdownMenu
              open={isLangDropdownOpen}
              onOpenChange={setIsLangDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-2 shrink-0"
                  disabled={isTransitioning}
                  aria-label={t("language")}
                >
                  <Globe className="h-4 w-4" />
                  {currentLanguage?.flag && (
                    <span className="hidden sm:inline">
                      {currentLanguage.flag}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[150px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => switchLocale(lang.code)}
                    disabled={isTransitioning || lang.code === locale}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.code === locale && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop Login & Register Buttons */}
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href={`/login`}>{t("login")}</Link>
            </Button>
            <Button asChild variant="gradient" className="hidden md:inline-flex">
              <Link href={`/register`}>{t("tryFree")}</Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Navigation />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
