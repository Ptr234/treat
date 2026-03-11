import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { serverClient } from '@/lib/sanity-client';
import { createToken, COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';
import { apiError } from '@/lib/api-utils';

interface SanityAdmin {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  isActive: boolean;
}

// Google's JWKS endpoint for verifying ID tokens
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return apiError('Google credential is required', 400);
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[POST /api/auth/google] NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
      return apiError('Google authentication is not configured', 500);
    }

    // Verify the Google ID token using Google's JWKS
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });

    const email = payload.email as string | undefined;
    if (!email || !payload.email_verified) {
      return apiError('Google account email not verified', 401);
    }

    // Look up admin user in Sanity by email
    const admin = await serverClient.fetch<SanityAdmin | null>(
      `*[_type == "adminUser" && email == $email && isActive == true][0]{
        _id, name, email, role, isActive
      }`,
      { email: email.toLowerCase().trim() }
    );

    if (!admin) {
      return apiError(
        'No admin account found for this Google email. Contact your administrator.',
        403
      );
    }

    // Create JWT session — same as password login
    const token = await createToken({
      sub: admin._id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isVerified: true,
        },
      },
    });

    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());

    return response;
  } catch (error) {
    console.error('[POST /api/auth/google]', error);

    // Distinguish token verification errors from other errors
    if (error instanceof Error && error.message.includes('JW')) {
      return apiError('Invalid Google credential', 401);
    }

    return apiError('Google authentication failed', 500);
  }
}
