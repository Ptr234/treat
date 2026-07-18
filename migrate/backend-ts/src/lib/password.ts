import bcrypt from 'bcryptjs';

/**
 * Mirrors backend/src/OscApi/Common/PasswordService.cs — including the
 * legacy PBKDF2 verify path for any hashes created by the original Next.js
 * app (format "saltHex:hashHex", not touched since ASP.NET took over). Do
 * not drop that path until confirmed no such rows remain.
 */
const BCRYPT_WORK_FACTOR = 12;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH_BYTES = 64;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_WORK_FACTOR);
}

/** Mirrors the complexity rule repeated in AuthController.cs's Signup/UpdateProfile/VerifyPasswordReset. */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.includes(':') && !hash.startsWith('$2')) {
    return verifyLegacyPbkdf2(password, hash);
  }
  return bcrypt.compare(password, hash);
}

async function verifyLegacyPbkdf2(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const saltHex = parts[0]!;
  const expectedHashHex = parts[1]!;

  const salt = hexToBytes(saltHex);
  const expectedHash = hexToBytes(expectedHashHex);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BYTES * 8
  );
  const computedHash = new Uint8Array(derivedBits);

  if (computedHash.length !== expectedHash.length) return false;
  return constantTimeEqual(computedHash, expectedHash);
}

/** Constant-time byte comparison — avoids a `node:crypto` dependency for one call site. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
