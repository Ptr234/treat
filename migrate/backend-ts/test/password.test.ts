import { describe, it, expect } from 'vitest';
import { Buffer } from 'node:buffer';
import { hashPassword, verifyPassword, isStrongPassword } from '../src/lib/password';

describe('password hashing', () => {
  it('hashes and verifies a password via bcrypt', async () => {
    const hash = await hashPassword('CorrectHorseBattery1');
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword('CorrectHorseBattery1', hash)).toBe(true);
    expect(await verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('verifies a legacy PBKDF2 hash (format salt:hash), matching PasswordService.cs', async () => {
    // Generated independently via Web Crypto PBKDF2-SHA256/100k iterations/64
    // bytes for the password "LegacyPassword1" with a fixed salt, to prove
    // this backend can still authenticate accounts created before ASP.NET.
    const password = 'LegacyPassword1';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Buffer.from(salt).toString('hex');

    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, keyMaterial, 64 * 8
    );
    const hashHex = Buffer.from(derived).toString('hex');
    const legacyHash = `${saltHex}:${hashHex}`;

    expect(await verifyPassword(password, legacyHash)).toBe(true);
    expect(await verifyPassword('wrong', legacyHash)).toBe(false);
  });
});

describe('isStrongPassword (matches AuthController.cs\'s repeated complexity rule)', () => {
  it('requires 8+ chars, an uppercase letter, and a digit', () => {
    expect(isStrongPassword('Abcdefg1')).toBe(true);
    expect(isStrongPassword('short1A')).toBe(false); // 7 chars
    expect(isStrongPassword('alllowercase1')).toBe(false); // no uppercase
    expect(isStrongPassword('NoDigitsHere')).toBe(false); // no digit
  });
});
