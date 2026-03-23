import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { EVENT_BY_ID_OR_SLUG_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return apiError('Authentication required', 401);

    const { id } = await params;
    const body = await request.json();

    // Resolve Sanity _id from slug or _id
    const existing = await client.fetch<SanityEvent | null>(EVENT_BY_ID_OR_SLUG_QUERY, { id });
    if (!existing) return apiError('Event not found', 404, 'NOT_FOUND');

    const writeClient = getWriteClient();
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) {
      patch.title = sanitizeString(body.title);
      patch.slug = {
        _type: 'slug',
        current: sanitizeString(body.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
    }
    if (body.date !== undefined) patch.date = body.date;
    if (body.endDate !== undefined) patch.endDate = body.endDate;
    if (body.category !== undefined) patch.category = body.category;
    if (body.description !== undefined) patch.description = sanitizeString(body.description);
    if (body.location !== undefined) patch.location = sanitizeString(body.location);
    if (body.registrationUrl !== undefined) patch.registrationUrl = body.registrationUrl;
    if (body.isPublished !== undefined) patch.isPublished = body.isPublished;

    if (Object.keys(patch).length === 0) {
      return apiError('No changes provided', 400);
    }

    await writeClient.patch(existing._id).set(patch).commit();

    return apiSuccess({ _id: existing._id, ...patch });
  } catch (error) {
    console.error('[PATCH /api/events/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to update event';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return apiError('Authentication required', 401);

    const { id } = await params;
    const existing = await client.fetch<SanityEvent | null>(EVENT_BY_ID_OR_SLUG_QUERY, { id });
    if (!existing) return apiError('Event not found', 404, 'NOT_FOUND');

    const writeClient = getWriteClient();
    await writeClient.delete(existing._id);

    return apiSuccess({ deleted: existing._id });
  } catch (error) {
    console.error('[DELETE /api/events/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete event';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
