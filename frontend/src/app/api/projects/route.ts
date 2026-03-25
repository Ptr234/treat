import { NextRequest } from 'next/server';
import { client, canWriteToSanity } from '@/lib/sanity-client';
import { PROJECTS_QUERY, PROJECTS_BY_SECTOR_QUERY, PROJECTS_MAP_QUERY } from '@/lib/sanity-queries';
import { apiSuccess, validateSearchParams } from '@/lib/api-utils';
import { projectsQuerySchema } from '@/lib/validations';
import type { SanityLicenseProject } from '@/types/sanity';

export async function GET(request: NextRequest) {
  // Return empty array if Sanity is not configured
  if (!canWriteToSanity && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return apiSuccess([], { total: 0 });
  }

  try {
    const [params, err] = validateSearchParams(request, projectsQuerySchema);
    if (err) return err;

    let query = PROJECTS_QUERY;
    let queryParams: Record<string, string> = {};

    if (params.mapOnly) {
      query = PROJECTS_MAP_QUERY;
    } else if (params.sector) {
      query = PROJECTS_BY_SECTOR_QUERY;
      queryParams = { sector: params.sector };
    }

    const projects = await client.fetch<SanityLicenseProject[]>(query, queryParams, {
      next: { revalidate: 86400 },
    });

    return apiSuccess(projects, { total: projects.length });
  } catch (error) {
    console.error('[GET /api/projects]', error);
    // Graceful degradation: return empty array instead of 500
    return apiSuccess([], { total: 0 });
  }
}
