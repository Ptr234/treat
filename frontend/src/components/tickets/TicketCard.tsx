'use client';

import React from 'react';
import Link from 'next/link';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { SupportTicket, TicketStatus, TicketPriority } from '@/types';
import SLAIndicator from './SLAIndicator';

interface TicketCardProps {
  ticket: SupportTicket;
}

const statusColors: Record<TicketStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800 border-blue-200',
  ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
  IN_PROGRESS: 'bg-yellow-100 text-neutral-800 border-yellow-200',
  PENDING_EXTERNAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RESOLVED: 'bg-yellow-200 text-neutral-900 border-yellow-300',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

const categoryLabels: Record<string, string> = {
  general_inquiry: 'General Inquiry',
  procedure_query: 'Procedure Query',
  application_support: 'Application Support',
  license_delay: 'License Delay',
  complaint: 'Complaint',
  vip: 'VIP Investor'
};

export default function TicketCard({ ticket }: TicketCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ticketNumber = ticket.id;

  return (
    <Link
      href={`/tickets/${ticket.id}/`}
      className="group block border-t-2 border-black py-6 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-data text-sm font-semibold text-black">{ticketNumber}</span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusColors[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[ticket.priority]}`}>
          {ticket.priority.toUpperCase()}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-snug text-black group-hover:text-red-600">
        {ticket.title}
      </h3>
      <p className="mt-1 text-sm text-neutral-700">{categoryLabels[ticket.category]}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" aria-hidden="true" />
          <span>Created {formatDate(ticket.createdAt)}</span>
        </div>
        {ticket.assignee && (
          <div className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            <span className="max-w-[150px] truncate">{ticket.assignee}</span>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-3">
        <SLAIndicator deadline={ticket.slaDeadline} status={ticket.status} />
      </div>
    </Link>
  );
}
