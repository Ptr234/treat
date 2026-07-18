import * as OTPAuth from 'otpauth';

/**
 * Mirrors backend/src/OscApi/Common/TotpService.cs exactly: SHA1, 6 digits,
 * 30s period, ±1 step verification window — confirmed from TotpService.cs's
 * `Verify()` (VerificationWindow(previous: 1, future: 1)), so existing
 * enrolled authenticator apps keep working unchanged against this backend.
 */
const ISSUER = 'OSC Digital Tool';

function totpFor(email: string, base32Secret: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(base32Secret),
  });
}

/** Fresh random base32 secret (160-bit, matching KeyGeneration.GenerateRandomKey(20)). */
export function generateSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function buildOtpauthUri(email: string, base32Secret: string): string {
  return totpFor(email, base32Secret).toString();
}

export function verifyTotp(base32Secret: string | null | undefined, code: string | null | undefined): boolean {
  if (!base32Secret || !code) return false;
  const trimmed = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(trimmed)) return false;

  try {
    const delta = totpFor('', base32Secret).validate({ token: trimmed, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}
