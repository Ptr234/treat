import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'osc-session';

// Routes that require admin authentication
const PROTECTED_ROUTES = ['/dashboard', '/agency-chat', '/admin'];
const PROTECTED_API_ROUTES = ['/api/dashboard', '/api/messages', '/api/upload'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || '';
  return new TextEncoder().encode(secret);
}

async function isValidAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check protected page routes
  const isProtectedPage = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedPage) {
    const valid = await isValidAdmin(request);
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'required');
      return NextResponse.redirect(url);
    }
  }

  // Check protected API routes
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedApi) {
    const valid = await isValidAdmin(request);
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
    '/api/upload/:path*',
  ],
};
