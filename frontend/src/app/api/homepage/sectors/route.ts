import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity-client';
import { HOMEPAGE_SECTORS_QUERY } from '@/lib/sanity-queries';

interface HomepageSector {
  title: string;
  blurb: string;
  image: string | null;
  link: string;
}

// Public: CMS-managed homepage sector cards. Returns an empty list on any
// error so the homepage falls back to its built-in defaults.
export async function GET() {
  try {
    const sectors = await client.fetch<HomepageSector[]>(HOMEPAGE_SECTORS_QUERY);
    return NextResponse.json(
      { success: true, data: (sectors ?? []).filter((s) => s.image) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[GET /api/homepage/sectors]', error);
    return NextResponse.json({ success: false, data: [] });
  }
}
