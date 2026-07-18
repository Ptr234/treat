import { describe, it, expect } from 'vitest';
import { env } from 'cloudflare:test';
import { auth } from '../src/routes/auth';
import { me } from '../src/routes/me';
import type { Env } from '../src/types';
import type { ApiResponseBody } from '../src/lib/response';

/**
 * Route-level tests that don't need Hyperdrive or the native rate-limit
 * bindings (wrangler.test.toml only provisions KV/R2 — see its top comment).
 * These exercise the paths that fail/short-circuit before touching either:
 * Zod validation errors, missing-session 401s, and logout (stateless).
 * Anything that reaches the DB or a native RL_* binding needs a real
 * Hyperdrive-backed `wrangler dev` run — see README.md.
 */
const testEnv = {
  ...env,
  JWT_SECRET: 'a'.repeat(32),
  JWT_ISSUER: 'osc-api',
  JWT_EXPIRY_HOURS: '24',
  SITE_URL: 'http://localhost:8787',
  COOKIE_DOMAIN: '',
} as unknown as Env;

describe('POST /login — validation short-circuits before DB/rate-limit', () => {
  it('rejects a body missing password with 400 (zValidator, never reaches the handler)', async () => {
    const res = await auth.request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' }),
    }, testEnv);
    expect(res.status).toBe(400);
  });

  it('rejects a non-JSON body with 400', async () => {
    const res = await auth.request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    }, testEnv);
    expect(res.status).toBe(400);
  });
});

describe('GET /me — mirrors AuthController.Me()', () => {
  it('401s with no session cookie', async () => {
    const res = await auth.request('/me', {}, testEnv);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ApiResponseBody;
    expect(body.success).toBe(false);
  });

  it('401s with a garbage cookie', async () => {
    const res = await auth.request('/me', { headers: { Cookie: 'osc-session=not-a-jwt' } }, testEnv);
    expect(res.status).toBe(401);
  });
});

describe('POST /logout', () => {
  it('always succeeds and clears the cookie, even with no session', async () => {
    const res = await auth.request('/logout', { method: 'POST' }, testEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('osc-session=;');
  });
});

describe('GET /api/me/* — requireAuth gate (mirrors MeController\'s [Authorize])', () => {
  it('401s /submissions with no session cookie', async () => {
    const res = await me.request('/submissions', {}, testEnv);
    expect(res.status).toBe(401);
  });

  it('401s /profile with no session cookie', async () => {
    const res = await me.request('/profile', {}, testEnv);
    expect(res.status).toBe(401);
  });

  it('401s /drafts/:formType with no session cookie', async () => {
    const res = await me.request('/drafts/investor_onboarding', {}, testEnv);
    expect(res.status).toBe(401);
  });
});
