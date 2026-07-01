'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    <Link href={`/tickets/${ticket.id}/`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="block bg-white rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-lg"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono font-semibold text-gray-900">
                {ticketNumber}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusColors[ticket.status]}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[ticket.priority]}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {ticket.title}
            </h3>
            <p className="text-sm text-gray-600">
              {categoryLabels[ticket.category]}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>Created {formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.assignee && (
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{ticket.assignee}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100">
          <SLAIndicator deadline={ticket.slaDeadline} status={ticket.status} />
        </div>
      </motion.div>
    </Link>
  );
}
