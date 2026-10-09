'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { TicketStatus, TicketPriority } from '@/types';
import { useTickets, type TicketSort } from '@/hooks/useTickets';
import TicketCard from '@/components/tickets/TicketCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';

export default function TicketsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // Back-office staff (system admin, Director General, agency officers) may use
  // the tracking board; agency officers see only their agency's tickets (scoped
  // server-side). Regular users get the restricted "submit a ticket" view.
  const isStaff = isAuthenticated && ['admin', 'dg', 'agency_officer'].includes(user?.role ?? '');
  // Only staff may list tickets; fetching as anyone else is a guaranteed 403.
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<TicketSort>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Search runs on the server; wait for a pause in typing before querying.
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Any change of filter starts again from the first page.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter, sortBy]);

  // Only staff may list tickets; fetching as anyone else is a guaranteed 403.
  const { data: tickets, loading, error, total, stats, refresh } = useTickets(
    { page, pageSize, status: statusFilter, priority: priorityFilter, search: searchQuery, sort: sortBy },
    isStaff && !authLoading,
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const statusTabs: Array<TicketStatus | 'ALL'> = ['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_EXTERNAL', 'RESOLVED', 'CLOSED'];

  // While the session check is still in flight we can't yet tell staff from
  // regular users. Show a neutral loading state instead of briefly flashing
  // (or getting stuck on) the restricted "submit a ticket" view — which is
  // what an authenticated admin was wrongly seeing on a fresh page load.
  if (authLoading) {
    return (
      <div className="gov-container py-24">
        <p role="status" className="flex items-center gap-3 text-[#3b3934]">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
          Loading the issue tracking system…
        </p>
      </div>
    );
  }

  // Non-staff users see a restricted view directing them to create a ticket
  if (!isStaff) {
    return (
      <div className="bg-white">
        <PageHeader
          crumbs={[{ label: 'Support tickets' }]}
          caption="Help and contact"
          title="Support tickets"
          lead="The ticket management board is restricted to authorised OneStop Centre staff. If you need help, submit a support ticket and you will get a reference number to track it."
          actions={
            <>
              <Link href="/tickets/create/" className="gov-btn gov-btn--start">Submit a support ticket</Link>
              <Link href="/track" className="gov-link">Track an existing ticket</Link>
            </>
          }
        />
        <div className="gov-container py-12">
          <p className="gov-inset gov-inset--black max-w-2xl text-[15px]">
            <ShieldCheckIcon className="mb-2 h-6 w-6" aria-hidden="true" />
            Staff member? <Link href="/login" className="gov-link">Sign in to the staff console</Link> to manage tickets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <PageHeader
        tone="dark"
        crumbs={[{ label: 'Support tickets' }]}
        caption="Staff"
        title="Issue tracking"
        lead="Full lifecycle tracking for investment queries, complaints and support requests."
        actions={<Link href="/tickets/create/" className="gov-btn gov-btn--gold"><PlusIcon className="h-5 w-5" aria-hidden="true" />Create new ticket</Link>}
      >
        <FactRow
          inverse
          facts={[
            { label: 'Total tickets', value: stats?.total ?? '—' },
            { label: 'Open', value: stats?.open ?? '—', note: stats && stats.slaBreached > 0 ? `${stats.slaBreached} overdue` : undefined },
            { label: 'Resolved', value: stats?.resolved ?? '—' },
            { label: 'Average resolution', value: stats?.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—' },
          ]}
        />
      </PageHeader>

      <section className="gov-container py-10" aria-label="Tickets">
        {/* Search, filters and sort */}
        <div className="grid gap-4 bg-[#f5f3ee] p-5 md:grid-cols-[minmax(0,1fr)_12rem_12rem] md:items-end">
          <div>
            <label htmlFor="ticket-search" className="gov-label">Search tickets</label>
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5c5850]" aria-hidden="true" />
              <input
                id="ticket-search"
                type="search"
                placeholder="Reference, title, investor name or email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="gov-input !pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ticket-priority" className="gov-label">Priority</label>
            <select id="ticket-priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')} className="gov-input">
              <option value="ALL">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label htmlFor="ticket-sort" className="gov-label">Sort by</label>
            <select id="ticket-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as TicketSort)} className="gov-input">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority</option>
              <option value="sla">SLA deadline</option>
            </select>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-6 overflow-x-auto border-b-2 border-black">
          <div role="group" aria-label="Status" className="flex min-w-max">
            {statusTabs.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={`whitespace-nowrap border-b-4 px-4 py-3 text-sm font-bold capitalize transition-colors ${
                  statusFilter === status ? 'border-[#ffd700] bg-black text-white' : 'border-transparent text-[#3b3934] hover:bg-[#f5f3ee] hover:text-black'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace(/_/g, ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {error ? (
            <div role="alert" className="gov-inset gov-inset--red">
              <p className="font-bold">Tickets could not be loaded.</p>
              <p className="mt-1 text-[15px] text-[#3b3934]">{error}</p>
              <button type="button" onClick={refresh} className="gov-btn gov-btn--secondary gov-btn--sm mt-3">Try again</button>
            </div>
          ) : loading && tickets.length === 0 ? (
            <p className="py-16 text-center text-[#3b3934]" role="status">Loading tickets…</p>
          ) : tickets.length > 0 ? (
            <>
              <p className="mb-4 text-[15px] font-semibold text-[#3b3934]" aria-live="polite">
                {total} {total === 1 ? 'ticket' : 'tickets'}
                {pageCount > 1 ? ` · page ${page} of ${pageCount}` : ''}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
              {pageCount > 1 && (
                <nav aria-label="Ticket pages" className="mt-10 flex items-center justify-between border-t border-[#dcd8cf] pt-6">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="gov-link disabled:opacity-40">
                    ← Previous
                  </button>
                  <span className="text-[15px] text-[#3b3934]">Page {page} of {pageCount}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount || loading} className="gov-link disabled:opacity-40">
                    Next →
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="gov-inset py-8">
              <h2 className="text-lg font-bold">No tickets found</h2>
              <p className="mt-1 text-[15px] text-[#3b3934]">Try a different search, status or priority.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
