'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface MyTicket {
  referenceNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  slaDeadlineAt?: string;
  isEscalated: boolean;
  createdAt: string;
}
interface MyInquiry {
  referenceNumber: string;
  agencyCode: string;
  agencyName: string;
  serviceType: string;
  subject: string;
  status: string;
  createdAt: string;
}
interface MyAppointment {
  referenceNumber: string;
  agencyCode: string;
  agencyName: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  status: string;
  createdAt: string;
}
interface MyInvestor {
  referenceNumber: string;
  status: string;
  primarySector: string;
  investmentAmount: string;
  investorType: string;
  createdAt: string;
}
interface Submissions {
  tickets: MyTicket[];
  inquiries: MyInquiry[];
  appointments: MyAppointment[];
  investor?: MyInvestor | null;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s.includes('resolved') || s.includes('closed') || s.includes('active') || s.includes('confirmed')
      ? 'bg-green-100 text-green-800'
      : s.includes('progress') || s.includes('assigned') || s.includes('contacted') || s.includes('scheduled')
      ? 'bg-blue-100 text-blue-800'
      : s.includes('pending') || s.includes('new') || s.includes('requested')
      ? 'bg-yellow-100 text-yellow-800'
      : s.includes('inactive') || s.includes('cancelled') || s.includes('rejected')
      ? 'bg-red-100 text-red-800'
      : 'bg-neutral-100 text-neutral-700';
  // Humanize PascalCase / SNAKE_CASE
  const label = status.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AccountPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Submissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Submissions>('/api/me/submissions');
      if (res.success && res.data) setData(res.data);
      else setError(res.error || 'Could not load your submissions');
    } catch {
      setError('Network error — could not load your submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">My Submissions</h1>
          <p className="text-gray-600 mb-6">Sign in to track your inquiries, appointments, and investor application.</p>
          <Link href="/" className="inline-block w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const tickets = data?.tickets ?? [];
  const inquiries = data?.inquiries ?? [];
  const appointments = data?.appointments ?? [];
  const investor = data?.investor ?? null;
  const totalCount = tickets.length + inquiries.length + appointments.length + (investor ? 1 : 0);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold">{user?.name}</span> — track everything you&apos;ve submitted to the OneStop Centre.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-neutral-50 self-start"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your submissions…
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        {!loading && !error && totalCount === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-10 text-center">
            <p className="text-gray-700 font-medium mb-2">You haven&apos;t submitted anything yet.</p>
            <p className="text-gray-500 mb-6">Start an inquiry, book an appointment, or register as an investor.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/tickets/create" className="px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800">New Inquiry</Link>
              <Link href="/investments/onboarding" className="px-5 py-2.5 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400">Become an Investor</Link>
            </div>
          </div>
        )}

        {!loading && !error && totalCount > 0 && (
          <div className="space-y-8">
            {/* Investor application */}
            {investor && (
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BriefcaseIcon className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-900">Investor Application</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="font-semibold text-gray-900">{investor.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <StatusBadge status={investor.status} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sector</p>
                    <p className="font-medium text-gray-900">{investor.primarySector}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">{fmtDate(investor.createdAt)}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Tickets */}
            {tickets.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
                  <TicketIcon className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-900">Inquiries &amp; Tickets</h2>
                  <span className="text-sm text-gray-400">({tickets.length})</span>
                </div>
                <ul className="divide-y divide-neutral-100">
                  {tickets.map((t) => (
                    <li key={t.referenceNumber} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-500">
                          {t.referenceNumber} · {t.category.replace(/_/g, ' ')} · {fmtDate(t.createdAt)}
                          {t.isEscalated && <span className="ml-2 text-red-600 font-semibold">Escalated</span>}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                      <Link
                        href={`/tickets/${t.referenceNumber}?email=${encodeURIComponent(user?.email || '')}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-yellow-700 hover:text-yellow-800"
                      >
                        Track <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Inquiries (agency contact) */}
            {inquiries.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-900">Agency Inquiries</h2>
                  <span className="text-sm text-gray-400">({inquiries.length})</span>
                </div>
                <ul className="divide-y divide-neutral-100">
                  {inquiries.map((i) => (
                    <li key={i.referenceNumber} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{i.subject}</p>
                        <p className="text-xs text-gray-500">{i.referenceNumber} · {i.agencyName} ({i.agencyCode}) · {fmtDate(i.createdAt)}</p>
                      </div>
                      <StatusBadge status={i.status} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
                  <CalendarDaysIcon className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-900">Appointments</h2>
                  <span className="text-sm text-gray-400">({appointments.length})</span>
                </div>
                <ul className="divide-y divide-neutral-100">
                  {appointments.map((a) => (
                    <li key={a.referenceNumber} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{a.serviceType} · {a.agencyName}</p>
                        <p className="text-xs text-gray-500">{a.referenceNumber} · {fmtDate(a.preferredDate)} at {a.preferredTime} · {a.meetingType}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
