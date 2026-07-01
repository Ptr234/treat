import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity-client';
import { EVENT_BY_ID_OR_SLUG_QUERY } from '@/lib/sanity-queries';
import { mapSanityEvent } from '@/lib/event-format';
import type { SanityEvent } from '@/types/sanity';
import EventDetailClient from './EventDetailClient';

// Events are CMS-managed, so render on demand and revalidate hourly rather than
// pre-generating a fixed set of static params.
export const revalidate = 3600;

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  let sanityEvent: SanityEvent | null = null;
  try {
    sanityEvent = await client.fetch<SanityEvent | null>(EVENT_BY_ID_OR_SLUG_QUERY, { id });
  } catch {
    sanityEvent = null;
  }

  if (!sanityEvent) {
    notFound();
  }

  return <EventDetailClient event={mapSanityEvent(sanityEvent)} />;
}
