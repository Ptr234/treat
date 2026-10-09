'use client';

import PageBand from '@/components/ui/PageBand';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { CalendarExport } from '@/components/events/CalendarExport';
import type { InvestmentEvent } from '@/types';

interface EventDetailClientProps {
  event: InvestmentEvent;
}

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const inputClass =
  'w-full rounded-md border border-neutral-400 bg-white px-3 py-2.5 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1';

const labelClass = 'mb-1.5 block text-sm font-bold text-black';

/** "2026-11-12" or "2026-11-12T07:00:00Z" → "2026-11-12" (the backend parses a DateOnly). */
function toIsoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { apiFetch } = await import('@/lib/api-client');
      const res = await apiFetch('/api/contact/appointments', {
        method: 'POST',
        body: JSON.stringify({
          agencyCode: 'UIA',
          agencyName: 'Uganda Investment Authority',
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.organization.trim() || null,
          serviceType: 'Event Registration',
          purpose: `Event registration: ${event.title}\nOrganization: ${formData.organization}\nDate: ${formatDate(event.date)}`,
          duration: 60,
          meetingType: event.isVirtual ? 'virtual' : 'in-person',
          preferredDate: toIsoDate(event.date),
          // Sanity doesn't track start times; mock events do ("09:00").
          preferredTime: /^\d{2}:\d{2}$/.test(event.time) ? event.time : '09:00',
        }),
      });

      if (!res.success) throw new Error(res.error || 'Registration failed');

      setRegistrationStatus('success');
      setFormData({ name: '', email: '', phone: '', organization: '' });
      setTimeout(() => setRegistrationStatus('idle'), 5000);
    } catch {
      setRegistrationStatus('error');
      setTimeout(() => setRegistrationStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasCapacity = event.capacity > 0;
  const registrationPercentage = hasCapacity ? (event.registered / event.capacity) * 100 : 0;
  const isUpcoming = event.status === 'upcoming' || event.status === 'ongoing';

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li>
              <Link href="/events/" className="text-red-600 hover:underline underline-offset-4">Events</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">{event.title}</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <PageBand>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider">
          <span className="text-red-600">{event.category}</span>
          <span className="text-neutral-600">{event.status}</span>
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{event.title}</h1>
        <p className="mt-4 text-base text-neutral-700 sm:text-lg">Organized by {event.organizer}</p>
        <Link href="/events/" className={`${linkClass} mt-6 inline-flex items-center gap-2 text-sm`}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to events
        </Link>
      </section>
      </PageBand>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Main content */}
        <div className="space-y-12 lg:col-span-2">
          <section aria-labelledby="event-details-heading">
            <h2 id="event-details-heading" className="border-b border-neutral-200 pb-3 text-2xl font-bold">Event details</h2>

            <dl className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <CalendarIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" aria-hidden="true" />
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
                <MapPinIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" aria-hidden="true" />
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
                  <UserGroupIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" aria-hidden="true" />
                  <div className="flex-1">
                    <dt className="font-bold text-black">Registration</dt>
                    <dd className="mt-1 text-neutral-700">{event.registered} of {event.capacity} spots filled</dd>
                    <dd className="mt-3 h-2 w-full bg-neutral-200" aria-hidden="true">
                      <span className="block h-2 bg-yellow-400 transition-all duration-500" style={{ width: `${Math.min(registrationPercentage, 100)}%` }} />
                    </dd>
                    {event.registrationDeadline && (
                      <dd className="mt-2 text-sm text-neutral-600">Registration deadline: {formatDate(event.registrationDeadline)}</dd>
                    )}
                  </div>
                </div>
              )}
            </dl>

            <div className="mt-10 border-t border-neutral-200 pt-8">
              <h3 className="text-xl font-bold">About this event</h3>
              <p className="mt-4 whitespace-pre-line leading-7 text-neutral-700">{event.description}</p>
            </div>
          </section>

          {event.speakers && event.speakers.length > 0 && (
            <section aria-labelledby="speakers-heading" className="border-t border-neutral-200 pt-10">
              <h2 id="speakers-heading" className="text-2xl font-bold">Speakers</h2>
              <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                {event.speakers.map((speaker, index) => (
                  <li key={index} className=" pl-4">
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
              <h2 id="resources-heading" className="text-2xl font-bold">Event resources</h2>
              <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {event.resources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url} className="group flex items-center justify-between gap-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
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
            <h2 id="calendar-heading" className="border-b border-neutral-200 pb-3 text-lg font-bold">Add to calendar</h2>
            <div className="mt-4">
              <CalendarExport event={event} />
            </div>
          </section>

          {isUpcoming && (
            <section aria-labelledby="register-heading" className=" pt-6">
              <h2 id="register-heading" className="text-lg font-bold">Register for this event</h2>

              {registrationStatus === 'success' && (
                <div role="status" className="mt-4 flex items-start gap-3 border-l border-neutral-200 bg-neutral-50 p-4">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-black" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold">Registration successful</p>
                    <p className="mt-1 text-xs text-neutral-700">You will receive a confirmation email shortly.</p>
                  </div>
                </div>
              )}

              {registrationStatus === 'error' && (
                <div role="alert" className="mt-4 flex items-start gap-3 border-l-4 border-red-600 bg-neutral-50 p-4">
                  <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Registration failed</p>
                    <p className="mt-1 text-xs text-neutral-700">Please try again or contact support.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegistration} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className={labelClass}>Full name <span className="text-red-600">*</span></label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email address <span className="text-red-600">*</span></label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone number <span className="text-red-600">*</span></label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="organization" className={labelClass}>Organization <span className="text-red-600">*</span></label>
                  <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleInputChange} required className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-black px-4 py-3 text-sm font-bold text-yellow-400 transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering…' : 'Register now'}
                </button>
              </form>
            </section>
          )}

          <section aria-labelledby="help-heading" className="border-t border-neutral-200 pt-6">
            <h2 id="help-heading" className="text-lg font-bold">Need help?</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="mailto:events@investuganda.go.ug" className={`${linkClass} inline-flex items-center gap-2`}>
                  <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                  events@investuganda.go.ug
                </a>
              </li>
              <li>
                <a href="tel:+256414301000" className={`${linkClass} inline-flex items-center gap-2`}>
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  +256 414 301 000
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
