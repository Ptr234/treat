/**
 * Cloudflare Workers bindings + environment shape for this Worker. Mirrors
 * wrangler.toml's [vars]/[[hyperdrive]]/[[r2_buckets]]/[[kv_namespaces]]/
 * [[unsafe.bindings]] sections, plus secrets set via `wrangler secret put`
 * (never present in wrangler.toml itself).
 */

/** Shape of a native Workers Rate Limiting binding (see wrangler.toml comment on RL_*). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  // Bindings
  HYPERDRIVE: Hyperdrive;
  DOCUMENTS: R2Bucket;
  RATE_LIMITS: KVNamespace;
  RL_CHATBOT: RateLimitBinding;
  RL_PUBLIC_FORM: RateLimitBinding;

  // Non-secret vars (wrangler.toml [vars])
  JWT_ISSUER: string;
  JWT_EXPIRY_HOURS: string;
  SITE_URL: string;
  COOKIE_DOMAIN: string;
  CORS_ALLOWED_ORIGINS: string;
  RUN_MIGRATIONS_ON_STARTUP: string;
  RESEND_ADMIN_EMAIL: string;

  // Secrets (wrangler secret put <NAME>) — MUST match the ASP.NET backend's
  // values byte-for-byte during the strangler overlap window (see plan's
  // "Key risks" section: JWT secret/claims must be identical across both
  // backends or sessions silently break depending on which one served the
  // last request).
  JWT_SECRET: string;
  GROQ_API_KEY?: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  RECAPTCHA_SECRET_KEY?: string;
  SENTRY_DSN?: string;
  SEED_ADMIN_PASSWORD?: string;
}
