import { mockEvents } from '@/data/mock/events';
import EventDetailClient from './EventDetailClient';

export function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const initialEvent = mockEvents.find(e => e.id === id) || null;

  return <EventDetailClient event={initialEvent} eventId={id} />;
}
