import * as Sentry from "@sentry/nextjs";

let sentryInitialized = false;
export function register() {
  if (sentryInitialized) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      Sentry.browserTracingIntegration(),
    ],
    beforeSend(event) {
      if (!dsn) return null;
      if (process.env.NODE_ENV === "development") return null;
      return event;
    },
  });
  sentryInitialized = true;
}


