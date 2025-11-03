// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Facebook borked
    "fb_xd_fragment",
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // Network errors
    "NetworkError",
    "Network request failed",
    "Failed to fetch",
    // Ignore Next.js hydration errors (these are usually harmless)
    "Hydration failed",
    "There was an error while hydrating",
  ],

  beforeSend(event, hint) {
    // Filter out errors from development
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry Event (dev mode):", event);
      return null;
    }

    // Don't send events if no DSN is configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    return event;
  },
});
