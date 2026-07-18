import type { Env } from '../types';

/**
 * Mirrors the 4 named rate-limit policies in backend/src/OscApi/Program.cs.
 * "chatbot" and "public-form" use native Workers Rate Limiting bindings
 * (60s window fits that binding's constraint). "login" and "password-reset"
 * need longer windows (5min / 15min) than the binding currently supports, so
 * they use a KV-based fixed-window counter instead — see wrangler.toml's
 * comment on RL_* bindings before assuming this is still accurate; Cloudflare
 * may have extended binding window support since.
 *
 * The KV counter is an approximation, not a precise fixed window: because
 * every allowed increment refreshes the key's TTL, an abuser who stops right
 * at the limit keeps the window open a little longer than 5/15 minutes from
 * their FIRST request. That's a safe-side (more restrictive) approximation,
 * consistent with the ASP.NET backend's own fallback behavour when Redis
 * isn't configured (in-memory, per-instance, not a precise distributed limiter).
 */
export const RateLimitPolicy = {
  Chatbot: 'chatbot',
  PublicForm: 'public-form',
  Login: 'login',
  PasswordReset: 'password-reset',
} as const;
export type RateLimitPolicyName = (typeof RateLimitPolicy)[keyof typeof RateLimitPolicy];

const KV_POLICIES: Record<'login' | 'password-reset', { limit: number; windowSeconds: number }> = {
  login: { limit: 10, windowSeconds: 5 * 60 },
  'password-reset': { limit: 3, windowSeconds: 15 * 60 },
};

/** Real client IP on Workers — no X-Forwarded-For proxy dance needed like on Render. */
export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

export async function checkRateLimit(
  env: Env,
  policy: RateLimitPolicyName,
  key: string
): Promise<boolean> {
  if (policy === RateLimitPolicy.Chatbot) {
    return (await env.RL_CHATBOT.limit({ key })).success;
  }
  if (policy === RateLimitPolicy.PublicForm) {
    return (await env.RL_PUBLIC_FORM.limit({ key })).success;
  }

  const { limit, windowSeconds } = KV_POLICIES[policy];
  const kvKey = `rl:${policy}:${key}`;
  const current = await env.RATE_LIMITS.get(kvKey);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= limit) return false;
  await env.RATE_LIMITS.put(kvKey, String(count + 1), { expirationTtl: windowSeconds });
  return true;
}
