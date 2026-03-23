import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/sanity-client';
import { verifyPassword, createToken, COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';
import { apiError } from '@/lib/api-utils';

interface SanityAdmin {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    // Look up admin user in Sanity
    const admin = await serverClient.fetch<SanityAdmin | null>(
      `*[_type == "adminUser" && email == $email && isActive == true][0]{
        _id, name, email, passwordHash, role, isActive
      }`,
      { email: email.toLowerCase().trim() }
    );

    if (!admin) {
      return apiError('Invalid credentials', 401);
    }

    // Google-only admins have no passwordHash — must use Google Sign-In
    if (!admin.passwordHash) {
      return apiError('This account uses Google Sign-In only', 401);
    }

    // Verify password
    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return apiError('Invalid credentials', 401);
    }

    // Create JWT
    const token = await createToken({
      sub: admin._id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    });

    // Set HTTP-only cookie and return user data
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
    console.error('[POST /api/auth/login]', error);
    return apiError('Authentication failed', 500);
  }
}
