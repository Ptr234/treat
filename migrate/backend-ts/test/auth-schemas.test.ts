import { describe, it, expect } from 'vitest';
import {
  loginSchema, signupSchema, googleAuthSchema, mfaVerifySchema, mfaDisableSchema,
  passwordResetRequestSchema, passwordResetVerifySchema,
} from '../src/schemas/auth';

describe('auth request schemas', () => {
  it('loginSchema requires email + password, mfaCode optional', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x', mfaCode: '123456' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });

  it('signupSchema requires name + email + password', () => {
    expect(signupSchema.safeParse({ name: 'A', email: 'a@b.com', password: 'x' }).success).toBe(true);
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(false);
  });

  it('googleAuthSchema requires idToken', () => {
    expect(googleAuthSchema.safeParse({ idToken: 'x' }).success).toBe(true);
    expect(googleAuthSchema.safeParse({}).success).toBe(false);
  });

  it('mfaVerifySchema/mfaDisableSchema require their fields', () => {
    expect(mfaVerifySchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(mfaVerifySchema.safeParse({}).success).toBe(false);
    expect(mfaDisableSchema.safeParse({ password: 'x', code: '123456' }).success).toBe(true);
    expect(mfaDisableSchema.safeParse({ password: 'x' }).success).toBe(false);
  });

  it('password-reset schemas require their fields', () => {
    expect(passwordResetRequestSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(passwordResetRequestSchema.safeParse({}).success).toBe(false);
    expect(passwordResetVerifySchema.safeParse({ token: 't', newPassword: 'p' }).success).toBe(true);
    expect(passwordResetVerifySchema.safeParse({ token: 't' }).success).toBe(false);
  });
});
