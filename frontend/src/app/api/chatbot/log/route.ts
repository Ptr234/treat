/**
 * Sanity-only fallback for chatbot logging.
 * When NEXT_PUBLIC_BACKEND_URL is set, apiFetch() routes to ASP.NET ChatbotController instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWriteClient } from '@/lib/sanity-client';
import { validateBody, sanitizeString } from '@/lib/api-utils';
import { chatLogSchema } from '@/lib/validations';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';

const chatLogLimiter = createRateLimiter(60_000, 30); // slightly higher since each chat message logs

export async function POST(request: NextRequest) {
  if (chatLogLimiter.isRateLimited(clientIp(request))) {
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
