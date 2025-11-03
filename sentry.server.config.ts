// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  // Integrations
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // Ignore certain errors
  ignoreErrors: [
    // Database connection errors that are handled
    "P1001", // Can't reach database server
    "P1002", // Database server timeout
    // Stripe webhook signature errors (handled separately)
    "StripeSignatureVerificationError",
    // Rate limiting errors (expected behavior)
    "RATE_LIMIT_EXCEEDED",
  ],

  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive query params
      if (event.request.query_string) {
        const sensitiveParams = ['token', 'apiKey', 'password', 'secret'];
        let queryString = event.request.query_string;

        sensitiveParams.forEach(param => {
          const regex = new RegExp(`${param}=[^&]*`, 'gi');
          queryString = queryString.replace(regex, `${param}=[REDACTED]`);
        });

        event.request.query_string = queryString;
      }
    }

    // Don't send events if no DSN is configured
    if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    return event;
  },

  // Custom tags for better filtering
  initialScope: {
    tags: {
      runtime: "server",
    },
  },
});
