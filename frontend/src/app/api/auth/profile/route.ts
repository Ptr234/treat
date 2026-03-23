/**
 * Sanity-only fallback for admin profile update.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET AuthController instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/sanity-client';
import {
  requireAdmin,
  verifyPassword,
  hashPassword,
  createToken,
  COOKIE_NAME,
  sessionCookieOptions,
} from '@/lib/auth';
import { apiError } from '@/lib/api-utils';

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return apiError('Authentication required', 401);
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    // At least one field must be provided
    if (!name && !newPassword) {
      return apiError('No changes provided', 400);
    }

    // Build the patch
    const patch: Record<string, string> = {};

    // Name update
    if (name && typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed.length < 2 || trimmed.length > 100) {
        return apiError('Name must be 2-100 characters', 400);
      }
      patch.name = trimmed;
    }

    // Password update (requires current password verification)
    if (newPassword) {
      if (!currentPassword) {
        return apiError('Current password is required to set a new password', 400);
      }
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return apiError('New password must be at least 8 characters', 400);
      }

      // Fetch current hash from Sanity
      const stored = await getWriteClient().fetch<{ passwordHash: string } | null>(
        `*[_type == "adminUser" && _id == $id][0]{ passwordHash }`,
        { id: admin.sub }
      );

      if (!stored) {
        return apiError('User not found', 404);
      }

      const valid = await verifyPassword(currentPassword, stored.passwordHash);
      if (!valid) {
        return apiError('Current password is incorrect', 403);
      }

      patch.passwordHash = await hashPassword(newPassword);
    }

    // Apply patch to Sanity
    await getWriteClient().patch(admin.sub).set(patch).commit();

    // If name changed, re-issue JWT with updated name
    const updatedName = patch.name || admin.name;
    const token = await createToken({
      sub: admin.sub,
      email: admin.email,
      name: updatedName,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin.sub,
          name: updatedName,
          email: admin.email,
          role: admin.role,
          isVerified: true,
        },
      },
    });

    // Refresh the session cookie with updated JWT
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());

    return response;
  } catch (error) {
    console.error('[PATCH /api/auth/profile]', error);
    return apiError('Failed to update profile', 500);
  }
}
