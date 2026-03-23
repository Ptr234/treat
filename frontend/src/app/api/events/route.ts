import { client } from '@/lib/sanity-client';
import { EVENTS_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError } from '@/lib/api-utils';
import type { SanityEvent } from '@/types/sanity';

export async function GET() {
  try {
    const events = await client.fetch<SanityEvent[]>(EVENTS_QUERY, {}, {
      next: { revalidate: 3600 },
    });
    return apiSuccess(events);
  } catch (error) {
    console.error('[GET /api/events]', error);
    return apiError('Failed to fetch events');
  }
}
