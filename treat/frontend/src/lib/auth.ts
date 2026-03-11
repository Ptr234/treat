import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// ── JWT secret (must be set in env) ─────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) {
    console.warn('[auth] JWT_SECRET not set — falling back to empty secret');
  }
  return new TextEncoder().encode(secret);
}

const JWT_EXPIRY = '24h';
const COOKIE_NAME = 'osc-session';

// ── Password hashing using Web Crypto (edge-compatible, PBKDF2 + salt)

const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string, existingSalt?: string): Promise<string> {
  const salt = existingSalt || Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hash = Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Support both legacy SHA-256 (no colon) and new PBKDF2 (salt:hash) formats
  if (!stored.includes(':')) {
    // Legacy SHA-256 — plain hash comparison
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const computed = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (computed.length !== stored.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ stored.charCodeAt(i);
    }
    return diff === 0;
  }

  // PBKDF2 format: salt:hash
  const [salt] = stored.split(':');
  const computed = await hashPassword(password, salt);
  if (computed.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return diff === 0;
}

// ── JWT token creation / verification ───────────────────────────────

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  name: string;
  role: 'user' | 'admin';
  picture?: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ──────────────────────────────────────────────────

export { COOKIE_NAME };

export function sessionCookieOptions(maxAge = 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

// ── Route-level auth guard (use inside API handlers) ────────────────

export async function requireAdmin(
  request: NextRequest
): Promise<TokenPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}
