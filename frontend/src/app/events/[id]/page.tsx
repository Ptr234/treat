import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata, absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
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

async function loadEvent(id: string) {
  try {
    return await client.fetch<SanityEvent | null>(EVENT_BY_ID_OR_SLUG_QUERY, { id });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const sanityEvent = await loadEvent(id);
  if (!sanityEvent) {
    return buildMetadata({ title: 'Event not found', path: `/events/${id}/`, noIndex: true });
  }
  const event = mapSanityEvent(sanityEvent);
  return buildMetadata({
    title: event.title,
    description: event.description.slice(0, 160),
    path: `/events/${event.id}/`,
  });
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

  const event = mapSanityEvent(sanityEvent);
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.time ? `${event.date}T${event.time}` : event.date,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventAttendanceMode: event.isVirtual
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.isVirtual
      ? { '@type': 'VirtualLocation', url: event.virtualLink ?? absoluteUrl(`/events/${event.id}/`) }
      : { '@type': 'Place', name: event.location, address: event.location },
    organizer: { '@type': 'Organization', name: event.organizer },
    url: absoluteUrl(`/events/${event.id}/`),
    eventStatus: event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
  };

  return (
    <>
      <JsonLd data={eventLd} />
      <EventDetailClient event={event} />
    </>
  );
}
