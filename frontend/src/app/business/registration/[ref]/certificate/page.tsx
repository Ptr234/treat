import { Suspense } from 'react';
import CertificateClient from './CertificateClient';

interface PageProps {
  params: Promise<{ ref: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { ref } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CertificateClient referenceNumber={ref} />
    </Suspense>
  );
}
