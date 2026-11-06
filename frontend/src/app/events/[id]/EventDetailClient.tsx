'use client';

import PageHeader from '@/components/ui/PageHeader';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { CalendarExport } from '@/components/events/CalendarExport';
import type { InvestmentEvent } from '@/types';

interface EventDetailClientProps {
  event: InvestmentEvent;
}

const linkClass = 'gov-link';

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasCapacity = event.capacity > 0;
  const registrationPercentage = hasCapacity ? (event.registered / event.capacity) * 100 : 0;
  const isUpcoming = event.status === 'upcoming' || event.status === 'ongoing';

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Events', href: '/events/' }, { label: event.title }]}
        caption={<>{event.category} · {event.status}</>}
        title={event.title}
        lead={<p>Organised by {event.organizer}</p>}
        actions={isUpcoming ? <a href="https://ugandainvest.go.ug/" className="gov-btn gov-btn--start">Event registration guidance</a> : undefined}
      />

      <div className="gov-container grid grid-cols-1 gap-12 py-12 lg:grid-cols-3 lg:py-16">
        {/* Main content */}
        <div className="space-y-12 lg:col-span-2">
          <section aria-labelledby="event-details-heading">
            <h2 id="event-details-heading" className="gov-title-l border-b-2 border-black pb-3">Event details</h2>

            <dl className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <CalendarIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ce1126]" aria-hidden="true" />
                <div>
                  <dt className="font-bold text-black">Date and time</dt>
                  <dd className="mt-1 text-neutral-700">
                    {formatDate(event.date)}
                    {event.endDate && event.endDate !== event.date && <> to {formatDate(event.endDate)}</>}
                  </dd>
                  {event.time && <dd className="mt-1 text-sm text-neutral-600">Starts at {event.time} EAT</dd>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPinIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ce1126]" aria-hidden="true" />
                <div>
                  <dt className="font-bold text-black">Location</dt>
                  <dd className="mt-1 text-neutral-700">{event.location}</dd>
                  {event.isVirtual && event.virtualLink && (
                    <dd className="mt-2">
                      <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2 text-sm`}>
                        <GlobeAltIcon className="h-4 w-4" aria-hidden="true" />
                        Join virtual event
                      </a>
                    </dd>
                  )}
                  {!event.isVirtual && (
                    <dd className="mt-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} inline-flex items-center gap-2 text-sm`}
                      >
                        <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                        View on map
                      </a>
                    </dd>
                  )}
                </div>
              </div>

              {hasCapacity && (
                <div className="flex items-start gap-4">
                  <UserGroupIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ce1126]" aria-hidden="true" />
                  <div className="flex-1">
                    <dt className="font-bold text-black">Registration</dt>
                    <dd className="mt-1 text-neutral-700">{event.registered} of {event.capacity} spots filled</dd>
                    <dd className="mt-3 h-2 w-full bg-neutral-200" aria-hidden="true">
                      <span className="block h-2 bg-black transition-all duration-500" style={{ width: `${Math.min(registrationPercentage, 100)}%` }} />
                    </dd>
                    {event.registrationDeadline && (
                      <dd className="mt-2 text-sm text-neutral-600">Registration deadline: {formatDate(event.registrationDeadline)}</dd>
                    )}
                  </div>
                </div>
              )}
            </dl>

            <div className="mt-10 border-t border-neutral-200 pt-8">
              <h3 className="gov-title-m">About this event</h3>
              <p className="mt-4 whitespace-pre-line leading-7 text-neutral-700">{event.description}</p>
            </div>
          </section>

          {event.speakers && event.speakers.length > 0 && (
            <section aria-labelledby="speakers-heading" className="border-t border-neutral-200 pt-10">
              <h2 id="speakers-heading" className="gov-title-l">Speakers</h2>
              <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                {event.speakers.map((speaker, index) => (
                  <li key={index} className="border-l-4 border-[#ffd700] pl-4">
                    <h3 className="font-bold">{speaker.name}</h3>
                    <p className="mt-1 text-sm text-neutral-700">{speaker.title}</p>
                    <p className="text-sm text-neutral-600">{speaker.organization}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.status === 'completed' && event.resources && event.resources.length > 0 && (
            <section aria-labelledby="resources-heading" className="border-t border-neutral-200 pt-10">
              <h2 id="resources-heading" className="gov-title-l">Event resources</h2>
              <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {event.resources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url} className="group flex items-center justify-between gap-4 py-4">
                      <span className="flex items-center gap-4">
                        <DocumentArrowDownIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        <span>
                          <span className="block font-bold group-hover:text-red-600">{resource.name}</span>
                          <span className="block text-sm text-neutral-600">
                            {resource.type} {resource.size && `• ${resource.size}`}
                          </span>
                        </span>
                      </span>
                      <ArrowLeftIcon className="h-5 w-5 rotate-180 text-black group-hover:text-red-600" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <section aria-labelledby="calendar-heading">
            <h2 id="calendar-heading" className="border-t-4 border-black pt-4 text-lg font-bold">Add to calendar</h2>
            <div className="mt-4">
              <CalendarExport event={event} />
            </div>
          </section>

          {isUpcoming && (
            <section aria-labelledby="register-heading" className="scroll-mt-6 bg-[#f5f3ee] p-5">
              <h2 id="register-heading" className="text-lg font-bold">Register for this event</h2>

              <p className="mt-3 text-sm leading-6 text-neutral-700">For event registration information, visit the official Uganda Investment Authority website.</p>
              <a href="https://ugandainvest.go.ug/" className="gov-btn mt-6 w-full">Visit UIA</a>
            </section>
          )}

          <section aria-labelledby="help-heading" className="gov-related">
            <h2 id="help-heading">Need help?</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="mailto:events@investuganda.go.ug" className={`${linkClass} inline-flex items-center gap-2`}>
                  <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                  events@investuganda.go.ug
                </a>
              </li>
              <li>
                <a href="tel:+256800100038" className={`${linkClass} inline-flex items-center gap-2`}>
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  +256 800 100 038
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
