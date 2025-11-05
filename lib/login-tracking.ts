/**
 * Login Attempt Tracking for reCAPTCHA Enforcement
 *
 * Tracks failed login attempts to trigger reCAPTCHA after multiple failures.
 * Uses in-memory storage with automatic cleanup.
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number; // timestamp
  lastAttempt: number; // timestamp
}

// In-memory storage for failed login attempts
// Key: email address (lowercase)
const failedAttempts = new Map<string, LoginAttempt>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupOldAttempts();
  }, 5 * 60 * 1000);
}

/**
 * Record a failed login attempt
 *
 * @param email - User's email address
 */
export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const existing = failedAttempts.get(key);

  if (existing) {
    // Increment count
    existing.count += 1;
    existing.lastAttempt = now;
  } else {
    // First failed attempt
    failedAttempts.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
  }

  console.log(`⚠️ Failed login attempt for ${email}: ${failedAttempts.get(key)?.count} attempts`);
}

/**
 * Check if reCAPTCHA should be required for this email
 *
 * @param email - User's email address
 * @param threshold - Number of failed attempts before requiring reCAPTCHA (default: 3)
 * @param timeWindow - Time window in milliseconds to consider (default: 15 minutes)
 * @returns true if reCAPTCHA is required
 */
export function requiresRecaptcha(
  email: string,
  threshold: number = 3,
  timeWindow: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const key = email.toLowerCase();
  const attempt = failedAttempts.get(key);

  if (!attempt) {
    return false;
  }

  // Check if attempts are within time window
  const now = Date.now();
  const timeSinceFirst = now - attempt.firstAttempt;

  if (timeSinceFirst > timeWindow) {
    // Reset if outside time window
    failedAttempts.delete(key);
    return false;
  }

  return attempt.count >= threshold;
}

/**
 * Reset failed login attempts for an email (e.g., after successful login)
 *
 * @param email - User's email address
 */
export function resetFailedLogins(email: string): void {
  const key = email.toLowerCase();
  failedAttempts.delete(key);
  console.log(`✅ Reset failed login attempts for ${email}`);
}

/**
 * Get current failed login count for an email
 *
 * @param email - User's email address
 * @returns Number of failed attempts
 */
export function getFailedLoginCount(email: string): number {
  const key = email.toLowerCase();
  return failedAttempts.get(key)?.count || 0;
}

/**
 * Clean up old failed login attempts
 * Removes entries older than 1 hour
 */
function cleanupOldAttempts(): void {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  let cleaned = 0;

  for (const [key, attempt] of failedAttempts.entries()) {
    if (now - attempt.lastAttempt > maxAge) {
      failedAttempts.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} old login attempt entries`);
  }
}

/**
 * Get statistics about failed login tracking
 */
export function getLoginTrackingStats() {
  return {
    totalTracked: failedAttempts.size,
    entries: Array.from(failedAttempts.entries()).map(([email, attempt]) => ({
      email: email.substring(0, 3) + '***', // Partially hidden for privacy
      count: attempt.count,
      ageMinutes: Math.floor((Date.now() - attempt.firstAttempt) / 60000),
    })),
  };
}
