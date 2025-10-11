"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { useTranslations } from "next-intl";

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
};

// List of supported languages based on your functional document
const languages: Language[] = [
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages[0]
  );
  const { data: session, update } = useSession();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load current language from session or local storage
  useEffect(() => {
    const loadLanguage = () => {
      // First try to get from session (server preference)
      if (session?.user?.language) {
        const userLang = languages.find(
          (lang) => lang.code === session.user.language
        );
        if (userLang) {
          setCurrentLanguage(userLang);
          return;
        }
      }

      // Then try local storage (browser preference)
      const storedLang = localStorage.getItem("NEXT_LOCALE");
      if (storedLang) {
        const foundLang = languages.find((lang) => lang.code === storedLang);
        if (foundLang) {
          setCurrentLanguage(foundLang);
          return;
        }
      }

      // Default to browser language or Dutch
      const browserLang = navigator.language.split("-")[0];
      const foundLang = languages.find((lang) => lang.code === browserLang);
      if (foundLang) {
        setCurrentLanguage(foundLang);
      }
    };

    loadLanguage();
  }, [session]);

  const changeLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);

    // Store in browser
    localStorage.setItem("NEXT_LOCALE", language.code);

    // Set cookie for SSR
    document.cookie = `NEXT_LOCALE=${language.code}; path=/; max-age=31536000`; // 1 year

    // Save to user preferences if logged in
    if (session?.user) {
      try {
        const response = await fetch("/api/users/language", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ language: language.code }),
        });

        if (response.ok) {
          // Update session with new language
          await update({
            ...session,
            user: {
              ...session.user,
              language: language.code,
            },
          });

          toast({
            title: t("languageSelector.languageChanged"),
            description: t("languageSelector.languageChangedDescription", {
              language: language.nativeName,
            }),
            variant: "success",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Error updating language preference:", error);
      }
    }

    // Refresh the page to apply the new language
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 text-gray-700 hover:text-gray-900 focus:outline-none"
        aria-label="Select language"
      >
        <Globe className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium hidden md:inline-block">
          {currentLanguage.flag} {currentLanguage.nativeName}
        </span>
        <span className="text-sm font-medium md:hidden">
          {currentLanguage.flag}
        </span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentLanguage.code === language.code
                  ? "bg-gray-50 font-medium"
                  : ""
              }`}
              onClick={() => changeLanguage(language)}
            >
              <span className="mr-2">{language.flag}</span>
              {language.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
