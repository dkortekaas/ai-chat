// components/Header.tsx - Updated with proper routing
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const languages = [
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const t = useTranslations("header");
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    <header className="w-full bg-white/70 backdrop-blur-md fixed top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Image
              src="/declair-logo.svg"
              alt="Declair"
              width={80}
              height={80}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">Declair</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href={`/${locale}#features`}
              className="text-gray-600 hover:text-indigo-400"
            >
              {t("features")}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              className="text-gray-600 hover:text-indigo-400"
            >
              {t("pricing")}
            </Link>
            <Link
              href={`/${locale}#testimonials`}
              className="text-gray-600 hover:text-indigo-400"
            >
              {t("testimonials")}
            </Link>
            <Link
              href={`/login`}
              className="text-gray-600 hover:text-indigo-400"
            >
              {t("login")}
            </Link>
            <Link
              href={`/register`}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              {t("tryFree")}
            </Link>

            {/* Language Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-400 p-2"
                disabled={isTransitioning}
              >
                <span>{currentLanguage?.flag}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      disabled={isTransitioning}
                      className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 disabled:opacity-50 ${
                        lang.code === locale
                          ? "bg-indigo-50 text-indigo-400"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {isTransitioning && lang.code !== locale && (
                        <span className="ml-auto text-xs">...</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <Link
              href={`/${locale}#features`}
              className="block px-3 py-2 text-gray-600"
            >
              {t("features")}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              className="block px-3 py-2 text-gray-600"
            >
              {t("pricing")}
            </Link>
            <Link
              href={`/${locale}#testimonials`}
              className="block px-3 py-2 text-gray-600"
            >
              {t("testimonials")}
            </Link>
            <Link href={`/login`} className="block px-3 py-2 text-gray-600">
              {t("login")}
            </Link>
            <Link
              href={`/register`}
              className="block px-3 py-2 bg-indigo-500 font-medium transition-colors duration-300 hover:bg-indigo-600"
            >
              {t("tryFree")}
            </Link>

            <div className="border-t pt-2">
              <p className="px-3 py-1 text-sm text-gray-500">
                {t("language", { defaultMessage: "Language" })}
              </p>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  disabled={isTransitioning}
                  className={`w-full px-3 py-2 text-left flex items-center space-x-2 disabled:opacity-50 ${
                    lang.code === locale
                      ? "text-indigo-400 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
