'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface OwnerInfo {
  name: string;
  nationality: string;
  idNumber?: string;
  percentage: string;
}

interface RegistrationDetail {
  referenceNumber: string;
  businessName: string;
  businessType: string;
  businessStructure: string;
  businessDescription?: string;
  sector: string;
  location: string;
  owners: OwnerInfo[];
  initialCapital?: string;
  projectedTurnover?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: string;
  assignedAgencyCode: string;
  reviewNotes?: string;
  rejectionReason?: string;
  nameDecisionAt?: string;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  createdAt: string;
  processingHours: number;
}

// The stages a registration moves through on the happy path. Rejected /
// NameRejected are terminal off-ramps, shown separately rather than in-line.
const STAGES = ['Received', 'UnderReview', 'NameApproved', 'CertificateIssued'];

const STAGE_LABELS: Record<string, string> = {
  Received: 'Received',
  UnderReview: 'Under Review',
  NameApproved: 'Name Approved',
  CertificateIssued: 'Certificate Issued',
  NameRejected: 'Name Rejected',
  Rejected: 'Rejected',
};

export default function BusinessRegistrationDetailClient({ referenceNumber }: { referenceNumber: string }) {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const isStaff = isAuthenticated && ['admin', 'dg', 'agency_officer'].includes(user?.role ?? '');

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const fetchRegistration = useCallback(
    async (email: string | null) => {
      setLoading(true);
      const qs = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await apiFetch<RegistrationDetail>(`/api/business-registrations/${referenceNumber}${qs}`);
      if (res.success && res.data) {
        setRegistration(res.data);
        setNeedsVerification(false);
        setError(null);
      } else if (!isStaff) {
        setNeedsVerification(true);
      } else {
        setError(res.error ?? 'Registration not found');
      }
      setLoading(false);
    },
    [referenceNumber, isStaff]
  );

  useEffect(() => {
    if (authLoading) return;
    if (isStaff) {
      fetchRegistration(null);
    } else if (emailParam) {
      fetchRegistration(emailParam);
    } else {
      setLoading(false);
      setNeedsVerification(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isStaff, emailParam]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EnvelopeIcon className="w-10 h-10 text-yellow-600 mb-3" />
          <h1 className="text-lg font-bold text-gray-900 mb-2">Verify your email to track this registration</h1>
          <p className="text-sm text-gray-600 mb-4">
            Enter the email address you used when filing {referenceNumber}.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRegistration(verifyEmail.trim());
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button type="submit" className="w-full py-2 bg-yellow-600 text-black font-semibold rounded-md hover:bg-yellow-500">
              Track Registration
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{error ?? 'Registration not found'}</p>
      </div>
    );
  }

  const r = registration;
  const isRejectedTrack = r.status === 'Rejected' || r.status === 'NameRejected';
  const currentStageIndex = STAGES.indexOf(r.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/business/registration/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Registration
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500">{r.referenceNumber}</p>
              <h1 className="text-2xl font-bold text-gray-900">{r.businessName}</h1>
              <p className="text-sm text-gray-600 mt-1">{r.businessType} · {r.businessStructure} · {r.sector}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              isRejectedTrack ? 'bg-red-50 text-red-700 border-red-200' :
              r.status === 'CertificateIssued' ? 'bg-green-50 text-green-700 border-green-200' :
              'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {STAGE_LABELS[r.status] ?? r.status}
            </span>
          </div>

          {/* Stage timeline */}
          {!isRejectedTrack && (
            <div className="mt-6">
              <div className="flex items-center">
                {STAGES.map((stage, i) => (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        i <= currentStageIndex ? 'bg-yellow-600 text-black' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {i + 1}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center w-20">{STAGE_LABELS[stage]}</p>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 ${i < currentStageIndex ? 'bg-yellow-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {isRejectedTrack && r.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800"><strong>Reason:</strong> {r.rejectionReason}</p>
            </div>
          )}

          {r.status === 'CertificateIssued' && r.certificateNumber && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <DocumentCheckIcon className="w-6 h-6 text-green-700" />
                <div>
                  <p className="text-sm font-medium text-green-800">Certificate {r.certificateNumber}</p>
                  <p className="text-xs text-green-600">Issued {r.certificateIssuedAt ? new Date(r.certificateIssuedAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <Link
                href={`/business/registration/${r.referenceNumber}/certificate/${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}`}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                View Certificate
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-500" /> Business Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Location</dt><dd className="text-gray-900 font-medium">{r.location}</dd></div>
            <div><dt className="text-gray-500">Sector</dt><dd className="text-gray-900 font-medium">{r.sector}</dd></div>
            {r.initialCapital && <div><dt className="text-gray-500">Initial Capital</dt><dd className="text-gray-900 font-medium">{r.initialCapital}</dd></div>}
            {r.projectedTurnover && <div><dt className="text-gray-500">Projected Turnover</dt><dd className="text-gray-900 font-medium">{r.projectedTurnover}</dd></div>}
          </dl>
          {r.businessDescription && (
            <p className="text-sm text-gray-600 mt-4 border-t border-gray-100 pt-4">{r.businessDescription}</p>
          )}

          <h3 className="text-sm font-bold text-gray-900 mt-6 mb-2">Owners</h3>
          <div className="space-y-2">
            {r.owners.map((o, i) => (
              <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-md px-3 py-2">
                <span className="text-gray-900">{o.name} ({o.nationality})</span>
                <span className="text-gray-600">{o.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" /> Timeline
          </h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-gray-500">Submitted</dt><dd className="text-gray-900">{new Date(r.createdAt).toLocaleString()}</dd></div>
            {r.nameDecisionAt && (
              <div className="flex justify-between"><dt className="text-gray-500">Name Decision</dt><dd className="text-gray-900">{new Date(r.nameDecisionAt).toLocaleString()}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-gray-500">Processing Time</dt><dd className="text-gray-900">{r.processingHours < 24 ? `${r.processingHours}h` : `${(r.processingHours / 24).toFixed(1)}d`}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
