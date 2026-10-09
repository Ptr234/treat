'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import PageHeader from '@/components/ui/PageHeader';
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
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
interface MyChatEnquiry {
  sessionId: string;
  lastMessage: string;
  messageCount: number;
  lastActivityAt: string;
}
interface Submissions {
  tickets: MyTicket[];
  inquiries: MyInquiry[];
  appointments: MyAppointment[];
  investor?: MyInvestor | null;
  chatEnquiries?: MyChatEnquiry[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  // Uganda flag palette only: black marks a finished/good outcome (the
  // classic "in the black"), gold marks something actively in motion,
  // neutral marks a wait, red marks a bad outcome.
  // Bad outcomes are tested first: "inactive" contains "active".
  const cls =
    s.includes('inactive') || s.includes('cancelled') || s.includes('rejected')
      ? 'gov-tag--red'
      : s.includes('resolved') || s.includes('closed') || s.includes('active') || s.includes('confirmed')
      ? ''
      : s.includes('progress') || s.includes('assigned') || s.includes('contacted') || s.includes('scheduled')
      ? 'gov-tag--gold'
      : s.includes('pending') || s.includes('new') || s.includes('requested')
      ? 'gov-tag--outline'
      : 'gov-tag--grey';
  // Humanize PascalCase / SNAKE_CASE
  const label = status.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return <span className={`gov-tag ${cls}`}>{label}</span>;
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
      <div className="gov-container py-24">
        <span role="status" aria-label="Loading" className="block h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white">
        <PageHeader
          crumbs={[{ label: 'Your submissions' }]}
          caption="Your account"
          title="Your submissions"
          lead="Sign in to track your enquiries, appointments and investor application."
          actions={<Link href="/" className="gov-btn">Return to the homepage</Link>}
        />
      </div>
    );
  }

  const tickets = data?.tickets ?? [];
  const inquiries = data?.inquiries ?? [];
  const appointments = data?.appointments ?? [];
  const investor = data?.investor ?? null;
  const chatEnquiries = data?.chatEnquiries ?? [];
  const totalCount = tickets.length + inquiries.length + appointments.length + chatEnquiries.length + (investor ? 1 : 0);

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Your submissions' }]}
        caption="Your account"
        title="Your submissions"
        lead={<p>Welcome back, <strong className="text-black">{user?.name}</strong>. Track everything you&apos;ve submitted to the OneStop Centre.</p>}
        actions={
          <button type="button" onClick={load} className="gov-btn gov-btn--secondary">
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        }
      />
      <div className="gov-container max-w-5xl py-12">
        {loading && (
          <div role="status" className="flex items-center gap-3 py-16 text-[#3b3934]">
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
            Loading your submissions…
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="gov-inset gov-inset--red mb-6 font-semibold">{error}</div>
        )}

        {!loading && !error && totalCount === 0 && (
          <div className="gov-inset py-8">
            <p className="text-black font-bold mb-2">You haven&apos;t submitted anything yet.</p>
            <p className="text-neutral-600 mb-6">Start an inquiry, book an appointment, or register as an investor.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tickets/create" className="gov-btn">Submit an enquiry</Link>
              <Link href="/investments/onboarding" className="gov-btn gov-btn--secondary">Register as an investor</Link>
            </div>
          </div>
        )}

        {!loading && !error && totalCount > 0 && (
          <div className="space-y-8">
            {/* Investor application */}
            {investor && (
              <section className="border-t-4 border-black pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <BriefcaseIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-black">Investor Application</h2>
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
              <section className="border-t-4 border-black pt-4">
                <div className="flex items-center gap-2 border-b border-[#dcd8cf] pb-3">
                  <TicketIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-black">Inquiries &amp; Tickets</h2>
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
                        // Signed in under the filing email, the session is the proof of ownership.
                        href={`/tickets/${encodeURIComponent(t.referenceNumber)}`}
                        className="gov-link inline-flex items-center gap-1 text-sm"
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
              <section className="border-t-4 border-black pt-4">
                <div className="flex items-center gap-2 border-b border-[#dcd8cf] pb-3">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-black">Agency Inquiries</h2>
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
              <section className="border-t-4 border-black pt-4">
                <div className="flex items-center gap-2 border-b border-[#dcd8cf] pb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-black">Appointments</h2>
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

            {/* AI assistant conversations */}
            {chatEnquiries.length > 0 && (
              <section className="border-t-4 border-black pt-4">
                <div className="flex items-center gap-2 border-b border-[#dcd8cf] pb-3">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#ce1126]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-black">AI Assistant Conversations</h2>
                  <span className="text-sm text-neutral-600">({chatEnquiries.length})</span>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {chatEnquiries.map((c) => (
                    <li key={c.sessionId} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black truncate">{c.lastMessage}</p>
                        <p className="text-xs text-neutral-600">
                          {c.messageCount} message{c.messageCount !== 1 ? 's' : ''} · {fmtDate(c.lastActivityAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => document.dispatchEvent(new CustomEvent('openChatWidget'))}
                        className="gov-link inline-flex items-center gap-1 text-sm"
                      >
                        Continue in chat <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </button>
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
