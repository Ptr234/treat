import { describe, it, expect } from 'vitest';
import * as OTPAuth from 'otpauth';
import { generateSecret, buildOtpauthUri, verifyTotp } from '../src/lib/totp';

describe('totp (matches TotpService.cs: SHA1/6 digits/30s/±1 step)', () => {
  it('generates a base32 secret and a valid otpauth URI', () => {
    const secret = generateSecret();
    expect(secret).toMatch(/^[A-Z2-7]+=*$/); // base32 alphabet

    const uri = buildOtpauthUri('admin@uia.go.ug', secret);
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('OSC%20Digital%20Tool');
    expect(uri).toContain('admin%40uia.go.ug');
  });

  it('verifies a code generated for the current time step', () => {
    const secret = generateSecret();
    const code = new OTPAuth.TOTP({
      algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret),
    }).generate();

    expect(verifyTotp(secret, code)).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const secret = generateSecret();
    expect(verifyTotp(secret, '000000')).toBe(false);
  });

  it('rejects malformed input without throwing', () => {
    expect(verifyTotp(null, '123456')).toBe(false);
    expect(verifyTotp('SECRET', 'abcdef')).toBe(false);
    expect(verifyTotp('SECRET', '12345')).toBe(false);
  });
});
