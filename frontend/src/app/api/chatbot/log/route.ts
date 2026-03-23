/**
 * Sanity-only fallback for chatbot logging.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET ChatbotController instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/sanity-client';
import { validateBody, sanitizeString } from '@/lib/api-utils';
import { chatLogSchema } from '@/lib/validations';

// Rate limiting (shared with chatbot route conceptually, but separate map)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30; // slightly higher since each chat message logs
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  const [data, err] = await validateBody(request, chatLogSchema);
  if (err) return err;

  try {
    await getWriteClient().create({
      _type: 'chatEnquiry',
      sessionId: sanitizeString(data.sessionId),
      userName: data.userName ? sanitizeString(data.userName) : undefined,
      userEmail: data.userEmail || undefined,
      userPhone: data.userPhone ? sanitizeString(data.userPhone) : undefined,
      userLocation: data.userLocation ? sanitizeString(data.userLocation) : undefined,
      userMessage: sanitizeString(data.userMessage),
      botResponse: data.botResponse, // preserve markdown formatting
      language: data.language,
      sentiment: data.sentiment || undefined,
      tier: data.tier,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log chat enquiry:', error);
    // Don't fail the user experience — logging is best-effort
    return NextResponse.json({ success: false });
  }
}
