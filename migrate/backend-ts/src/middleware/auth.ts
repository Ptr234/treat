import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { verifySessionToken, SESSION_COOKIE_NAME, type SessionClaims } from '../lib/jwt';
import { isAdminLevel, isStaff } from '../lib/roles';
import { fail } from '../lib/response';
import type { AppEnv } from '../app-env';

/** Reads + verifies the session cookie without requiring one — for routes with a public + staff path (e.g. GetTicket). */
export const optionalAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    const session = await verifySessionToken(c.env, token);
    if (session) c.set('session', session);
  }
  await next();
});

/** 401s if there's no valid session. */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  const session = token ? await verifySessionToken(c.env, token) : null;
  if (!session) return c.json(fail('Not authenticated'), 401);
  c.set('session', session);
  await next();
});

/** 401/403s unless the session is admin-level (dg/admin) — mirrors the "AdminOnly" ASP.NET policy. */
export const requireAdminLevel = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  const session = token ? await verifySessionToken(c.env, token) : null;
  if (!session) return c.json(fail('Not authenticated'), 401);
  if (!isAdminLevel(session.role)) return c.json(fail('Forbidden'), 403);
  c.set('session', session);
  await next();
});

/** 401/403s unless the session is any back-office staff role — mirrors the "Staff" ASP.NET policy. */
export const requireStaff = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  const session = token ? await verifySessionToken(c.env, token) : null;
  if (!session) return c.json(fail('Not authenticated'), 401);
  if (!isStaff(session.role)) return c.json(fail('Forbidden'), 403);
  c.set('session', session);
  await next();
});

export type { SessionClaims };
