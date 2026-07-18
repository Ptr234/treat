import { describe, it, expect } from 'vitest';
import { env } from 'cloudflare:test';
import { ticketsRoute } from '../src/routes/tickets';
import { messagesRoute } from '../src/routes/messages';
import type { Env } from '../src/types';

/**
 * Route-level tests for the paths that 401 (requireStaff) or 400 (zValidator)
 * before ever touching the DB or a rate-limit binding — see
 * test/auth-routes.test.ts's header comment for why the scope stops there
 * in this environment (no Hyperdrive, no native RL_* bindings under test).
 */
const testEnv = {
  ...env,
  JWT_SECRET: 'a'.repeat(32),
  JWT_ISSUER: 'osc-api',
  JWT_EXPIRY_HOURS: '24',
  SITE_URL: 'http://localhost:8787',
  COOKIE_DOMAIN: '',
} as unknown as Env;

describe('GET/PATCH /api/tickets — requireStaff gate', () => {
  it('401s the list endpoint with no session', async () => {
    const res = await ticketsRoute.request('/', {}, testEnv);
    expect(res.status).toBe(401);
  });

  it('401s an update with no session', async () => {
    const res = await ticketsRoute.request('/UIA-2026-0001', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    }, testEnv);
    expect(res.status).toBe(401);
  });

  it('401s a staff reply with no session', async () => {
    const res = await ticketsRoute.request('/UIA-2026-0001/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'hi' }),
    }, testEnv);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/tickets — validation short-circuits before rate-limit/DB', () => {
  it('400s a body missing required fields (zValidator, never reaches the handler)', async () => {
    const res = await ticketsRoute.request('/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Only a title' }),
    }, testEnv);
    expect(res.status).toBe(400);
  });

  it('400s an invalid category', async () => {
    const res = await ticketsRoute.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'T', description: 'D', category: 'not_real', contactEmail: 'a@b.com', contactName: 'A',
      }),
    }, testEnv);
    expect(res.status).toBe(400);
  });
});

describe('/api/messages — requireStaff gate (mirrors MessagesController\'s class-level [Authorize])', () => {
  it('401s GET with no session', async () => {
    const res = await messagesRoute.request('/', {}, testEnv);
    expect(res.status).toBe(401);
  });

  it('401s POST with no session, before Zod validation even runs', async () => {
    const res = await messagesRoute.request('/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
    }, testEnv);
    expect(res.status).toBe(401);
  });
});
