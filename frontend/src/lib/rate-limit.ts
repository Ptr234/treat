/**
 * Simple in-memory, per-IP sliding-window-ish rate limiter for Next.js route
 * handlers running in the Sanity-only fallback (no shared store — each server
 * instance tracks its own counts, which is fine for the single-instance
 * deployment this fallback targets).
 */

export interface RateLimiter {
  isRateLimited(ip: string): boolean;
}

export function createRateLimiter(windowMs: number, maxRequests: number): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now > entry.resetAt) hits.delete(ip);
    }
  }, 5 * 60_000);

  return {
    isRateLimited(ip: string): boolean {
      const now = Date.now();
      const entry = hits.get(ip);

      if (!entry || now > entry.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }

      entry.count++;
      return entry.count > maxRequests;
    },
  };
}

/** Best-effort client IP from proxy headers; falls back to a shared bucket if absent. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
