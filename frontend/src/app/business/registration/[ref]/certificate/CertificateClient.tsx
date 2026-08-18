'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface OwnerInfo {
  name: string;
  nationality: string;
  percentage: string;
}

interface Certificate {
  referenceNumber: string;
  certificateNumber: string;
  businessName: string;
  businessType: string;
  businessStructure: string;
  location: string;
  owners: OwnerInfo[];
  issuedAt: string;
}

export default function CertificateClient({ referenceNumber }: { referenceNumber: string }) {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const isStaff = isAuthenticated && ['admin', 'dg', 'agency_officer'].includes(user?.role ?? '');

  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isStaff && !emailParam) {
      setError('Add ?email= with the email this registration was filed under to view the certificate.');
      setLoading(false);
      return;
    }
    (async () => {
      const qs = emailParam ? `?email=${encodeURIComponent(emailParam)}` : '';
      const res = await apiFetch<Certificate>(`/api/business-registrations/${referenceNumber}/certificate${qs}`);
      if (res.success && res.data) {
        setCert(res.data);
      } else {
        setError(res.error ?? 'Certificate not available yet');
      }
      setLoading(false);
    })();
  }, [authLoading, isStaff, emailParam, referenceNumber]);

  if (loading || authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href={`/business/registration/${referenceNumber}/`} className="text-yellow-700 underline text-sm">
            Back to registration status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href={`/business/registration/${referenceNumber}/${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="w-4 h-4" /> Back to registration status
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-800"
          >
            <PrinterIcon className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>

        {/* The certificate itself */}
        <div className="bg-white border-8 border-double border-yellow-600 rounded-lg p-10 print:border-4 print:shadow-none shadow-lg">
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <p className="text-xs tracking-[0.3em] text-red-700 font-bold uppercase">Republic of Uganda</p>
            <h1 className="text-2xl font-black text-gray-900 mt-2">Uganda Registration Services Bureau</h1>
            <p className="text-sm text-gray-600 mt-1">Certificate of Business Registration</p>
          </div>

          <p className="text-center text-gray-700 mb-6">This is to certify that</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{cert.businessName}</h2>
          <p className="text-center text-gray-600 mb-8">
            {cert.businessStructure} · {cert.businessType} · {cert.location}
          </p>

          <p className="text-center text-gray-700 mb-8">
            has been duly registered with the Uganda Registration Services Bureau
            in accordance with the laws of the Republic of Uganda.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Registration Reference</p>
              <p className="font-bold text-gray-900">{cert.referenceNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Certificate Number</p>
              <p className="font-bold text-gray-900">{cert.certificateNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Date Issued</p>
              <p className="font-bold text-gray-900">{new Date(cert.issuedAt).toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-2">Registered Owners</p>
            {cert.owners.map((o, i) => (
              <p key={i} className="text-sm text-gray-800">{o.name} — {o.nationality} ({o.percentage}%)</p>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
            Issued via the Uganda OneStop Centre Digital Tool. Verify at oscdigitaltool.com/business/registration/{cert.referenceNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
