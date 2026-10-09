'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { TicketStatus, TicketPriority } from '@/types';
import { useTickets, type TicketSort } from '@/hooks/useTickets';
import TicketCard from '@/components/tickets/TicketCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PageBand from '@/components/ui/PageBand';

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
 <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-3 text-neutral-600">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading Issue Tracking System…</p>
        </div>
      </div>
    );
  }

  // Non-staff users see a restricted view directing them to create a ticket
  if (!isStaff) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center pt-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <ShieldCheckIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-3">Issue Tracking System</h1>
          <p className="text-neutral-700 mb-6">
            The ticket management dashboard is restricted to authorized administrators and executive staff. If you need support, you can submit a new ticket below.
          </p>
          <Link href="/tickets/create/">
            <button className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-md flex items-center justify-center gap-2 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Submit a Support Ticket
            </button>
          </Link>
          <p className="text-sm text-neutral-600 mt-4">
            Admin or CEO? <Link href="/dashboard" className="text-red-600 hover:text-yellow-800 font-medium">Sign in</Link> to access the full dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <PageBand>
        <div className="container mx-auto px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Issue Tracking System
            </h1>
            <p className="text-lg">
              Full lifecycle tracking for investment queries, complaints, and support requests
            </p>
          </motion.div>
        </div>
      </PageBand>

      {/* Stats Bar */}
      <section className="bg-white border-b border-neutral-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-black">{stats?.total ?? '—'}</p>
              <p className="text-sm text-neutral-700 mt-1">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats?.open ?? '—'}</p>
              <p className="text-sm text-neutral-700 mt-1">
                Open{stats && stats.slaBreached > 0 ? ` · ${stats.slaBreached} overdue` : ''}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.resolved ?? '—'}</p>
              <p className="text-sm text-neutral-700 mt-1">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats?.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—'}
              </p>
              <p className="text-sm text-neutral-700 mt-1">Avg Resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <label htmlFor="ticket-search" className="sr-only">Search tickets</label>
            <input
              id="ticket-search"
              type="search"
              placeholder="Search by reference, title, or investor name/email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-400 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent"
            />
          </div>
          <Link href="/tickets/create/">
            <button className="w-full md:w-auto px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-md font-medium flex items-center justify-center gap-2 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Create New Ticket
            </button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-neutral-600" />
            <label htmlFor="ticket-priority" className="sr-only">Priority</label>
            <select
              id="ticket-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')}
              className="px-4 py-2 border border-neutral-400 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent"
            >
              <option value="ALL">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <label htmlFor="ticket-sort" className="sr-only">Sort</label>
          <select
            id="ticket-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TicketSort)}
            className="px-4 py-2 border border-neutral-400 rounded-md focus:ring-2 focus-visible:ring-red-600 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="sla">SLA Deadline</option>
          </select>
        </div>

        {/* Ticket Grid */}
        {error ? (
          <div role="alert" className="border-l-4 border-red-600 py-4 pl-4">
            <p className="font-semibold text-red-700">Tickets could not be loaded.</p>
            <p className="mt-1 text-sm text-neutral-700">{error}</p>
            <button
              onClick={refresh}
              className="mt-3 border-2 border-black px-4 py-1.5 text-sm font-bold text-black hover:bg-black hover:text-yellow-400"
            >
              Try again
            </button>
          </div>
        ) : loading && tickets.length === 0 ? (
          <p className="py-16 text-center text-neutral-700" role="status">Loading tickets…</p>
        ) : tickets.length > 0 ? (
          <>
            <p className="mb-2 text-sm text-neutral-700" aria-live="polite">
              {total} {total === 1 ? 'ticket' : 'tickets'}
              {pageCount > 1 ? ` · page ${page} of ${pageCount}` : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav aria-label="Ticket pages" className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="border-2 border-black px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-800">
                  Page {page} of {pageCount}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount || loading}
                  className="border-2 border-black px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No tickets found</h3>
            <p className="text-neutral-700 mb-6">
              Try adjusting your search or filters
            </p>
            <Link href="/tickets/create/">
              <button className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-md font-medium inline-flex items-center gap-2 transition-colors">
                <PlusIcon className="w-5 h-5" />
                Create New Ticket
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
