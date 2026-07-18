import { describe, it, expect } from 'vitest';
import { generateResetToken, hashResetToken } from '../src/lib/reset-token';

describe('password-reset token (matches AuthController.cs: 32 random bytes, SHA-256 hex, uppercase)', () => {
  it('generates a 64-char uppercase hex token (32 bytes)', () => {
    const token = generateResetToken();
    expect(token).toMatch(/^[0-9A-F]{64}$/);
  });

  it('generates distinct tokens each call', () => {
    expect(generateResetToken()).not.toBe(generateResetToken());
  });

  it('hashes deterministically to uppercase hex, matching Convert.ToHexString\'s casing', async () => {
    const hash1 = await hashResetToken('SAMPLE-TOKEN');
    const hash2 = await hashResetToken('SAMPLE-TOKEN');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9A-F]{64}$/);
  });

  it('different tokens hash differently', async () => {
    expect(await hashResetToken('a')).not.toBe(await hashResetToken('b'));
  });
});
