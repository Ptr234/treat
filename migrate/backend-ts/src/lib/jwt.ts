import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { Env } from '../types';

/**
 * Mirrors backend/src/OscApi/Common/JwtService.cs exactly — algorithm,
 * claim names, cookie name/options. This MUST stay byte-for-byte compatible
 * with the ASP.NET backend for the entire strangler-migration overlap
 * window: a session cookie issued by either backend has to validate on the
 * other, or users get silently logged out depending on which backend last
 * served them. Do not change claim names/casing without updating both
 * sides in the same deploy.
 */
export const SESSION_COOKIE_NAME = 'osc-session';

/** The long-form claim ASP.NET's ClaimTypes.Role maps to; emitted alongside the short "role" claim. */
const MS_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  picture?: string;
  agencyCode?: string;
}

function secretKey(env: Env): Uint8Array {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  if (new TextEncoder().encode(secret).length < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes for HS256');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(env: Env, claims: SessionClaims): Promise<string> {
  const issuer = env.JWT_ISSUER || 'osc-api';
  const expiryHours = Number(env.JWT_EXPIRY_HOURS || '24');

  const payload: JWTPayload = {
    email: claims.email,
    name: claims.name,
    role: claims.role,
    [MS_ROLE_CLAIM]: claims.role,
    ...(claims.picture ? { picture: claims.picture } : {}),
    ...(claims.agencyCode ? { agency_code: claims.agencyCode } : {}),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuer(issuer)
    .setAudience(issuer)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${expiryHours}h`)
    .sign(secretKey(env));
}

export async function verifySessionToken(env: Env, token: string): Promise<SessionClaims | null> {
  const issuer = env.JWT_ISSUER || 'osc-api';
  try {
    const { payload } = await jwtVerify(token, secretKey(env), {
      issuer,
      audience: issuer,
      clockTolerance: '1m',
    });
    const role = (payload.role as string | undefined) ?? (payload[MS_ROLE_CLAIM] as string | undefined);
    if (!payload.sub || !payload.email || !role) return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      name: (payload.name as string) ?? '',
      role,
      picture: payload.picture as string | undefined,
      agencyCode: payload.agency_code as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Cookie attributes for the session cookie — mirrors JwtService.GetCookieOptions(). */
export function sessionCookieOptions(env: Env) {
  const expiryHours = Number(env.JWT_EXPIRY_HOURS || '24');
  return {
    httpOnly: true,
    secure: env.SITE_URL.toLowerCase().startsWith('https'),
    sameSite: 'Lax' as const,
    maxAge: expiryHours * 3600,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}
