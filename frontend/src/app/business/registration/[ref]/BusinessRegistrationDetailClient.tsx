'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/ui/PageHeader';

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

interface PaymentStatus {
  status: 'not_initiated' | 'pending' | 'successful' | 'failed';
  amount: number;
  currency: string;
  paidAt?: string;
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
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const returningFromCheckout = searchParams.get('payment') === 'callback';

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

  const contactEmail = registration?.contactEmail;
  const fetchPayment = useCallback(async () => {
    if (!contactEmail) return;
    const res = await apiFetch<PaymentStatus>(
      `/api/business-registrations/${referenceNumber}/payment?email=${encodeURIComponent(contactEmail)}`
    );
    if (res.success && res.data) setPayment(res.data);
  }, [referenceNumber, contactEmail]);

  useEffect(() => {
    if (registration) fetchPayment();
  }, [registration, fetchPayment]);

  // Flutterwave redirects back here after checkout, but the redirect itself
  // proves nothing — the webhook (verified server-to-server) is the source of
  // truth and can lag slightly behind the browser redirect, so poll briefly
  // rather than trusting the return URL's mere presence.
  useEffect(() => {
    if (!returningFromCheckout || !registration) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      await fetchPayment();
      if (attempts >= 6) clearInterval(interval);
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returningFromCheckout, registration]);

