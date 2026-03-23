import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

const RESOURCE_BY_ID_QUERY = `
  *[_type == "downloadableResource" && _id == $id][0] {
    _id, title, description, category, fileType, sortOrder, isPublished,
    file { asset->{ url, size, mimeType } }
  }
`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await client.fetch(RESOURCE_BY_ID_QUERY, { id });
    if (!resource) return apiError('Resource not found', 404, 'NOT_FOUND');
    return apiSuccess(resource);
  } catch (error) {
    console.error('[GET /api/downloads/[id]]', error);
    return apiError('Failed to fetch resource');
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
    const existing = await client.fetch(RESOURCE_BY_ID_QUERY, { id });
    if (!existing) return apiError('Resource not found', 404, 'NOT_FOUND');

    const body = await request.json();
    const writeClient = getWriteClient();
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) patch.title = sanitizeString(body.title);
    if (body.description !== undefined) patch.description = sanitizeString(body.description);
    if (body.category !== undefined) patch.category = body.category;
    if (body.fileType !== undefined) patch.fileType = body.fileType;
    if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder;
    if (body.isPublished !== undefined) patch.isPublished = body.isPublished;
    if (body.fileAssetId) {
      patch.file = { _type: 'file', asset: { _type: 'reference', _ref: body.fileAssetId } };
    }

    if (Object.keys(patch).length === 0) {
      return apiError('No changes provided', 400);
    }

    await writeClient.patch(id).set(patch).commit();
    return apiSuccess({ _id: id, ...patch });
  } catch (error) {
    console.error('[PATCH /api/downloads/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to update resource';
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
    const existing = await client.fetch(RESOURCE_BY_ID_QUERY, { id });
    if (!existing) return apiError('Resource not found', 404, 'NOT_FOUND');

    const writeClient = getWriteClient();
    await writeClient.delete(id);
    return apiSuccess({ deleted: id });
  } catch (error) {
    console.error('[DELETE /api/downloads/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete resource';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
