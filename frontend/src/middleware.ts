import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'osc-session';

// Routes that require an admin-level session (system admin / Director General).
const PROTECTED_ROUTES = ['/dashboard', '/admin'];
// Routes open to all back-office staff, including agency officers. The backend
// scopes an officer to their own agency's channels, so they must be able to
// reach the workspace at all — locking them out here left them with no UI.
const STAFF_ROUTES = ['/agency-chat'];
// /api/upload is intentionally excluded: it serves both admin-only generic
// uploads and anonymous ticket-attachment uploads (authorized by filing email),
// so authorization is enforced per-request inside the route handler instead.
const PROTECTED_API_ROUTES = ['/api/dashboard'];
// Staff-level APIs. /api/messages mirrors the backend's Staff policy, which
// includes agency officers (scoped to their own agency's channels server-side).
const STAFF_API_ROUTES = ['/api/messages'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || '';
  return new TextEncoder().encode(secret);
}

/** The signed-in principal's role, or null when there is no valid session. */
async function sessionRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    // Accept the short "role" claim (Next.js-issued tokens) or the .NET
    // ClaimTypes.Role URI (ASP.NET-issued tokens), so a session from either
    // tier — old or new — authorises correctly.
    const role =
      payload.role ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return typeof role === 'string' ? role : null;
  } catch {
    return null;
  }
}

/** Admin-level roles (system admin + Director General). */
async function isValidAdmin(request: NextRequest): Promise<boolean> {
  const role = await sessionRole(request);
  return role === 'admin' || role === 'dg';
}

/** Any back-office staff member, including agency officers. */
async function isValidStaff(request: NextRequest): Promise<boolean> {
  const role = await sessionRole(request);
  return role === 'admin' || role === 'dg' || role === 'agency_officer';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check protected page routes
  const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isStaffPage = STAFF_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedPage || isStaffPage) {
    const valid = isStaffPage
      ? await isValidStaff(request)
      : await isValidAdmin(request);
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'required');
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
    '/api/dashboard/:path*',
    '/api/messages/:path*',
  ],
};
