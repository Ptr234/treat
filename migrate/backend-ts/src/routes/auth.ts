import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { adminUsers, users } from '../db/schema';
import {
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '../lib/jwt';
import { hashPassword, verifyPassword, isStrongPassword } from '../lib/password';
import { generateSecret, buildOtpauthUri, verifyTotp } from '../lib/totp';
import { verifyGoogleIdToken } from '../lib/google';
import { sendPasswordResetEmail } from '../lib/email';
import { auditAsync } from '../lib/audit';
import { checkRateLimit, clientIp, RateLimitPolicy } from '../lib/rate-limit';
import { generateResetToken, hashResetToken } from '../lib/reset-token';
import { isStaff } from '../lib/roles';
import { ok, fail } from '../lib/response';
import {
  loginSchema, signupSchema, googleAuthSchema, profileUpdateSchema,
  mfaVerifySchema, mfaDisableSchema, passwordResetRequestSchema, passwordResetVerifySchema,
} from '../schemas/auth';
import type { AppEnv } from '../app-env';

export const auth = new Hono<AppEnv>();

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

/** Mirrors AuthController's private ResolveAdminAsync — any back-office role, from the session cookie. */
async function resolveAdmin(c: Context<AppEnv>) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return null;
  const session = await verifySessionToken(c.env, token);
  if (!session || !isStaff(session.role)) return null;

  const [admin] = await getDb(c.env).select().from(adminUsers).where(eq(adminUsers.id, session.sub)).limit(1);
  return admin ?? null;
}

// ── POST /login ──────────────────────────────────────────────────────────

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.Login, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const body = c.req.valid('json');
  const { password, mfaCode } = body;
  const email = body.email.toLowerCase();
  const db = getDb(c.env);

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (admin && admin.isActive) {
    if (!admin.passwordHash || !(await verifyPassword(password, admin.passwordHash))) {
      auditAsync(c, { email, role: admin.role, action: 'auth.login.failed', details: 'Invalid password', status: 401 });
      return c.json(fail('Invalid credentials'), 401);
    }

    if (admin.mfaEnabled) {
      if (!mfaCode) {
        auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.login.mfa_required', details: 'Password OK, awaiting TOTP', status: 200 });
        return c.json(ok({ mfaRequired: true }));
      }
      if (!verifyTotp(admin.mfaSecret, mfaCode)) {
        auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.login.failed', details: 'Invalid MFA code', status: 401 });
        return c.json(fail('Invalid authentication code'), 401);
      }
    }

    const token = await createSessionToken(c.env, {
      sub: admin.id, email: admin.email, name: admin.name, role: admin.role,
      agencyCode: admin.agencyCode ?? undefined,
    });
    setCookie(c, SESSION_COOKIE_NAME, token, sessionCookieOptions(c.env));
    auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.login', details: 'Successful sign-in', status: 200 });
    return c.json(ok({ id: admin.id, email: admin.email, name: admin.name, role: admin.role, picture: null, agencyCode: admin.agencyCode }));
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    auditAsync(c, { email, role: 'user', action: 'auth.login.failed', details: 'Invalid credentials', status: 401 });
    return c.json(fail('Invalid credentials'), 401);
  }

  const token = await createSessionToken(c.env, { sub: user.id, email: user.email, name: user.name, role: user.role, picture: user.picture ?? undefined });
  setCookie(c, SESSION_COOKIE_NAME, token, sessionCookieOptions(c.env));
  auditAsync(c, { email: user.email, role: user.role, action: 'auth.login', details: 'Successful sign-in', status: 200 });
  return c.json(ok({ id: user.id, email: user.email, name: user.name, role: user.role, picture: user.picture }));
});

// ── POST /signup ─────────────────────────────────────────────────────────

auth.post('/signup', zValidator('json', signupSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const signupBody = c.req.valid('json');
  const { name, password } = signupBody;
  const email = signupBody.email.toLowerCase().trim();

  if (!EMAIL_RE.test(email)) return c.json(fail('Invalid email format'), 400);
  if (!isStrongPassword(password)) {
    return c.json(fail('Password must be at least 8 characters and include an uppercase letter and a digit'), 400);
  }

  const db = getDb(c.env);
  const [existingAdmin] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existingAdmin || existingUser) return c.json(fail('An account with this email already exists'), 409);

  const [user] = await db
    .insert(users)
    .values({ name: name.trim(), email, passwordHash: await hashPassword(password), role: 'user' })
    .returning();
  if (!user) return c.json(fail('Failed to create account'), 500);

  const token = await createSessionToken(c.env, { sub: user.id, email: user.email, name: user.name, role: user.role });
  setCookie(c, SESSION_COOKIE_NAME, token, sessionCookieOptions(c.env));
  return c.json(ok({ id: user.id, email: user.email, name: user.name, role: user.role }), 201);
});

