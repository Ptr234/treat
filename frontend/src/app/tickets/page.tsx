'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { TicketStatus, TicketPriority } from '@/types';
import { useTickets } from '@/hooks/useTickets';
import TicketCard from '@/components/tickets/TicketCard';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function TicketsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // Back-office staff (system admin, Director General, agency officers) may use
  // the tracking board; agency officers see only their agency's tickets (scoped
  // server-side). Regular users get the restricted "submit a ticket" view.
  const isStaff = isAuthenticated && ['admin', 'dg', 'agency_officer'].includes(user?.role ?? '');
  // Only staff may list tickets; fetching as anyone else is a guaranteed 403.
  const { data: tickets } = useTickets(isStaff && !authLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'sla'>('newest');

  const statusTabs: Array<TicketStatus | 'ALL'> = ['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_EXTERNAL', 'RESOLVED', 'CLOSED'];

  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter(ticket => {
      const matchesSearch =
        searchQuery === '' ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder: Record<TicketPriority, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'sla':
          return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Calculate stats. "Resolved" counts both RESOLVED and CLOSED so that
  // open + resolved always equals the total (no ticket falls through a gap).
  const stats = useMemo(() => {
    const total = tickets.length;
    const closedStatuses: TicketStatus[] = ['RESOLVED', 'CLOSED'];
    const open = tickets.filter(t => !closedStatuses.includes(t.status)).length;
    const resolved = tickets.filter(t => closedStatuses.includes(t.status)).length;

    // Average resolution time (hours) over tickets that carry a resolution time.
    const resolutionTimes = tickets
      .map(t => t.resolutionTime?.match(/(\d+\.?\d*)\s*hours?/)?.[1])
      .filter((v): v is string => v !== undefined)
      .map(parseFloat);

    const avgResolutionTime = resolutionTimes.length > 0
      ? (resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length).toFixed(1)
      : '0';

    return { total, open, resolved, avgResolutionTime };
  }, [tickets]);

  // While the session check is still in flight we can't yet tell staff from
  // regular users. Show a neutral loading state instead of briefly flashing
  // (or getting stuck on) the restricted "submit a ticket" view — which is
  // what an authenticated admin was wrongly seeing on a fresh page load.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading Issue Tracking System…</p>
        </div>
      </div>
    );
  }

  // Non-staff users see a restricted view directing them to create a ticket
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-yellow-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Issue Tracking System</h1>
          <p className="text-gray-600 mb-6">
            The ticket management dashboard is restricted to authorized administrators and executive staff. If you need support, you can submit a new ticket below.
          </p>
          <Link href="/tickets/create/">
            <button className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Submit a Support Ticket
            </button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Admin or CEO? <Link href="/dashboard" className="text-yellow-700 hover:text-yellow-800 font-medium">Sign in</Link> to access the full dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-700 via-yellow-600 to-yellow-500 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Issue Tracking System
            </h1>
            <p className="text-lg text-yellow-50">
              Full lifecycle tracking for investment queries, complaints, and support requests
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
              <p className="text-sm text-gray-600 mt-1">Open</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.resolved}</p>
              <p className="text-sm text-gray-600 mt-1">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.avgResolutionTime}h</p>
              <p className="text-sm text-gray-600 mt-1">Avg Resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <Link href="/tickets/create/">
            <button className="w-full md:w-auto px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-yellow-600 text-black'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="ALL">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="sla">SLA Deadline</option>
          </select>
        </div>

        {/* Ticket Grid */}
        {filteredAndSortedTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Link href="/tickets/create/">
              <button className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium inline-flex items-center gap-2 transition-colors">
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
