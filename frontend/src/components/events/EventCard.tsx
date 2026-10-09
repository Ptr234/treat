'use client';

import React from 'react';
import Link from 'next/link';
import { InvestmentEvent } from '@/types';

interface EventCardProps {
  event: InvestmentEvent;
  index?: number;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_TAG: Record<InvestmentEvent['status'], string> = {
  upcoming: 'gov-tag--gold',
  ongoing: 'gov-tag--red',
  completed: 'gov-tag--grey',
  cancelled: 'gov-tag--grey',
};

/** Calendar entry: a tear-off date tile beside the event record. */
export function EventCard({ event }: EventCardProps) {
  const start = new Date(event.date);
  const valid = !Number.isNaN(start.getTime());
  const hasCapacity = event.capacity > 0;
  const registrationPercentage = hasCapacity ? (event.registered / event.capacity) * 100 : 0;

  return (
    <article className="relative flex gap-5 border-b border-[#dcd8cf] py-6">
      <div className="w-[4.5rem] shrink-0 border-2 border-black bg-white text-center" aria-hidden="true">
        <div className="bg-[#ce1126] py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          {valid ? start.toLocaleDateString('en-GB', { month: 'short' }) : '—'}
        </div>
        <div className="font-display text-[2rem] font-semibold leading-[1.15] text-black">{valid ? start.getDate() : '?'}</div>
        <div className="border-t border-[#dcd8cf] py-0.5 text-[11px] font-semibold text-[#5c5850]">{valid ? start.getFullYear() : ''}</div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className={`gov-tag ${STATUS_TAG[event.status] ?? 'gov-tag--grey'}`}>{event.status}</span>
          <span className="gov-tag gov-tag--outline">{event.category}</span>
          {event.isVirtual && <span className="gov-tag gov-tag--outline">Online</span>}
        </p>

        <h3 className="mt-3 text-lg font-bold leading-snug">
          <Link href={`/events/${event.id}/`} className="text-black underline decoration-1 underline-offset-4 hover:text-[#9a0d1c] hover:decoration-[3px]">
            {event.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-[#3b3934]">{event.description}</p>

        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-bold text-black">When</dt>
          <dd className="text-[#3b3934]">
            {formatDate(event.date)}
            {event.endDate && event.endDate !== event.date && ` to ${formatDate(event.endDate)}`}
            {event.time && `, ${event.time}`}
          </dd>
          <dt className="font-bold text-black">Where</dt>
          <dd className="text-[#3b3934]">{event.location}</dd>
          {hasCapacity && (
            <>
              <dt className="font-bold text-black">Places</dt>
              <dd className="text-[#3b3934]">
                {event.registered} of {event.capacity} taken{registrationPercentage >= 90 ? ' — nearly full' : ''}
              </dd>
            </>
          )}
        </dl>
      </div>
    </article>
  );
}
