import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken, sessionCookieOptions, SESSION_COOKIE_NAME } from '../src/lib/jwt';
import type { Env } from '../src/types';

const fakeEnv = {
  JWT_SECRET: 'a'.repeat(32),
  JWT_ISSUER: 'osc-api',
  JWT_EXPIRY_HOURS: '24',
  SITE_URL: 'https://www.oscdigitaltool.com',
  COOKIE_DOMAIN: '.oscdigitaltool.com',
} as unknown as Env;

describe('jwt session tokens', () => {
  it('round-trips claims through sign + verify', async () => {
    const token = await createSessionToken(fakeEnv, {
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'admin@uia.go.ug',
      name: 'OSC Administrator',
      role: 'admin',
    });

    const claims = await verifySessionToken(fakeEnv, token);
    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe('11111111-1111-1111-1111-111111111111');
    expect(claims?.email).toBe('admin@uia.go.ug');
    expect(claims?.role).toBe('admin');
  });

  it('carries agencyCode and picture when provided', async () => {
    const token = await createSessionToken(fakeEnv, {
      sub: '2', email: 'officer@uia.go.ug', name: 'Officer', role: 'agency_officer',
      agencyCode: 'URSB', picture: 'https://example.com/p.png',
    });
    const claims = await verifySessionToken(fakeEnv, token);
    expect(claims?.agencyCode).toBe('URSB');
    expect(claims?.picture).toBe('https://example.com/p.png');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken(fakeEnv, {
      sub: '1', email: 'a@b.com', name: 'A', role: 'user',
    });
    const otherEnv = { ...fakeEnv, JWT_SECRET: 'b'.repeat(32) } as unknown as Env;
    expect(await verifySessionToken(otherEnv, token)).toBeNull();
  });

  it('rejects garbage input', async () => {
    expect(await verifySessionToken(fakeEnv, 'not-a-jwt')).toBeNull();
  });

  it('cookie options mirror JwtService.GetCookieOptions()', () => {
    const opts = sessionCookieOptions(fakeEnv);
    expect(opts.httpOnly).toBe(true);
    expect(opts.secure).toBe(true); // SITE_URL is https
    expect(opts.sameSite).toBe('Lax');
    expect(opts.maxAge).toBe(24 * 3600);
    expect(opts.path).toBe('/');
    expect(opts.domain).toBe('.oscdigitaltool.com');
    expect(SESSION_COOKIE_NAME).toBe('osc-session');
  });

  it('does not mark the cookie Secure when SITE_URL is http (e.g. local dev)', () => {
    const localEnv = { ...fakeEnv, SITE_URL: 'http://localhost:8787', COOKIE_DOMAIN: '' } as unknown as Env;
    const opts = sessionCookieOptions(localEnv);
    expect(opts.secure).toBe(false);
    expect('domain' in opts).toBe(false);
  });
});
