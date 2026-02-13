/**
 * Simple in-memory rate limiter for magic link requests.
 *
 * Configuration:
 * - 3 requests per email per minute (configurable via env)
 * - Automatically cleans up old entries
 */

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(
  process.env.RATE_LIMIT_MAGIC_LINK || "3",
  10
);

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  for (const [key, entry] of rateLimitStore.entries()) {
    // Filter out expired timestamps
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

    // Remove entry if no timestamps remain
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

// Start periodic cleanup (only in production to avoid issues with hot reload)
if (typeof global !== "undefined" && process.env.NODE_ENV === "production") {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check if a request is rate limited.
 *
 * @param identifier - Unique identifier (usually email address)
 * @returns RateLimitResult with success status and remaining requests
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const key = identifier.toLowerCase();

  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Filter out expired timestamps
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  // Check if rate limited
  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = entry.timestamps[0];
    const resetInMs = oldestTimestamp + RATE_LIMIT_WINDOW_MS - now;

    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, resetInMs),
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.timestamps.length,
    resetInMs: RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 *
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier.toLowerCase());
}

/**
 * Get current rate limit status without consuming a request
 *
 * @param identifier - Unique identifier to check
 * @returns Current remaining requests
 */
export function getRateLimitStatus(identifier: string): number {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const key = identifier.toLowerCase();

  const entry = rateLimitStore.get(key);
  if (!entry) {
    return MAX_REQUESTS_PER_WINDOW;
  }

  const validTimestamps = entry.timestamps.filter((ts) => ts > cutoff);
  return MAX_REQUESTS_PER_WINDOW - validTimestamps.length;
}
