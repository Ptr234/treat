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
      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-black">
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

    let overdueText = 'SLA breached: ';
    if (overdueDays > 0) {
      overdueText += `${overdueDays}d ${overdueHours}h overdue`;
    } else {
      overdueText += `${overdueHours}h ${Math.abs(diffMinutes)}m overdue`;
    }

    return (
      <div className="inline-flex items-center gap-1.5 bg-[#ce1126] px-2.5 py-1 text-sm font-bold text-white">
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
    colorClass = 'text-[#3b3934]';
  } else if (diffHours > 4) {
    timeText = `${diffHours}h ${diffMinutes}m remaining`;
    colorClass = 'text-[#3b3934]';
  } else if (diffHours > 1) {
    timeText = `${diffHours}h ${diffMinutes}m remaining`;
    colorClass = 'text-[#3b3934]';
  } else {
    timeText = `${totalHours > 0 ? totalHours + 'h' : diffMinutes + 'm'} remaining`;
    colorClass = 'border-l-4 border-[#ce1126] pl-2 font-bold text-[#9a0d1c]';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${colorClass}`}>
      <ClockIcon className="w-4 h-4" />
      <span>{timeText}</span>
    </div>
  );
}
