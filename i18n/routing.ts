// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "en", "de", "fr", "es"],
  defaultLocale: "nl",
  pathnames: {
    "/": {
      nl: "/",
      en: "/",
      de: "/",
      fr: "/",
      es: "/",
    },
    "/login": "/login",
    "/register": "/register",
    "/2fa-verify": "/2fa-verify",
    "/forgot-password": "/forgot-password",
    "/reset-password": "/reset-password",
    "/accept-invitation": "/accept-invitation",
  },
});

export type Locale = (typeof routing.locales)[number];
