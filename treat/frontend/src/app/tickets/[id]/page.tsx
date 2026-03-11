import React from 'react';
import { mockTickets } from '@/data/mock/tickets';
import TicketDetailClient from './TicketDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Static params for build-time route generation (mock data as baseline)
export async function generateStaticParams() {
  return mockTickets.map((ticket) => ({
    id: ticket.id,
  }));
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Pass mock ticket as initial data; client component will fetch from Firestore
  const initialTicket = mockTickets.find((t) => t.id === id) || null;

  return <TicketDetailClient ticket={initialTicket} ticketId={id} />;
}
