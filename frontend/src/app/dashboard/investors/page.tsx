'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, TrashIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
import { apiFetch } from '@/lib/api-client';

interface InvestorProfile {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  companyName?: string;
  investorType?: string;
  sectorInterests?: string[];
  estimatedBudget?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-neutral-700 text-neutral-400',
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
      setFeedback({ type: 'success', message: `${inv.fullName} marked as ${newStatus}.` });
      fetchInvestors();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Update failed.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (inv: InvestorProfile) => {
    if (!confirm(`Delete investor ${inv.fullName} (${inv.referenceNumber})? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/investors/${inv.referenceNumber}`, { method: 'DELETE' });
    if (res.success) {
      setFeedback({ type: 'success', message: `${inv.fullName} deleted.` });
      fetchInvestors();
      if (selectedInvestor?.id === inv.id) setSelectedInvestor(null);
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg" aria-label="Back">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Investor Pipeline</h1>
              <p className="text-sm text-neutral-400">{total} registered investors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
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
          <div className={`mb-6 p-4 rounded-lg border text-sm ${
            feedback.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>{feedback.message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investor List */}
          <div className={selectedInvestor ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : investors.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">No investors found.</div>
            ) : (
              <div className="space-y-3">
                {investors.map((inv) => (
                  <div key={inv.id} className={`bg-neutral-900 rounded-xl border p-4 transition-colors ${
                    selectedInvestor?.id === inv.id ? 'border-yellow-500' : 'border-neutral-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {inv.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold flex items-center gap-2 flex-wrap">
                            <span className="truncate">{inv.fullName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status] || statusColors.new}`}>
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 truncate">
                            {inv.referenceNumber} &middot; {inv.email}
                            {inv.companyName && ` &middot; ${inv.companyName}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <select
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv, e.target.value)}
                          className="bg-neutral-800 border border-neutral-700 text-xs text-white rounded px-2 py-1"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <button onClick={() => viewInvestor(inv)} title="View details"
                          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-yellow-400">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv)} title="Delete"
                          className="p-2 rounded-lg hover:bg-red-900/30 text-neutral-500 hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {inv.sectorInterests && inv.sectorInterests.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {inv.sectorInterests.slice(0, 4).map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded">{s}</span>
                        ))}
                        {inv.sectorInterests.length > 4 && (
                          <span className="text-xs text-neutral-600">+{inv.sectorInterests.length - 4} more</span>
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
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 h-fit sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Investor Details</h2>
                <button onClick={() => setSelectedInvestor(null)} className="text-neutral-500 hover:text-white text-sm">Close</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selectedInvestor.fullName}</div>
                    <div className="text-xs text-neutral-500">{selectedInvestor.referenceNumber}</div>
                  </div>
                </div>
                {[
                  ['Email', selectedInvestor.email],
                  ['Phone', selectedInvestor.phone],
                  ['Nationality', selectedInvestor.nationality],
                  ['Company', selectedInvestor.companyName],
                  ['Investor Type', selectedInvestor.investorType],
                  ['Budget', selectedInvestor.estimatedBudget],
                  ['Status', selectedInvestor.status],
                  ['Registered', new Date(selectedInvestor.createdAt).toLocaleDateString('en-UG')],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-neutral-500">{label}</span>
                    <span className="text-white text-right">{value}</span>
                  </div>
                ))}
                {selectedInvestor.sectorInterests && selectedInvestor.sectorInterests.length > 0 && (
                  <div>
                    <span className="text-neutral-500 block mb-1">Sectors</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedInvestor.sectorInterests.map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">{s}</span>
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
