'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { TicketStatus, TicketHistoryEntry } from '@/types';

interface StatusTimelineProps {
  currentStatus: TicketStatus;
  history: TicketHistoryEntry[];
}

const statusFlow: TicketStatus[] = [
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_EXTERNAL',
  'RESOLVED',
  'CLOSED'
];

const statusLabels: Record<TicketStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_EXTERNAL: 'Pending External',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export default function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const currentIndex = statusFlow.indexOf(currentStatus);

  const getStatusDate = (status: TicketStatus): string | null => {
    const entry = history.find(h => h.status === status);
    if (entry) {
      const date = new Date(entry.timestamp);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
    return null;
  };

  const isStatusComplete = (index: number): boolean => {
    return index <= currentIndex;
  };

  return (
    <div className="w-full py-8">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const isComplete = isStatusComplete(index);
            const isCurrent = index === currentIndex;
            const statusDate = getStatusDate(status);

            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center relative">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isComplete
                        ? 'bg-yellow-600 border-yellow-600'
                        : 'bg-white border-gray-300'
                    } ${isCurrent ? 'ring-4 ring-yellow-100' : ''}`}
                  >
                    {isComplete ? (
                      <CheckIcon className="w-6 h-6 text-white" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                      {statusLabels[status]}
                    </p>
                    {statusDate && (
                      <p className="text-xs text-gray-500 mt-1">{statusDate}</p>
                    )}
                  </div>
                </div>

                {/* Connecting Line */}
                {index < statusFlow.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-8">
                    <div
                      className={`h-full ${
                        isComplete ? 'bg-yellow-600' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden">
        <div className="space-y-4">
          {statusFlow.map((status, index) => {
            const isComplete = isStatusComplete(index);
            const isCurrent = index === currentIndex;
            const statusDate = getStatusDate(status);

            return (
              <div key={status} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  {/* Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isComplete
                        ? 'bg-yellow-600 border-yellow-600'
                        : 'bg-white border-gray-300'
                    } ${isCurrent ? 'ring-4 ring-yellow-100' : ''}`}
                  >
                    {isComplete ? (
                      <CheckIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {index < statusFlow.length - 1 && (
                    <div className="w-0.5 h-12 my-1">
                      <div
                        className={`h-full ${
                          isComplete ? 'bg-yellow-600' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="pt-1">
                  <p className={`text-sm font-medium ${isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                    {statusLabels[status]}
                  </p>
                  {statusDate && (
                    <p className="text-xs text-gray-500 mt-0.5">{statusDate}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
