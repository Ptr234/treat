'use client';

import React from 'react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { TicketStatus } from '@/types';

interface SLAIndicatorProps {
  deadline: string;
  status: TicketStatus;
}

export default function SLAIndicator({ deadline, status }: SLAIndicatorProps) {
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
        <CheckCircleIcon className="w-4 h-4" />
        <span>Completed</span>
      </div>
    );
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffMs < 0) {
    // SLA Breached
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let overdueText = 'SLA Breached - ';
    if (overdueDays > 0) {
      overdueText += `${overdueDays}d ${overdueHours}h overdue`;
    } else {
      overdueText += `${overdueHours}h ${Math.abs(diffMinutes)}m overdue`;
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>{overdueText}</span>
      </div>
    );
  }

  // Time remaining
  const totalHours = diffHours + (diffMinutes > 0 ? 1 : 0);
  let timeText = '';
  let colorClass = '';

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    timeText = `${days}d ${hours}h remaining`;
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  } else if (diffHours > 4) {
    timeText = `${diffHours}h ${diffMinutes}m remaining`;
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  } else if (diffHours > 1) {
    timeText = `${diffHours}h ${diffMinutes}m remaining`;
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  } else {
    timeText = `${totalHours > 0 ? totalHours + 'h' : diffMinutes + 'm'} remaining`;
    colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${colorClass}`}>
      <ClockIcon className="w-4 h-4" />
      <span>{timeText}</span>
    </div>
  );
}
