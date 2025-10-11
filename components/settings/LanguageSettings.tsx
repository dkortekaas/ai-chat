"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "../ui/use-toast";

const languages = [
  { code: "nl", name: "Nederlands" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

export default function LanguageSettings() {
  const { data: session, update } = useSession();
  const [language, setLanguage] = useState(session?.user?.language || "nl");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const t = useTranslations("settings");

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/users/language", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language }),
      });

      if (!response.ok) {
        throw new Error("Failed to update language preference");
      }

      // Update the local session
      await update({
        ...session,
        user: {
          ...session?.user,
          language,
        },
      });

      // Update cookies
      document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`; // 1 year

      toast({
        title: t("profile.languageUpdated"),
        variant: "success",
        duration: 3000,
      });

      // Refresh the page to apply the new language
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Error updating language preference:", error);
      toast({
        title: t("profile.languageUpdateError"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='bg-white shadow-sm rounded-lg p-6'>
      <h3 className='text-lg font-medium text-gray-900 mb-4'>
        {t("profile.languageSettings")}
      </h3>
      <p className='text-sm text-gray-500 mb-4'>
        {t("profile.languageDescription")}
      </p>

      <div className='space-y-4'>
        <div>
          <label
            htmlFor='language'
            className='block text-sm font-medium text-gray-700'
          >
            {t("profile.language")}
          </label>
          <select
            id='language'
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-declair-blue-500 focus:border-declair-blue-500 sm:text-sm rounded-md'
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type='button'
          onClick={handleSave}
          disabled={isSaving}
          className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-declair-blue-500 hover:bg-declair-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-declair-blue-500 disabled:opacity-50'
        >
          {isSaving ? t("profile.saving") : t("profile.saveChanges")}
        </button>
      </div>
    </div>
  );
}
