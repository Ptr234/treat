import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { AGENCY_BY_CODE_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import type { SanityAgency } from '@/types/sanity';

// Resolve agency by _id or code
async function findAgency(id: string): Promise<SanityAgency | null> {
  // Try by code first (most common admin use case)
  const byCode = await client.fetch<SanityAgency | null>(AGENCY_BY_CODE_QUERY, { code: id });
  if (byCode) return byCode;
  // Try by Sanity _id
  const byId = await client.fetch<SanityAgency | null>(
    `*[_type == "agency" && _id == $id][0]{ _id, name, code, description, contactEmail, contactPhone, website, services, slaResponseHours }`,
    { id }
  );
  return byId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agency = await findAgency(id);
    if (!agency) return apiError('Agency not found', 404, 'NOT_FOUND');
    return apiSuccess(agency);
  } catch (error) {
    console.error('[GET /api/agencies/[id]]', error);
    return apiError('Failed to fetch agency');
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
    const existing = await findAgency(id);
    if (!existing) return apiError('Agency not found', 404, 'NOT_FOUND');

    const body = await request.json();
    const writeClient = getWriteClient();
    const patch: Record<string, unknown> = {};

    if (body.name !== undefined) patch.name = sanitizeString(body.name);
    if (body.code !== undefined) patch.code = body.code;
    if (body.description !== undefined) patch.description = sanitizeString(body.description);
    if (body.contactEmail !== undefined) patch.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined) patch.contactPhone = body.contactPhone;
    if (body.website !== undefined) patch.website = body.website;
    if (body.services !== undefined) patch.services = body.services;
    if (body.slaResponseHours !== undefined) patch.slaResponseHours = body.slaResponseHours;

    if (Object.keys(patch).length === 0) {
      return apiError('No changes provided', 400);
    }

    await writeClient.patch(existing._id).set(patch).commit();

    return apiSuccess({ _id: existing._id, ...patch });
  } catch (error) {
    console.error('[PATCH /api/agencies/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to update agency';
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
    const existing = await findAgency(id);
    if (!existing) return apiError('Agency not found', 404, 'NOT_FOUND');

    const writeClient = getWriteClient();
    await writeClient.delete(existing._id);

    return apiSuccess({ deleted: existing._id });
  } catch (error) {
    console.error('[DELETE /api/agencies/[id]]', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete agency';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
