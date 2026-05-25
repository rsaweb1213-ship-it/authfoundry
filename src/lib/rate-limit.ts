/**
 * Simple in-memory rate limiter for API routes.
 * Using a sliding window approach with IP-based tracking.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowInSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowInSeconds: 60,
};

export function rateLimit(
  config: Partial<RateLimitConfig> = {}
): {
  check: (identifier: string) => { success: boolean; remaining: number; resetAt: number };
} {
  const { limit, windowInSeconds } = { ...DEFAULT_CONFIG, ...config };

  return {
    check(identifier: string) {
      cleanup();

      const now = Date.now();
      const key = `rl:${identifier}`;
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        store.set(key, {
          count: 1,
          resetAt: now + windowInSeconds * 1000,
        });
        return { success: true, remaining: limit - 1, resetAt: now + windowInSeconds * 1000 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0, resetAt: entry.resetAt };
      }

      entry.count += 1;
      return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
    },
  };
}

/**
 * Higher-order function that wraps an API route handler with rate limiting.
 * Returns 429 status if rate limit is exceeded.
 */
export function withRateLimit(
  handler: (
    request: Request,
    context: { params?: Record<string, string> }
  ) => Promise<Response>,
  config?: Partial<RateLimitConfig>
) {
  const limiter = rateLimit(config);

  return async (request: Request, context: { params?: Record<string, string> }) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    // Use path + IP as identifier for per-endpoint rate limiting
    const url = new URL(request.url);
    const identifier = `${url.pathname}:${ip}`;

    const result = limiter.check(identifier);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Please try again later",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = await handler(request, context);

    // Add rate limit headers to response
    const headers = new Headers(response.headers);
    headers.set("X-RateLimit-Remaining", String(result.remaining));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}