// ── POST /google ─────────────────────────────────────────────────────────

auth.post('/google', zValidator('json', googleAuthSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.Login, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const { idToken, mfaCode } = c.req.valid('json');
  if (!c.env.GOOGLE_CLIENT_ID) return c.json(fail('Google OAuth not configured'), 500);

  const payload = await verifyGoogleIdToken(idToken, c.env.GOOGLE_CLIENT_ID);
  if (!payload) return c.json(fail('Invalid Google token'), 401);

  const email = payload.email.toLowerCase();
  const db = getDb(c.env);
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

  let id: string, name: string, role: string, agencyCode: string | undefined;

  if (admin && admin.isActive) {
    if (admin.mfaEnabled) {
      if (!mfaCode) {
        auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.login.mfa_required', details: 'Google token OK, awaiting TOTP', status: 200 });
        return c.json(ok({ mfaRequired: true }));
      }
      if (!verifyTotp(admin.mfaSecret, mfaCode)) {
        auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.login.failed', details: 'Invalid MFA code (Google)', status: 401 });
        return c.json(fail('Invalid authentication code'), 401);
      }
    }
    id = admin.id; name = admin.name; role = admin.role; agencyCode = admin.agencyCode ?? undefined;
  } else {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!existing) {
      const [created] = await db
        .insert(users)
        .values({ email, name: payload.name ?? email, role: 'user', googleSubject: payload.sub, picture: payload.picture })
        .returning();
      id = created!.id; name = created!.name; role = created!.role;
    } else {
      const newName = !existing.name?.trim() && payload.name ? payload.name : existing.name;
      await db.update(users).set({
        googleSubject: payload.sub,
        picture: payload.picture ? payload.picture : existing.picture,
        name: newName,
      }).where(eq(users.id, existing.id));
      id = existing.id; name = newName; role = existing.role;
    }
  }

  const token = await createSessionToken(c.env, { sub: id, email, name, role, picture: payload.picture, agencyCode });
  setCookie(c, SESSION_COOKIE_NAME, token, sessionCookieOptions(c.env));
  return c.json(ok({ id, email, name, role, picture: payload.picture, agencyCode }));
});

// ── POST /logout ─────────────────────────────────────────────────────────

auth.post('/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, sessionCookieOptions(c.env));
  return c.json(ok());
});

// ── GET /me ───────────────────────────────────────────────────────────────

auth.get('/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json(fail('Not authenticated'), 401);
  const session = await verifySessionToken(c.env, token);
  if (!session) return c.json(fail('Invalid token'), 401);

  return c.json(ok({
    id: session.sub, email: session.email, name: session.name, role: session.role,
    picture: session.picture, agencyCode: session.agencyCode,
  }));
});

// ── PATCH /profile ────────────────────────────────────────────────────────

