import { z } from 'zod';

/**
 * Deliberately loose (presence/type only) — the actual business rules
 * (email format, password complexity, etc.) are enforced in the route
 * handlers with the exact same logic and error messages as
 * backend/src/OscApi/Controllers/AuthController.cs, since those messages are
 * user-facing and some frontend code may match on them.
 */

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  mfaCode: z.string().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
  mfaCode: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export const mfaVerifySchema = z.object({
  code: z.string().min(1),
});

export const mfaDisableSchema = z.object({
  password: z.string().min(1),
  code: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().min(1),
});

export const passwordResetVerifySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(1),
});
