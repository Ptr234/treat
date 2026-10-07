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
  // Uganda flag palette only: black marks a finished/good outcome (the
  // classic "in the black"), gold marks something actively in motion,
  // neutral marks a wait, red marks a bad outcome.
  const cls =
    s.includes('resolved') || s.includes('closed') || s.includes('active') || s.includes('confirmed')
      ? 'bg-black text-yellow-400'
      : s.includes('progress') || s.includes('assigned') || s.includes('contacted') || s.includes('scheduled')
      ? 'bg-yellow-100 text-black ring-1 ring-inset ring-yellow-300'
      : s.includes('pending') || s.includes('new') || s.includes('requested')
      ? 'bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-300'
      : s.includes('inactive') || s.includes('cancelled') || s.includes('rejected')
      ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
      : 'bg-neutral-50 text-neutral-500';
  // Humanize PascalCase / SNAKE_CASE
  const label = status.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
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
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center pt-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <LockClosedIcon className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-3">My Submissions</h1>
          <p className="text-neutral-700 mb-6">Sign in to track your inquiries, appointments, and investor application.</p>
          <Link href="/" className="inline-block w-full px-6 py-3 bg-black text-yellow-400 font-semibold hover:bg-neutral-800 transition-colors">
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
 <div className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">My Submissions</h1>
            <p className="text-neutral-700 mt-1">
              Welcome back, <span className="font-semibold">{user?.name}</span> — track everything you&apos;ve submitted to the OneStop Centre.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 pb-0.5 text-sm font-bold text-black hover:text-red-600 self-start"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-neutral-600">
            <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
            Loading your submissions…
          </div>
        )}

        {!loading && error && (
          <div className="border-l-4 border-red-600 pl-4 py-2 mb-6 text-red-700">{error}</div>
        )}

        {!loading && !error && totalCount === 0 && (
          <div className=" pt-10 text-center">
            <p className="text-black font-bold mb-2">You haven&apos;t submitted anything yet.</p>
            <p className="text-neutral-600 mb-6">Start an inquiry, book an appointment, or register as an investor.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/tickets/create" className="px-5 py-2.5 bg-black text-yellow-400 font-semibold hover:bg-neutral-800">New Inquiry</Link>
              <Link href="/investments/onboarding" className="px-5 py-2.5 bg-yellow-400 text-black font-semibold hover:bg-yellow-300">Become an Investor</Link>
            </div>
          </div>
        )}

        {!loading && !error && totalCount > 0 && (
          <div className="space-y-8">
            {/* Investor application */}
            {investor && (
              <section className="border-t border-neutral-200 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <BriefcaseIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-black">Investor Application</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-neutral-600">Reference</p>
                    <p className="font-semibold text-black">{investor.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Status</p>
                    <StatusBadge status={investor.status} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Sector</p>
                    <p className="font-medium text-black">{investor.primarySector}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600">Submitted</p>
                    <p className="font-medium text-black">{fmtDate(investor.createdAt)}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Tickets */}
            {tickets.length > 0 && (
              <section className="border-t border-neutral-200 pt-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
                  <TicketIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-black">Inquiries &amp; Tickets</h2>
                  <span className="text-sm text-neutral-600">({tickets.length})</span>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {tickets.map((t) => (
                    <li key={t.referenceNumber} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black truncate">{t.title}</p>
                        <p className="text-xs text-neutral-600">
                          {t.referenceNumber} · {t.category.replace(/_/g, ' ')} · {fmtDate(t.createdAt)}
                          {t.isEscalated && <span className="ml-2 text-red-600 font-semibold">Escalated</span>}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                      <Link
                        href={`/tickets/${t.referenceNumber}?email=${encodeURIComponent(user?.email || '')}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-black underline decoration-2 underline-offset-4 hover:text-red-600"
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
              <section className="border-t border-neutral-200 pt-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-black">Agency Inquiries</h2>
                  <span className="text-sm text-neutral-600">({inquiries.length})</span>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {inquiries.map((i) => (
                    <li key={i.referenceNumber} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black truncate">{i.subject}</p>
                        <p className="text-xs text-neutral-600">{i.referenceNumber} · {i.agencyName} ({i.agencyCode}) · {fmtDate(i.createdAt)}</p>
                      </div>
                      <StatusBadge status={i.status} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <section className="border-t border-neutral-200 pt-5">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
                  <CalendarDaysIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-black">Appointments</h2>
                  <span className="text-sm text-neutral-600">({appointments.length})</span>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {appointments.map((a) => (
                    <li key={a.referenceNumber} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black truncate">{a.serviceType} · {a.agencyName}</p>
                        <p className="text-xs text-neutral-600">{a.referenceNumber} · {fmtDate(a.preferredDate)} at {a.preferredTime} · {a.meetingType}</p>
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
