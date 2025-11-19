import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import InactivityTimer from "@/components/auth/InactivityTimer";
import config from "@/config";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Prevent invisible text during font load
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: t("metadata.title"),
    description: t("metadata.description"),
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: config.appTitle,
    },
  };
}

// Viewport configuration to prevent zooming on mobile
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        {/* Preconnect to third-party domains for better performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://ai-chat-pi-blond.vercel.app" />
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuthProvider>
              <InactivityTimer />
              {children}
              <Toaster />
              <GoogleAnalytics
                GA_MEASUREMENT_ID={
                  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
                }
              />
              {/* Chatbot Widget - Deferred for better performance */}
              <Script
                src="https://ai-chat-pi-blond.vercel.app/widget/loader.js"
                data-chatbot-id="220c14b0-888e-42d5-8072-44b84f68688d"
                strategy="lazyOnload"
              />
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
