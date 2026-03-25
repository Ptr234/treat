'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

interface ContactInquiry {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  agency: string;
  subject: string;
  message: string;
  urgency: string;
  status: string;
  createdAt: string;
}

const urgencyColors: Record<string, string> = {
  low: 'bg-neutral-700 text-neutral-300',
  normal: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
  urgent: 'bg-red-600/30 text-red-300',
};

const statusColors: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  closed: 'bg-neutral-700 text-neutral-400',
};

export default function InquiriesPage() {
  const { isAuthenticated, user } = useAuth();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyFilter, setAgencyFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const query = agencyFilter ? `?from=0&to=100&agencyCode=${agencyFilter}` : '?from=0&to=100';
    const res = await apiFetch<{ items: ContactInquiry[]; total: number }>(`/api/contact/inquiries${query}`);
    if (res.success && res.data) {
      setInquiries(res.data.items || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [agencyFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchInquiries();
  }, [isAuthenticated, fetchInquiries]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  const agencies = ['UIA', 'URA', 'URSB', 'DCIC', 'NEMA', 'UNBS', 'KCCA'];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-lg" aria-label="Back">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Contact Inquiries</h1>
              <p className="text-sm text-neutral-400">{total} total inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-500" />
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Agencies</option>
              {agencies.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">No inquiries found.</div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-500">{inq.referenceNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColors[inq.urgency] || urgencyColors.normal}`}>
                        {inq.urgency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inq.status] || statusColors.new}`}>
                        {inq.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{inq.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">
                    {inq.agency}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{inq.message}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <EnvelopeIcon className="w-3.5 h-3.5" />
                    {inq.fullName} ({inq.email})
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {new Date(inq.createdAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
