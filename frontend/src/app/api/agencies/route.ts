import { NextRequest } from 'next/server';
import { client, getWriteClient } from '@/lib/sanity-client';
import { AGENCIES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError, sanitizeString } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';
import type { SanityAgency } from '@/types/sanity';

export async function GET() {
  try {
    const agencies = await client.fetch<SanityAgency[]>(AGENCIES_QUERY, {}, {
      next: { revalidate: 86400 },
    });
    return apiSuccess(agencies);
  } catch (error) {
    console.error('[GET /api/agencies]', error);
    return apiSuccess([]); // graceful fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return apiError('Authentication required', 401);

    const body = await request.json();
    const { name, code, description, contactEmail, contactPhone, website, services, slaResponseHours } = body;

    if (!name || !code) {
      return apiError('Agency name and code are required', 400);
    }

    const writeClient = getWriteClient();

    const doc = await writeClient.create({
      _type: 'agency',
      name: sanitizeString(name),
      code,
      description: description ? sanitizeString(description) : undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      website: website || undefined,
      services: Array.isArray(services) ? services.map((s: string) => sanitizeString(s)) : undefined,
      slaResponseHours: slaResponseHours || undefined,
    });

    return apiSuccess({ _id: doc._id, name: doc.name }, undefined, 201);
  } catch (error) {
    console.error('[POST /api/agencies]', error);
    const msg = error instanceof Error ? error.message : 'Failed to create agency';
    return apiError(msg, msg.includes('SANITY_API_TOKEN') ? 503 : 500);
  }
}
