// This file configures the initialization of Sentry on the server and edge.
// The config you add here will be used whenever the server handles a request or edge features are loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry initialization
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
            // Convert query_string to string if it's an array
            let queryString: string;
            if (Array.isArray(event.request.query_string)) {
              // If it's an array of [key, value] tuples, convert to string
              queryString = event.request.query_string
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            } else {
              queryString = event.request.query_string as string;
            }

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
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge-side Sentry initialization
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
  }
}

// This hook is called when an error occurs in a React Server Component
export async function onRequestError(err: Error, request: { path: string; headers: Headers }) {
  // Use Sentry to capture the error
  Sentry.captureException(err, {
    tags: {
      component: "React Server Component",
      path: request.path,
    },
    contexts: {
      request: {
        path: request.path,
        headers: Object.fromEntries(request.headers.entries()),
      },
    },
  });
}

