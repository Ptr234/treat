'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
 return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
    </div>;
  }

  if (error || !cert) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="gov-inset gov-inset--red max-w-md">
          <p className="mb-3 font-semibold text-black">{error}</p>
          <Link href={`/business/registration/${referenceNumber}/`} className="gov-link text-sm">
            Back to registration status
          </Link>
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-[#f5f3ee] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={`/business/registration/${referenceNumber}/${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}`} className="gov-link inline-flex items-center gap-1 text-sm">
            <ArrowLeftIcon className="w-4 h-4" /> Back to registration status
          </Link>
          <button
            onClick={() => window.print()}
            className="gov-btn gov-btn--sm"
          >
            <PrinterIcon className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>

        {/* The certificate itself */}
        <div className="bg-white shadow-[0_2px_24px_rgb(0_0_0/0.08)] print:shadow-none">
          <div className="gov-stripe gov-stripe--thick" aria-hidden="true" />
          <div className="m-3 border-[6px] border-double border-black p-8 sm:p-12">
          <div className="text-center border-b-2 border-[#ffd700] pb-6 mb-8">
            <Image src="/images/uganda-flag.png" alt="" width={60} height={40} className="mx-auto mb-4 h-10 w-[60px] object-cover ring-1 ring-black/20" />
            <p className="text-xs tracking-[0.3em] text-[#9a0d1c] font-bold uppercase">The Republic of Uganda</p>
            <h1 className="font-display text-3xl font-semibold text-black mt-2">Uganda Registration Services Bureau</h1>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-[#3b3934]">Certificate of Business Registration</p>
          </div>

          <p className="text-center text-neutral-800 mb-6">This is to certify that</p>
          <h2 className="font-display text-4xl font-semibold text-center text-black mb-2">{cert.businessName}</h2>
          <p className="text-center text-neutral-700 mb-8">
            {cert.businessStructure} · {cert.businessType} · {cert.location}
          </p>

          <p className="text-center text-neutral-800 mb-8">
            has been duly registered with the Uganda Registration Services Bureau
            in accordance with the laws of the Republic of Uganda.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Registration Reference</p>
              <p className="font-mono font-bold text-black">{cert.referenceNumber}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Certificate Number</p>
              <p className="font-bold text-black">{cert.certificateNumber}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">Date Issued</p>
              <p className="font-bold text-black">{new Date(cert.issuedAt).toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-600 mb-2">Registered Owners</p>
            {cert.owners.map((o, i) => (
              <p key={i} className="text-sm text-neutral-800">{o.name} — {o.nationality} ({o.percentage}%)</p>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
            Issued via the Uganda OneStop Centre Digital Tool. Verify at oscdigitaltool.com/business/registration/{cert.referenceNumber}
          </div>
          </div>
          <div className="gov-stripe gov-stripe--thick" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
