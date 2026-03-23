import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { EVENTS_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import type { SanityEvent } from '@/types/sanity';

export async function GET() {
  try {
    const events = await client.fetch<SanityEvent[]>(EVENTS_QUERY, {}, {
      next: { revalidate: 3600 },
    });
    return apiSuccess(events);
  } catch (error) {
    console.error('[GET /api/events]', error);
    return apiSuccess([]); // graceful fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return apiError('Authentication required', 401);

    const body = await request.json();
    const { title, date, endDate, category, description, location, registrationUrl, isPublished } = body;

    if (!title || !date || !category) {
      return apiError('Title, date, and category are required', 400);
    }

    const writeClient = getWriteClient();
    const slug = sanitizeString(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const doc = await writeClient.create({
      _type: 'event',
      title: sanitizeString(title),
      slug: { _type: 'slug', current: slug },
      date,
      endDate: endDate || undefined,
      category,
      description: description ? sanitizeString(description) : undefined,
      location: location ? sanitizeString(location) : undefined,
      registrationUrl: registrationUrl || undefined,
      isPublished: isPublished ?? false,
    });

    return apiSuccess({ _id: doc._id, title: doc.title }, undefined, 201);
  } catch (error) {
    console.error('[POST /api/events]', error);
    const msg = error instanceof Error ? error.message : 'Failed to create event';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
