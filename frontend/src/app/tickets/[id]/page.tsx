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
 <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <TicketDetailClient ticketId={id} />
    </Suspense>
  );
}
