import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { DOWNLOADABLE_RESOURCES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import type { SanityDownloadableResource } from '@/types/sanity';

export async function GET() {
  try {
    const resources = await client.fetch<SanityDownloadableResource[]>(
      DOWNLOADABLE_RESOURCES_QUERY, {}, { next: { revalidate: 3600 } }
    );
    return apiSuccess(resources);
  } catch (error) {
    console.error('[GET /api/downloads]', error);
    return apiError('Failed to fetch downloads');
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return apiError('Authentication required', 401);

    const body = await request.json();
    const { title, description, category, fileType, sortOrder, isPublished, fileAssetId } = body;

    if (!title || !category || !fileType) {
      return apiError('Title, category, and fileType are required', 400);
    }

    const writeClient = getWriteClient();

    const doc = {
      _type: 'downloadableResource' as const,
      title: sanitizeString(title),
      description: description ? sanitizeString(description) : undefined,
      category,
      fileType,
      sortOrder: sortOrder ?? 0,
      isPublished: isPublished ?? true,
      ...(fileAssetId ? { file: { _type: 'file' as const, asset: { _type: 'reference' as const, _ref: fileAssetId } } } : {}),
    };

    const created = await writeClient.create(doc);
    return apiSuccess({ _id: created._id, title }, undefined, 201);
  } catch (error) {
    console.error('[POST /api/downloads]', error);
    const msg = error instanceof Error ? error.message : 'Failed to create download';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
