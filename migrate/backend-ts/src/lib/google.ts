import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Verifies a Google ID token the same way both existing implementations do:
 * ASP.NET's GoogleJsonWebSignature.ValidateAsync(idToken, audience: clientId)
 * in AuthController.cs, and frontend/src/app/api/auth/google/route.ts's
 * jose-based fallback (which this is copied from — already proven to work
 * in an edge/Workers-style runtime).
 *
 * NOTE: unlike the frontend fallback route, this does NOT check
 * `email_verified` — mirroring ASP.NET's current GoogleAuth behavior
 * exactly, since this is a behavior-preserving port. Worth reconciling the
 * two call sites deliberately later, not as an incidental side effect here.
 */
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface GooglePayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GooglePayload | null> {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });
    if (!payload.email || typeof payload.email !== 'string' || !payload.sub) return null;
    return {
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}
