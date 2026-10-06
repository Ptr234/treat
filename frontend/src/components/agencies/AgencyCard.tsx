'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { AgencyContact } from '@/data/agencies';
import AppointmentModal from './AppointmentModal';

interface AgencyCardProps {
  agency: AgencyContact;
  className?: string;
}

const urgencyStyles = {
  high: { color: 'bg-red-600 text-white', text: 'High Priority' },
  medium: { color: 'bg-yellow-400 text-black', text: 'Medium Priority' },
  low: { color: 'bg-neutral-200 text-black', text: 'Standard' }
};

/** Agency entry as a detail block: a rule, type and actions, no box. */
export default function AgencyCard({ agency, className = '' }: AgencyCardProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  const urgency = urgencyStyles[agency.urgencyLevel];

  return (
    <>
      <article className={`flex h-full flex-col border-t-2 border-black pt-5 ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {agency.logo && (
              <Image
                src={agency.logo}
                alt={`${agency.acronym} logo`}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/logos/default-agency.png';
                }}
              />
            )}
            <div>
              <h3 className="font-display text-2xl font-semibold text-black">{agency.acronym}</h3>
              <p className="text-sm text-neutral-600">
                {agency.category.charAt(0).toUpperCase() + agency.category.slice(1)}
              </p>
            </div>
          </div>
          <span className={`${urgency.color} rounded-full px-2.5 py-1 text-xs font-bold`}>
            {urgency.text}
          </span>
        </div>

        <h4 className="mt-5 text-lg font-bold leading-snug text-black">{agency.name}</h4>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-700">{agency.description}</p>

        <div className="mt-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-red-600">Key services</h5>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
            {agency.services.slice(0, 3).map((service) => (
              <li key={service}>{service}</li>
            ))}
            {agency.services.length > 3 && (
              <li className="font-semibold text-red-600">+{agency.services.length - 3} more</li>
            )}
          </ul>
        </div>

        <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            <dd>{agency.operatingHours}</dd>
          </div>
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            <dd className="truncate">{agency.contact.address}</dd>
          </div>
        </dl>

        <div className="mt-auto grid gap-2 pt-5">
          <button
            type="button"
            onClick={openAssistant}
            className="flex min-h-11 items-center justify-center gap-2 bg-yellow-400 px-4 py-2.5 font-bold text-black hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
            <span>Ask about {agency.acronym}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/agencies/${agency.id}`}
              className="flex min-h-11 items-center justify-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <BuildingOfficeIcon className="h-4 w-4" aria-hidden="true" />
              <span>View services</span>
            </Link>

            {agency.hasAppointmentBooking && (
              <button
                type="button"
                onClick={() => setShowAppointmentModal(true)}
                className="flex min-h-11 items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                <span>Book appointment</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {agency.hasAppointmentBooking && (
        <AppointmentModal
          agency={agency}
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
        />
      )}
    </>
  );
}
