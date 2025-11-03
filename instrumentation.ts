/**
 * Instrumentation file for Next.js
 *
 * This file runs once when the Next.js server starts up.
 * It's the perfect place to:
 * - Validate environment variables
 * - Initialize monitoring tools
 * - Set up global error handlers
 * - Connect to databases or external services
 *
 * Learn more: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Validate environment variables at startup
    // This will throw an error and prevent server start if validation fails
    await import("./lib/startup-validation");

    console.log("✅ Server instrumentation completed successfully");
  }

  // Edge runtime instrumentation (if needed)
  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime has limited environment - no file system, etc.
    console.log("✅ Edge runtime instrumentation completed");
  }
}