auth.patch('/profile', zValidator('json', profileUpdateSchema), async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json(fail('Not authenticated'), 401);
  const session = await verifySessionToken(c.env, token);
  if (!session) return c.json(fail('Invalid token'), 401);

  const { name, currentPassword, newPassword } = c.req.valid('json');
  const db = getDb(c.env);
  const isBackOffice = isStaff(session.role);

  const admin = isBackOffice ? (await db.select().from(adminUsers).where(eq(adminUsers.id, session.sub)).limit(1))[0] : undefined;
  const user = isBackOffice ? undefined : (await db.select().from(users).where(eq(users.id, session.sub)).limit(1))[0];
  if (!admin && !user) return c.json(fail('Account not found'), 404);

  let newName = admin?.name ?? user!.name;
  const currentHash = admin?.passwordHash ?? user?.passwordHash;
  let newHash = currentHash;

  if (name?.trim()) newName = name.trim();

  if (newPassword?.trim()) {
    if (currentHash) {
      if (!currentPassword || !(await verifyPassword(currentPassword, currentHash))) {
        return c.json(fail('Current password is incorrect'), 400);
      }
      if (newPassword === currentPassword) {
        return c.json(fail('New password must be different from current password'), 400);
      }
    }
    if (!isStrongPassword(newPassword)) {
      return c.json(fail('New password must be at least 8 characters and include an uppercase letter and a digit'), 400);
    }
    newHash = await hashPassword(newPassword);
  }

  let id: string, email: string, finalRole: string;
  let picture: string | null = null;
  let agencyCode: string | null = null;

  if (admin) {
    await db.update(adminUsers).set({ name: newName, passwordHash: newHash, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
    id = admin.id; email = admin.email; finalRole = admin.role; agencyCode = admin.agencyCode;
  } else {
    await db.update(users).set({ name: newName, passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user!.id));
    id = user!.id; email = user!.email; finalRole = user!.role; picture = user!.picture;
  }

  const newToken = await createSessionToken(c.env, {
    sub: id, email, name: newName, role: finalRole,
    picture: picture ?? undefined, agencyCode: agencyCode ?? undefined,
  });
  setCookie(c, SESSION_COOKIE_NAME, newToken, sessionCookieOptions(c.env));

  return c.json(ok({ id, email, name: newName, role: finalRole, picture, agencyCode }));
});

// ── MFA ───────────────────────────────────────────────────────────────────

auth.get('/mfa/status', async (c) => {
  const admin = await resolveAdmin(c);
  if (!admin) return c.json(fail('Admin session required'), 401);
  return c.json(ok({ enabled: admin.mfaEnabled }));
});

auth.post('/mfa/enroll', async (c) => {
  const admin = await resolveAdmin(c);
  if (!admin) return c.json(fail('Admin session required'), 401);
  if (admin.mfaEnabled) return c.json(fail('MFA is already enabled. Disable it first to re-enrol.'), 400);

  const secret = generateSecret();
  await getDb(c.env).update(adminUsers).set({ mfaSecret: secret, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));

  return c.json(ok({ secret, otpauthUri: buildOtpauthUri(admin.email, secret) }));
});

auth.post('/mfa/verify', zValidator('json', mfaVerifySchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.Login, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const admin = await resolveAdmin(c);
  if (!admin) return c.json(fail('Admin session required'), 401);
  if (!admin.mfaSecret) return c.json(fail('Start enrolment first'), 400);

  const { code } = c.req.valid('json');
  if (!verifyTotp(admin.mfaSecret, code)) return c.json(fail('Invalid authentication code'), 400);

  await getDb(c.env).update(adminUsers).set({ mfaEnabled: true, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.mfa.enabled', details: 'TOTP enabled', status: 200 });

  return c.json(ok({ enabled: true }));
});

auth.post('/mfa/disable', zValidator('json', mfaDisableSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.Login, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const admin = await resolveAdmin(c);
  if (!admin) return c.json(fail('Admin session required'), 401);
  if (!admin.mfaEnabled) return c.json(fail('MFA is not enabled'), 400);

  const { password, code } = c.req.valid('json');
  if (!admin.passwordHash || !(await verifyPassword(password, admin.passwordHash))) {
    return c.json(fail('Current password is incorrect'), 400);
  }
  if (!verifyTotp(admin.mfaSecret, code)) return c.json(fail('Invalid authentication code'), 400);

  await getDb(c.env).update(adminUsers).set({ mfaEnabled: false, mfaSecret: null, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  auditAsync(c, { email: admin.email, role: admin.role, action: 'auth.mfa.disabled', details: 'TOTP disabled', status: 200 });

  return c.json(ok({ enabled: false }));
});

// ── Password reset ────────────────────────────────────────────────────────

auth.post('/password-reset', zValidator('json', passwordResetRequestSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PasswordReset, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const resetEmail = c.req.valid('json').email.toLowerCase().trim();
  const db = getDb(c.env);
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, resetEmail)).limit(1);

  // Always report success either way — prevents email enumeration.
  if (admin && admin.isActive) {
    const resetToken = generateResetToken();
    await db.update(adminUsers).set({
      passwordResetToken: await hashResetToken(resetToken),
      passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      updatedAt: new Date(),
    }).where(eq(adminUsers.id, admin.id));

    c.executionCtx.waitUntil(sendPasswordResetEmail(c.env, admin.email, admin.name, resetToken));
  }

  return c.json(ok(undefined), 200);
});

auth.post('/password-reset/verify', zValidator('json', passwordResetVerifySchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PasswordReset, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const { token, newPassword } = c.req.valid('json');
  if (!isStrongPassword(newPassword)) {
    return c.json(fail('Password must be at least 8 characters and include an uppercase letter and a digit'), 400);
  }

  const db = getDb(c.env);
  const tokenHash = await hashResetToken(token);
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.passwordResetToken, tokenHash)).limit(1);

  if (!admin || !admin.isActive || !admin.passwordResetExpiresAt || admin.passwordResetExpiresAt < new Date()) {
    return c.json(fail('Invalid or expired reset token'), 400);
  }

  await db.update(adminUsers).set({
    passwordHash: await hashPassword(newPassword),
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    updatedAt: new Date(),
  }).where(eq(adminUsers.id, admin.id));

  return c.json(ok(undefined));
});
