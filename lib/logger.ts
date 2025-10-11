import { db } from "@/lib/db";

export type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

interface LogOptions {
  context?: Record<string, string | number | boolean | null | undefined>;
  userId?: string;
  companyId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  eventType?: string;
  message?: string;
  fromAddress?: string;
  toAddress?: string;
  declarationId?: string;
  timeWindowMinutes?: number;
  maxAttempts?: number;
}

/**
 * Log a message to the database
 * @param level The log level (INFO, WARNING, ERROR, DEBUG)
 * @param message The log message
 * @param options Additional options like userId, companyId, etc.
 */
export async function log(
  level: LogLevel,
  message: string,
  options: LogOptions = {}
): Promise<void> {
  try {
    const { userId, companyId, ipAddress, userAgent, context } = options;

    // Check if we're in a server environment
    if (typeof window === "undefined") {
      // Server-side logging
      // await db.applicationLog.create({
      //   data: {
      //     level,
      //     message,
      //     context: context ? JSON.stringify(context) : null,
      //     userId,
      //     companyId,
      //     ipAddress,
      //     userAgent,
      //   },
      // });
    } else {
      // Client-side logging
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          message,
          context,
          userId,
          companyId,
          ipAddress,
          userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to write log to database");
      }
    }
  } catch (error) {
    // If logging fails, we don't want to break the application
    // Just log to console as fallback
    console.error("Failed to write log to database:", error);
  }
}

// Convenience methods for different log levels
export const logger = {
  info: (message: string, options?: LogOptions) =>
    log("INFO", message, options),
  warn: (message: string, options?: LogOptions) =>
    log("WARNING", message, options),
  error: (message: string, options?: LogOptions) =>
    log("ERROR", message, options),
  debug: (message: string, options?: LogOptions) =>
    log("DEBUG", message, options),
};
