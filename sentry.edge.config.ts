// This file configures the initialization of Sentry for edge features (middleware, edge functions, etc.).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is separate from the server config.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  beforeSend(event, hint) {
    // Don't send events if no DSN is configured
    if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Filter sensitive data from edge runtime
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    return event;
  },

  // Custom tags for better filtering
  initialScope: {
    tags: {
      runtime: "edge",
    },
  },
});
