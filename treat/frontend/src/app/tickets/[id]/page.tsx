import { Suspense } from 'react';
import TicketDetailClient from './TicketDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <TicketDetailClient ticketId={id} />
    </Suspense>
  );
}
