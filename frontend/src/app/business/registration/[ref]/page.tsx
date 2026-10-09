import { Suspense } from 'react';
import BusinessRegistrationDetailClient from './BusinessRegistrationDetailClient';

interface PageProps {
  params: Promise<{ ref: string }>;
}

export default async function BusinessRegistrationDetailPage({ params }: PageProps) {
  const { ref } = await params;

  return (
    <Suspense
      fallback={
        <div className="gov-container py-24">
          <p role="status" className="flex items-center gap-3 text-[#3b3934]">
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
            Loading registration…
          </p>
        </div>
      }
    >
      <BusinessRegistrationDetailClient referenceNumber={ref} />
    </Suspense>
  );
}
