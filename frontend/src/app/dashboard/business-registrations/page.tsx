'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentCheckIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isStaff } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';

interface OwnerInfo {
  name: string;
  nationality: string;
  percentage: string;
}

interface RegistrationListItem {
  referenceNumber: string;
  businessName: string;
  businessType: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  status: string;
  createdAt: string;
  certificateIssuedAt?: string;
}

interface RegistrationDetail extends RegistrationListItem {
  businessStructure: string;
  businessDescription?: string;
  location: string;
  owners: OwnerInfo[];
  initialCapital?: string;
  projectedTurnover?: string;
  contactPhone?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  certificateNumber?: string;
  processingHours: number;
}

const STATUS_LABELS: Record<string, string> = {
  Received: 'Received',
  UnderReview: 'Under Review',
  NameApproved: 'Name Approved',
  NameRejected: 'Name Rejected',
  CertificateIssued: 'Certificate Issued',
  Rejected: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  Received: 'bg-blue-100 text-blue-800',
  UnderReview: 'bg-yellow-50 text-red-600',
  NameApproved: 'bg-purple-100 text-purple-800',
  CertificateIssued: 'bg-green-100 text-green-800',
  NameRejected: 'bg-red-50 text-red-700',
  Rejected: 'bg-red-50 text-red-700',
};

export default function BusinessRegistrationsPage() {
  const { isAuthenticated, user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RegistrationDetail | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<{ status: string; amount: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');
  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<{ registrations: RegistrationListItem[]; total: number }>(
      '/api/business-registrations?from=0&to=100'
    );
    if (res.success && res.data) {
      setRegistrations(res.data.registrations || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchList();
  }, [isAuthenticated, fetchList]);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const viewDetail = async (ref: string) => {
    const res = await apiFetch<RegistrationDetail>(`/api/business-registrations/${ref}`);
    if (res.success && res.data) setSelected(res.data);
    const paymentRes = await apiFetch<{ status: string; amount: number }>(`/api/business-registrations/${ref}/payment`);
    setSelectedPayment(paymentRes.success && paymentRes.data ? paymentRes.data : null);
  };

  const updateStatus = async (ref: string, status: string, rejectionReason?: string) => {
    setBusy(true);
    const res = await apiFetch(`/api/business-registrations/${ref}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason: rejectionReason ?? null }),
    });
    if (res.success) {
      notify('success', `${ref} updated to ${STATUS_LABELS[status] ?? status}.`);
      await fetchList();
      if (selected?.referenceNumber === ref) await viewDetail(ref);
      setShowRejectFor(null);
      setRejectReasonDraft('');
    } else {
      notify('error', res.error || 'Update failed.');
    }
    setBusy(false);
  };

  if (!isAuthenticated || !isStaff(user?.role)) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Staff access required.</p>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-md" aria-label="Back">
            <ArrowLeftIcon className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Business Registrations</h1>
            <p className="text-sm text-neutral-700">{total} registrations · URSB registry</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-md border text-sm ${
            feedback.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'
          }`}>{feedback.message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={selected ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-20 text-neutral-600">No business registrations yet.</div>
            ) : (
              <div className="space-y-3">
                {registrations.map((r) => (
                  <div key={r.referenceNumber} className={`bg-white rounded-md border p-4 ${
                    selected?.referenceNumber === r.referenceNumber ? 'border-yellow-400' : 'border-neutral-200'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold flex items-center gap-2 flex-wrap">
                          <span className="truncate">{r.businessName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-neutral-100 text-neutral-700'}`}>
                            {STATUS_LABELS[r.status] ?? r.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 truncate">
                          {r.referenceNumber} &middot; {r.contactName} &middot; {r.contactEmail}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {(r.status === 'Received' || r.status === 'UnderReview') && (
                          <button
                            disabled={busy}
                            onClick={() => updateStatus(r.referenceNumber, 'name_approved')}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600/80 hover:bg-purple-600 text-white disabled:opacity-50"
                          >
                            Approve Name
                          </button>
                        )}
                        {r.status === 'NameApproved' && (
                          <button
                            disabled={busy}
                            onClick={() => updateStatus(r.referenceNumber, 'certificate_issued')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600/80 hover:bg-green-600 text-white disabled:opacity-50"
                          >
                            <DocumentCheckIcon className="w-3.5 h-3.5" /> Issue Certificate
                          </button>
                        )}
                        {(r.status === 'Received' || r.status === 'UnderReview' || r.status === 'NameApproved') && (
                          <button
                            disabled={busy}
                            onClick={() => setShowRejectFor(showRejectFor === r.referenceNumber ? null : r.referenceNumber)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-50"
                          >
                            <XCircleIcon className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        <button onClick={() => viewDetail(r.referenceNumber)} title="View details"
                          className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {showRejectFor === r.referenceNumber && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={rejectReasonDraft}
                          onChange={(e) => setRejectReasonDraft(e.target.value)}
                          placeholder="Reason for rejection (required)"
                          className="flex-1 text-sm text-black px-3 py-1.5 border-t border-neutral-200 pt-5"
                        />
                        <button
                          disabled={busy || !rejectReasonDraft.trim()}
                          onClick={() => updateStatus(r.referenceNumber, 'rejected', rejectReasonDraft.trim())}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="p-6 h-fit sticky top-8 border-t border-neutral-200 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Registration Details</h2>
                <button onClick={() => { setSelected(null); setSelectedPayment(null); }} className="text-neutral-600 hover:text-red-600 text-sm">Close</button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-black">{selected.businessName}</div>
                  <div className="text-xs text-neutral-600">{selected.referenceNumber}</div>
                </div>
                {[
                  ['Type', `${selected.businessType} · ${selected.businessStructure}`],
                  ['Sector', selected.sector],
                  ['Location', selected.location],
                  ['Contact', `${selected.contactName} (${selected.contactEmail})`],
                  ['Phone', selected.contactPhone],
                  ['Initial Capital', selected.initialCapital],
                  ['Projected Turnover', selected.projectedTurnover],
                  ['Status', STATUS_LABELS[selected.status] ?? selected.status],
                  ['Registration Fee', selectedPayment
                    ? selectedPayment.status === 'successful'
                      ? `Paid (UGX ${selectedPayment.amount.toLocaleString()})`
                      : `Not paid (UGX ${selectedPayment.amount.toLocaleString()} due) — certificate cannot be issued yet`
                    : null],
                  ['Processing Time', selected.processingHours < 24 ? `${selected.processingHours}h` : `${(selected.processingHours / 24).toFixed(1)}d`],
                  ['Certificate #', selected.certificateNumber],
                  ['Rejection Reason', selected.rejectionReason],
                  ['Submitted', new Date(selected.createdAt).toLocaleDateString('en-UG')],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-neutral-600 flex-shrink-0">{label}</span>
                    <span className="text-black text-right">{value}</span>
                  </div>
                ))}
                {selected.owners?.length > 0 && (
                  <div>
                    <span className="text-neutral-600 block mb-1">Owners</span>
                    <div className="space-y-1">
                      {selected.owners.map((o, i) => (
                        <div key={i} className="flex justify-between text-xs bg-neutral-100 rounded px-2 py-1">
                          <span>{o.name} ({o.nationality})</span>
                          <span>{o.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  href={`/business/registration/${selected.referenceNumber}/`}
                  className="block text-center mt-2 text-xs text-yellow-500 hover:text-red-600 underline"
                >
                  Open applicant tracking view
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
