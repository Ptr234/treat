import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'osc-session';

// Routes that require an admin-level session (system admin / Director General).
const PROTECTED_ROUTES = ['/dashboard', '/admin'];
// Routes open to all back-office staff, including agency officers. The backend
// scopes an officer to their own agency's channels, so they must be able to
// reach the workspace at all — locking them out here left them with no UI.
// /dashboard/business-registrations is a more specific match than the bare
// /dashboard admin-only entry above and takes precedence below, because URSB
// officers (not just admin-level staff) review and issue registrations there.
const STAFF_ROUTES = ['/agency-chat', '/dashboard/business-registrations'];
// /api/upload is intentionally excluded: it serves both admin-only generic
// uploads and anonymous ticket-attachment uploads (authorized by filing email),
// so authorization is enforced per-request inside the route handler instead.
const PROTECTED_API_ROUTES = ['/api/dashboard'];
// Staff-level APIs. /api/messages mirrors the backend's Staff policy, which
// includes agency officers (scoped to their own agency's channels server-side).
const STAFF_API_ROUTES = ['/api/messages'];
// Next.js routes from before the ASP.NET backend took these over. With a
// backend configured the browser never calls them (apiFetch sends these
// prefixes to the backend), but they stayed reachable directly, and the
// create routes wrote anonymous submissions into Sanity with the write token.
// Kept only for local development without a backend.
const SUPERSEDED_API_ROUTES = [
  '/api/auth', '/api/dashboard', '/api/health', '/api/investors',
  '/api/messages', '/api/tickets', '/api/upload',
];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || '';
  return new TextEncoder().encode(secret);
}

const BACK_OFFICE_ROLES = ['admin', 'dg', 'agency_officer'];

/** The signed-in principal's role and MFA-enrolment state, or nulls when there
 * is no valid session. Mirrors the backend's mfa_enabled claim, added at
 * MfaCompleteRequirement — kept in sync here so a back-office session that
 * hasn't completed enrolment is redirected to finish it, instead of bouncing
 * off the API with a bare 403 the first time it hits a Staff/AdminOnly call. */
async function sessionInfo(request: NextRequest): Promise<{ role: string | null; mfaEnabled: boolean }> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return { role: null, mfaEnabled: false };

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    // Accept the short "role" claim (Next.js-issued tokens) or the .NET
    // ClaimTypes.Role URI (ASP.NET-issued tokens), so a session from either
    // tier — old or new — authorises correctly.
    const role =
      payload.role ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return {
      role: typeof role === 'string' ? role : null,
      mfaEnabled: payload.mfa_enabled === 'true',
    };
  } catch {
    return { role: null, mfaEnabled: false };
  }
}

/** Admin-level roles (system admin + Director General), with MFA enrolment complete. */
async function isValidAdmin(request: NextRequest): Promise<boolean> {
  const { role, mfaEnabled } = await sessionInfo(request);
  return (role === 'admin' || role === 'dg') && mfaEnabled;
}

/** Any back-office staff member, including agency officers, with MFA enrolment complete. */
async function isValidStaff(request: NextRequest): Promise<boolean> {
  const { role, mfaEnabled } = await sessionInfo(request);
  return role !== null && BACK_OFFICE_ROLES.includes(role) && mfaEnabled;
}

/** True for an authenticated back-office session that just hasn't finished MFA
 * enrolment yet — distinct from "not signed in at all", so the redirect can
 * send them to complete setup instead of back to the homepage. */
async function needsMfaSetup(request: NextRequest): Promise<boolean> {
  const { role, mfaEnabled } = await sessionInfo(request);
  return role !== null && BACK_OFFICE_ROLES.includes(role) && !mfaEnabled;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NEXT_PUBLIC_BACKEND_URL &&
      SUPERSEDED_API_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  // Check protected page routes
  const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isStaffPage = STAFF_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedPage || isStaffPage) {
    const valid = isStaffPage
      ? await isValidStaff(request)
      : await isValidAdmin(request);
    if (!valid) {
      const url = request.nextUrl.clone();
      if (pathname !== '/profile' && await needsMfaSetup(request)) {
        url.pathname = '/profile';
        url.searchParams.set('mfa', 'required');
      } else {
        url.pathname = '/';
        url.searchParams.set('auth', 'required');
      }
      return NextResponse.redirect(url);
    }
  }

  // Check protected API routes
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
  const isStaffApi = STAFF_API_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedApi || isStaffApi) {
    const valid = isStaffApi
      ? await isValidStaff(request)
      : await isValidAdmin(request);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agency-chat/:path*',
    '/admin/:path*',
    '/api/auth/:path*',
    '/api/dashboard/:path*',
    '/api/health/:path*',
    '/api/investors/:path*',
    '/api/messages/:path*',
    '/api/tickets/:path*',
    '/api/upload/:path*',
  ],
};
