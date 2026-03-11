import { NextRequest } from 'next/server';
import { client } from '@/lib/sanity-client';
import { EVENT_BY_ID_OR_SLUG_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError } from '@/lib/api-utils';
import type { SanityEvent } from '@/types/sanity';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await client.fetch<SanityEvent | null>(EVENT_BY_ID_OR_SLUG_QUERY, { id });

    if (!event) {
      return apiError('Event not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(event);
  } catch (error) {
    console.error('[GET /api/events/[id]]', error);
    return apiError('Failed to fetch event');
  }
}
