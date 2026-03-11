import { client } from '@/lib/sanity-client';
import { AGENCIES_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, apiError } from '@/lib/api-utils';
import type { SanityAgency } from '@/types/sanity';

export async function GET() {
  try {
    const agencies = await client.fetch<SanityAgency[]>(AGENCIES_QUERY, {}, {
      next: { revalidate: 86400 },
    });
    return apiSuccess(agencies);
  } catch (error) {
    console.error('[GET /api/agencies]', error);
    return apiError('Failed to fetch agencies');
  }
}
