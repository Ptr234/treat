import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { client } from '@/lib/sanity-client';
import {
  CHAT_ENQUIRIES_QUERY,
  CHAT_ENQUIRIES_TOTAL_COUNT_QUERY,
  CHAT_ENQUIRY_STATS_QUERY,
  CHAT_SESSION_MESSAGES_QUERY,
} from '@/lib/sanity-queries';

export async function GET(request: NextRequest) {
  // Admin-only: exposes chatbot enquiry conversations and contact details.
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  try {
    // Stats summary for dashboard cards
    if (action === 'stats') {
      const stats = await client.fetch(CHAT_ENQUIRY_STATS_QUERY);
      return NextResponse.json({ success: true, data: stats });
    }

    // Full conversation for a specific session
    if (action === 'session') {
      const sessionId = searchParams.get('sessionId');
      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'sessionId required' }, { status: 400 });
      }
      const messages = await client.fetch(CHAT_SESSION_MESSAGES_QUERY, { sessionId });
      return NextResponse.json({ success: true, data: messages });
    }

    // Paginated list of enquiries (default)
    const MAX_PAGE_SIZE = 100;
    const from = Math.max(0, parseInt(searchParams.get('from') || '0', 10));
    const rawTo = parseInt(searchParams.get('to') || '50', 10);
    const to = Math.min(Math.max(from + 1, rawTo), from + MAX_PAGE_SIZE);

    const [enquiries, total] = await Promise.all([
      client.fetch(CHAT_ENQUIRIES_QUERY, { from, to }),
      client.fetch(CHAT_ENQUIRIES_TOTAL_COUNT_QUERY),
    ]);

    return NextResponse.json({
      success: true,
      data: enquiries,
      total,
      from,
      to,
    });
  } catch (error) {
    console.error('Dashboard enquiries error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}
