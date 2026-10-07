'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, FunnelIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel } from '@/lib/roles';
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
  low: 'bg-neutral-100 text-neutral-700',
  normal: 'bg-yellow-50 text-red-600',
  high: 'bg-red-50 text-red-700',
  urgent: 'bg-red-600 text-white',
};

const statusColors: Record<string, string> = {
  new: 'bg-yellow-50 text-red-600',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-neutral-100 text-neutral-700',
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
    const res = await apiFetch<{ inquiries: ContactInquiry[]; total: number }>(`/api/contact/inquiries${query}`);
    if (res.success && res.data) {
      setInquiries(res.data.inquiries || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [agencyFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchInquiries();
  }, [isAuthenticated, fetchInquiries]);

  if (!isAuthenticated || !isAdminLevel(user?.role)) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-700">Admin access required.</p>
      </div>
    );
  }

  const agencies = ['UIA', 'URA', 'URSB', 'DCIC', 'NEMA', 'UNBS', 'KCCA'];

  return (
 <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-md" aria-label="Back">
              <ArrowLeftIcon className="w-5 h-5 text-neutral-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Contact Inquiries</h1>
              <p className="text-sm text-neutral-700">{total} total inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-600" />
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="bg-neutral-100 border border-neutral-200 text-black text-sm rounded-md px-3 py-2 focus:ring-2 focus-visible:ring-red-600"
            >
              <option value="">All Agencies</option>
              {agencies.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">No inquiries found.</div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-5 border-t border-neutral-200 pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-neutral-600">{inq.referenceNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColors[inq.urgency] || urgencyColors.normal}`}>
                        {inq.urgency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inq.status] || statusColors.new}`}>
                        {inq.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black">{inq.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-600 whitespace-nowrap ml-4">
                    {inq.agency}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{inq.message}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-600">
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
