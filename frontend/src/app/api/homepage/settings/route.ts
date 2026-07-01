import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity-client';
import { HOMEPAGE_SETTINGS_QUERY } from '@/lib/sanity-queries';

interface HomepageSettings {
  hero: string[] | null;
  about: string | null;
  cta: string | null;
}

// Public: CMS-managed homepage hero slideshow + section background images.
// Returns nulls/empty on any error so the homepage keeps its built-in defaults.
export async function GET() {
  try {
    const settings = await client.fetch<HomepageSettings | null>(HOMEPAGE_SETTINGS_QUERY);
    return NextResponse.json(
      {
        success: true,
        data: {
          hero: (settings?.hero ?? []).filter(Boolean),
          about: settings?.about ?? null,
          cta: settings?.cta ?? null,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[GET /api/homepage/settings]', error);
    return NextResponse.json({ success: false, data: { hero: [], about: null, cta: null } });
  }
}
