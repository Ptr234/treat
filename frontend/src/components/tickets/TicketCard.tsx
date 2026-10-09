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
  NEW: 'gov-tag gov-tag--red',
  ASSIGNED: 'gov-tag gov-tag--outline',
  IN_PROGRESS: 'gov-tag gov-tag--gold',
  PENDING_EXTERNAL: 'gov-tag gov-tag--grey',
  RESOLVED: 'gov-tag',
  CLOSED: 'gov-tag gov-tag--grey'
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'gov-tag gov-tag--grey',
  medium: 'gov-tag gov-tag--outline',
  high: 'gov-tag gov-tag--gold',
  critical: 'gov-tag gov-tag--red'
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
      className="group block h-full border border-[#dcd8cf] border-t-4 border-t-black bg-white p-5 no-underline hover:border-t-[#ce1126]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-data text-sm font-semibold text-black">{ticketNumber}</span>
        <span className={statusColors[ticket.status]}>
          {ticket.status.replace(/_/g, ' ')}
        </span>
        <span className={priorityColors[ticket.priority]}>
          {ticket.priority.toUpperCase()}
        </span>
        {ticket.isEscalated && (
          <span className="gov-tag gov-tag--red">
            ESCALATED
          </span>
        )}
        {ticket.assigneeAgency && (
          <span className="gov-tag gov-tag--outline">
            {ticket.assigneeAgency}
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-black underline decoration-1 underline-offset-4 group-hover:text-[#9a0d1c] group-hover:decoration-[3px]">
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
