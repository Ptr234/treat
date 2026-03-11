import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, data: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, data: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        isVerified: true,
      },
    },
  });
}
