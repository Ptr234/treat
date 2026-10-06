'use client';

import React from 'react';
import Link from 'next/link';
import { InvestmentEvent } from '@/types';

interface EventCardProps {
  event: InvestmentEvent;
  index?: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getButtonText = (status: InvestmentEvent['status']) => {
  switch (status) {
    case 'upcoming':
      return 'Register now';
    case 'ongoing':
      return 'Join event';
    default:
      return 'View details';
  }
};

/** Event entry as a detail block: no box, rules and text only. */
export function EventCard({ event }: EventCardProps) {
  const hasCapacity = event.capacity > 0;
  const registrationPercentage = hasCapacity ? (event.registered / event.capacity) * 100 : 0;

  return (
    <article className="flex h-full flex-col border-t border-neutral-200 pt-5">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider">
        <span className="text-red-600">{event.category}</span>
        <span className="text-neutral-600">{event.status}</span>
        {event.isVirtual && <span className="text-neutral-600">Virtual</span>}
      </p>

      <h3 className="mt-3 text-lg font-bold leading-snug">
        <Link
          href={`/events/${event.id}/`}
          className="text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
        >
          {event.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-700">{event.description}</p>

      <dl className="mt-4 space-y-1.5 bg-neutral-50 py-3 pl-4 pr-3 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 flex-shrink-0 font-bold text-black">Date</dt>
          <dd className="text-neutral-700">
            {formatDate(event.date)}
            {event.endDate && event.endDate !== event.date && ` – ${formatDate(event.endDate)}`}
            {event.time && ` · ${event.time}`}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 flex-shrink-0 font-bold text-black">Where</dt>
          <dd className="text-neutral-700">{event.location}</dd>
        </div>
        {hasCapacity && (
          <div className="flex gap-2">
            <dt className="w-16 flex-shrink-0 font-bold text-black">Seats</dt>
            <dd className="text-neutral-700">
              {event.registered} / {event.capacity} registered
              {registrationPercentage >= 90 ? ' · nearly full' : ` · ${Math.round(registrationPercentage)}%`}
            </dd>
          </div>
        )}
      </dl>

      {hasCapacity && (
        <div className="mt-3 h-1.5 w-full bg-neutral-200" aria-hidden="true">
          <div className="h-1.5 bg-yellow-400 transition-all duration-500" style={{ width: `${Math.min(registrationPercentage, 100)}%` }} />
        </div>
      )}

      <div className="mt-auto pt-5">
        <Link
          href={`/events/${event.id}/`}
          className="inline-flex items-center gap-2 text-sm font-bold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
        >
          {getButtonText(event.status)}
        </Link>
      </div>
    </article>
  );
}