  const payNow = async () => {
    setPayBusy(true);
    setPayError(null);
    const res = await apiFetch<{ paymentLink: string }>(
      `/api/business-registrations/${referenceNumber}/payment/initiate?email=${encodeURIComponent(registration?.contactEmail ?? '')}`,
      { method: 'POST' }
    );
    if (res.success && res.data?.paymentLink) {
      window.location.href = res.data.paymentLink;
    } else {
      setPayError(res.error ?? 'Could not start payment. Please try again.');
      setPayBusy(false);
    }
  };

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
      <div className="gov-container py-24">
        <span role="status" aria-label="Loading" className="block h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="bg-white">
        <PageHeader
          crumbs={[{ label: 'Track an application', href: '/track' }, { label: referenceNumber }]}
          caption="Business registration"
          title="Confirm your email address"
          lead={<p>Enter the email address you used when filing <span className="font-mono font-bold text-black">{referenceNumber}</span>.</p>}
        />
        <div className="gov-container max-w-xl py-12">
          <EnvelopeIcon className="mb-4 h-9 w-9 text-[#ce1126]" aria-hidden="true" />
          <label htmlFor="verify-email" className="gov-label">Email address</label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRegistration(verifyEmail.trim());
            }}
            className="space-y-3"
          >
            <input
              id="verify-email"
              type="email"
              autoComplete="email"
              required
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="gov-input"
            />
            <button type="submit" className="gov-btn">
              Continue
            </button>
          </form>
          {error && <p role="alert" className="gov-inset gov-inset--red mt-4 text-sm font-semibold">{error}</p>}
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="bg-white">
        <PageHeader
          crumbs={[{ label: 'Track an application', href: '/track' }, { label: 'Not found' }]}
          caption="Business registration"
          title="We could not find that registration"
          lead={error ?? 'Check the reference number and try again.'}
          actions={<Link href="/track" className="gov-btn">Try another reference</Link>}
        />
      </div>
    );
  }

  const r = registration;
  const isRejectedTrack = r.status === 'Rejected' || r.status === 'NameRejected';
  const currentStageIndex = STAGES.indexOf(r.status);

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Track an application', href: '/track' }, { label: r.referenceNumber }]}
        caption={<span className="font-mono tracking-wider">{r.referenceNumber}</span>}
        title={r.businessName}
        lead={<p>{r.businessType} · {r.businessStructure} · {r.sector}</p>}
        actions={
          <span className={`gov-tag !px-3 !py-1.5 !text-sm ${isRejectedTrack ? 'gov-tag--red' : r.status === 'CertificateIssued' ? '' : 'gov-tag--gold'}`}>
            {STAGE_LABELS[r.status] ?? r.status}
          </span>
        }
      />
      <div className="gov-container max-w-4xl py-12">
        <div className="mb-10 border-t-4 border-black pt-5">
          <h2 className="text-xl font-bold">Progress</h2>

          {/* Stage timeline */}
          {!isRejectedTrack && (
            <div className="mt-6">
              <div className="flex items-center">
                {STAGES.map((stage, i) => (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                        i <= currentStageIndex ? 'bg-black text-[#ffd700]' : 'border-2 border-[#b9b4a9] bg-white text-[#5c5850]'
                      }`}>
                        {i + 1}
                      </div>
                      <p className="text-xs text-neutral-700 mt-1 text-center w-20">{STAGE_LABELS[stage]}</p>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`flex-1 h-1 ${i < currentStageIndex ? 'bg-black' : 'bg-[#dcd8cf]'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {isRejectedTrack && r.rejectionReason && (
            <div role="alert" className="gov-inset gov-inset--red mt-4">
              <p className="text-[15px] text-black"><strong>Reason:</strong> {r.rejectionReason}</p>
            </div>
          )}

          {r.status === 'CertificateIssued' && r.certificateNumber && (
            <div className="gov-panel mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DocumentCheckIcon className="w-8 h-8 text-[#ffd700]" aria-hidden="true" />
                <div>
                  <p className="font-bold text-white">Certificate {r.certificateNumber}</p>
                  <p className="text-sm text-white/80">Issued {r.certificateIssuedAt ? new Date(r.certificateIssuedAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <Link
                href={`/business/registration/${r.referenceNumber}/certificate/${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ''}`}
                className="gov-btn gov-btn--gold gov-btn--sm"
              >
                View Certificate
              </Link>
            </div>
          )}
        </div>

        {!isRejectedTrack && payment && (
          <div className="mb-10 border-t-4 border-black pt-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
              <CreditCardIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" /> Registration Fee
            </h2>
            {payment.status === 'successful' ? (
              <div className="flex items-center gap-2 text-black">
                <DocumentCheckIcon className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Paid — UGX {payment.amount.toLocaleString()}
                  {payment.paidAt && ` on ${new Date(payment.paidAt).toLocaleDateString()}`}
                </p>
              </div>
            ) : (
              <div>
                {returningFromCheckout && payment.status === 'pending' && (
                  <p className="text-sm text-neutral-600 mb-3">Confirming your payment with the provider — this can take a moment…</p>
                )}
                {payment.status === 'failed' && (
                  <p className="gov-inset gov-inset--red mb-3 text-sm font-semibold">Your last payment attempt didn&apos;t go through. Please try again.</p>
                )}
                <p className="text-sm text-neutral-700 mb-3">
                  UGX {payment.amount.toLocaleString()} is due before a certificate can be issued.
                </p>
                {payError && <p className="gov-inset gov-inset--red mb-3 text-sm font-semibold">{payError}</p>}
                <button
                  onClick={payNow}
                  disabled={payBusy}
                  className="gov-btn gov-btn--sm"
                >
                  {payBusy ? 'Redirecting to payment…' : `Pay Registration Fee (UGX ${payment.amount.toLocaleString()})`}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-10 border-t-4 border-black pt-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
            <BuildingOfficeIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" /> Business Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="font-bold text-[#5c5850]">Location</dt><dd className="text-black font-medium">{r.location}</dd></div>
            <div><dt className="font-bold text-[#5c5850]">Sector</dt><dd className="text-black font-medium">{r.sector}</dd></div>
            {r.initialCapital && <div><dt className="font-bold text-[#5c5850]">Initial Capital</dt><dd className="text-black font-medium">{r.initialCapital}</dd></div>}
            {r.projectedTurnover && <div><dt className="font-bold text-[#5c5850]">Projected Turnover</dt><dd className="text-black font-medium">{r.projectedTurnover}</dd></div>}
          </dl>
          {r.businessDescription && (
            <p className="text-sm text-neutral-700 mt-4 border-t border-neutral-200 pt-4">{r.businessDescription}</p>
          )}

          <h3 className="text-sm font-bold text-black mt-6 mb-2">Owners</h3>
          <div className="space-y-2">
            {r.owners.map((o, i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-neutral-200">
                <span className="text-black">{o.name} ({o.nationality})</span>
                <span className="text-neutral-700">{o.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-4 border-black pt-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-black">
            <CalendarIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" /> Timeline
          </h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="font-bold text-[#5c5850]">Submitted</dt><dd className="text-black">{new Date(r.createdAt).toLocaleString()}</dd></div>
            {r.nameDecisionAt && (
              <div className="flex justify-between"><dt className="font-bold text-[#5c5850]">Name Decision</dt><dd className="text-black">{new Date(r.nameDecisionAt).toLocaleString()}</dd></div>
            )}
            <div className="flex justify-between"><dt className="font-bold text-[#5c5850]">Processing Time</dt><dd className="text-black">{r.processingHours < 24 ? `${r.processingHours}h` : `${(r.processingHours / 24).toFixed(1)}d`}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
