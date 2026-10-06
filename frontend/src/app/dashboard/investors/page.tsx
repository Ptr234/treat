'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, TrashIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';

/**
 * Shape returned by the ASP.NET InvestorsController. The list projection is a
 * subset of the detail projection, so the extra fields are optional and only
 * populated once a profile is opened.
 */
interface InvestorProfile {
  referenceNumber: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  companyName?: string;
  position?: string;
  investorType?: string;
  primarySector?: string;
  secondarySectors?: string[];
  investmentAmount?: string;
  status: string;
  createdAt: string;
  /** Reference of a completed URSB business registration matched by email +
   * company name at creation time, or absent if none was found. */
  linkedBusinessRegistrationRef?: string;
}

/** The sectors an investor registered interest in (primary first, de-duplicated). */
function sectorsOf(inv: InvestorProfile): string[] {
  return [inv.primarySector, ...(inv.secondarySectors ?? [])]
    .filter((s): s is string => Boolean(s))
    .filter((s, i, all) => all.indexOf(s) === i);
}

/**
 * The status as a lower-case key. The API serialises the .NET enum in
 * PascalCase ("Active"), while the badge palette and the `<option>` values are
 * lower-case — without this the badge always fell back to the "new" colour and
 * the dropdown showed "New" for every investor regardless of their real status.
 */
function statusKey(inv: { status: string }): string {
  return (inv.status ?? '').toLowerCase();
}

/** Initials for the avatar, tolerant of a missing/blank name. */
function initialsOf(name: string | undefined): string {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';
}

const statusColors: Record<string, string> = {
  new: 'bg-yellow-50 text-red-600',
  contacted: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-neutral-100 text-neutral-700',
};

export default function InvestorsPage() {
  const { isAuthenticated, user } = useAuth();
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    const query = statusFilter ? `?from=0&to=100&status=${statusFilter}` : '?from=0&to=100';
    const res = await apiFetch<{ investors: InvestorProfile[]; total: number }>(`/api/investors${query}`);
    if (res.success && res.data) {
      setInvestors(res.data.investors || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchInvestors();
  }, [isAuthenticated, fetchInvestors]);

  const handleStatusChange = async (inv: InvestorProfile, newStatus: string) => {
    const res = await apiFetch(`/api/investors/${inv.referenceNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setFeedback({ type: 'success', message: `${inv.name} marked as ${newStatus}.` });
      fetchInvestors();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Update failed.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (inv: InvestorProfile) => {
    if (!confirm(`Delete investor ${inv.name} (${inv.referenceNumber})? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/investors/${inv.referenceNumber}`, { method: 'DELETE' });
    if (res.success) {
      setFeedback({ type: 'success', message: `${inv.name} deleted.` });
      fetchInvestors();
      if (selectedInvestor?.referenceNumber === inv.referenceNumber) setSelectedInvestor(null);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Delete failed.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const viewInvestor = async (inv: InvestorProfile) => {
    const res = await apiFetch<InvestorProfile>(`/api/investors/${inv.referenceNumber}`);
    if (res.success && res.data) {
      setSelectedInvestor(res.data);
    }
  };

  if (!isAuthenticated || !isAdminLevel(user?.role)) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-md" aria-label="Back">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Investor Pipeline</h1>
              <p className="text-sm text-neutral-700">{total} registered investors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-100 border border-neutral-200 text-black text-sm rounded-md px-3 py-2 focus:ring-2 focus-visible:ring-red-600"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-md border text-sm ${
            feedback.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-50 border-red-700 text-red-300'
          }`}>{feedback.message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investor List */}
          <div className={selectedInvestor ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : investors.length === 0 ? (
              <div className="text-center py-20 text-neutral-600">No investors found.</div>
            ) : (
              <div className="space-y-3">
                {investors.map((inv) => (
                  <div key={inv.referenceNumber} className={`bg-white rounded-md border p-4 transition-colors ${
                    selectedInvestor?.referenceNumber === inv.referenceNumber ? 'border-yellow-400' : 'border-neutral-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 text-red-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {initialsOf(inv.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold flex items-center gap-2 flex-wrap">
                            <span className="truncate">{inv.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[statusKey(inv)] || statusColors.new}`}>
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-600 truncate">
                            {inv.referenceNumber} &middot; {inv.email}
                            {inv.companyName && ` · ${inv.companyName}`}
                          </div>
                          {inv.linkedBusinessRegistrationRef && (
                            <Link
                              href={`/business/registration/${inv.linkedBusinessRegistrationRef}/`}
                              className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 w-fit"
                              title="This investor's company has a completed URSB registration — click to view it"
                            >
                              🔗 URSB: {inv.linkedBusinessRegistrationRef}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <select
                          value={statusKey(inv)}
                          onChange={(e) => handleStatusChange(inv, e.target.value)}
                          className="text-xs text-black px-2 py-1 border-t-2 border-black pt-5"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <button onClick={() => viewInvestor(inv)} title="View details"
                          className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-red-600">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv)} title="Delete"
                          className="p-2 rounded-md hover:bg-red-50 text-neutral-600 hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {sectorsOf(inv).length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {sectorsOf(inv).slice(0, 4).map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">{s}</span>
                        ))}
                        {sectorsOf(inv).length > 4 && (
                          <span className="text-xs text-neutral-600">+{sectorsOf(inv).length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedInvestor && (
            <div className="p-6 h-fit sticky top-8 border-t-2 border-black pt-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Investor Details</h2>
                <button onClick={() => setSelectedInvestor(null)} className="text-neutral-600 hover:text-red-600 text-sm">Close</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-50 text-red-600 flex items-center justify-center font-bold">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-black">{selectedInvestor.name}</div>
                    <div className="text-xs text-neutral-600">{selectedInvestor.referenceNumber}</div>
                  </div>
                </div>
                {[
                  ['Email', selectedInvestor.email],
                  ['Phone', selectedInvestor.phone],
                  ['Nationality', selectedInvestor.nationality],
                  ['Company', selectedInvestor.companyName],
                  ['Investor Type', selectedInvestor.investorType],
                  ['Budget', selectedInvestor.investmentAmount],
                  ['Status', selectedInvestor.status],
                  ['Registered', new Date(selectedInvestor.createdAt).toLocaleDateString('en-UG')],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-neutral-600">{label}</span>
                    <span className="text-black text-right">{value}</span>
                  </div>
                ))}
                {selectedInvestor.linkedBusinessRegistrationRef && (
                  <div className="bg-green-500/10 p-3 border-t-2 border-black pt-5">
                    <span className="text-green-400 text-xs font-medium block mb-1">
                      Linked URSB Registration
                    </span>
                    <p className="text-xs text-neutral-700 mb-2">
                      Matched by email + company name — fundamentals below were
                      already collected and verified by URSB, not re-entered here.
                    </p>
                    <Link
                      href={`/business/registration/${selectedInvestor.linkedBusinessRegistrationRef}/`}
                      className="text-xs text-yellow-500 hover:text-red-600 underline"
                    >
                      View {selectedInvestor.linkedBusinessRegistrationRef} &rarr;
                    </Link>
                  </div>
                )}
                {sectorsOf(selectedInvestor).length > 0 && (
                  <div>
                    <span className="text-neutral-600 block mb-1">Sectors</span>
                    <div className="flex gap-1 flex-wrap">
                      {sectorsOf(selectedInvestor).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-yellow-50 text-red-600 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
