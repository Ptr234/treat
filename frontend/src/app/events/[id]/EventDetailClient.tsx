'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          agency: 'UIA',
          subject: `Event Registration: ${event.title}`,
          message: `Organization: ${formData.organization}\nEvent: ${event.title}\nDate: ${event.date}`,
          date: event.date,
          time: event.time || '09:00',
          duration: 60,
          meetingType: event.isVirtual ? 'virtual' : 'in-person',
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

  const categoryColors: Record<string, string> = {
    forum: 'bg-black text-white',
    mission: 'bg-black text-white',
    symposium: 'bg-yellow-600 text-black',
    summit: 'bg-yellow-500 text-black',
    webinar: 'bg-yellow-400 text-black'
  };

  const statusColors: Record<string, string> = {
    upcoming: 'bg-yellow-100 text-neutral-800 border-yellow-300',
    ongoing: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Banner */}
      <section className="relative h-96 bg-gradient-to-br from-neutral-900 to-yellow-700 overflow-hidden">
        {event.imageUrl && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          </>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <Link
            href="/events/"
            className="inline-flex items-center gap-2 text-white hover:text-yellow-200 transition-colors mb-6 w-fit"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Events
          </Link>

          <div className="flex gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide ${categoryColors[event.category]}`}>
              {event.category}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusColors[event.status]}`}>
              {event.status}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {event.title}
          </h1>

          <p className="text-yellow-200 text-lg">
            Organized by {event.organizer}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md border border-neutral-200 p-8"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Event Details</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CalendarIcon className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Date & Time</h3>
                    <p className="text-neutral-700">
                      {formatDate(event.date)}
                      {event.endDate && event.endDate !== event.date && (
                        <> to {formatDate(event.endDate)}</>
                      )}
                    </p>
                    {event.time && (
                      <p className="text-neutral-600 text-sm mt-1">
                        Starts at {event.time} EAT
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPinIcon className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Location</h3>
                    <p className="text-neutral-700">{event.location}</p>
                    {event.isVirtual && event.virtualLink && (
                      <a
                        href={event.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        <GlobeAltIcon className="w-4 h-4" />
                        Join Virtual Event
                      </a>
                    )}
                    {!event.isVirtual && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        <MapPinIcon className="w-4 h-4" />
                        View on Map
                      </a>
                    )}
                  </div>
                </div>

                {hasCapacity && (
                  <div className="flex items-start gap-4">
                    <UserGroupIcon className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2">Registration</h3>
                      <p className="text-neutral-700 mb-3">
                        {event.registered} of {event.capacity} spots filled
                      </p>
                      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                        />
                      </div>
                      {event.registrationDeadline && (
                        <p className="text-sm text-neutral-600 mt-2">
                          Registration deadline: {formatDate(event.registrationDeadline)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">About This Event</h3>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </motion.div>

            {event.speakers && event.speakers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md border border-neutral-200 p-8"
              >
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Speakers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{speaker.name}</h3>
                        <p className="text-sm text-neutral-700">{speaker.title}</p>
                        <p className="text-sm text-neutral-600">{speaker.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {event.status === 'completed' && event.resources && event.resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md border border-neutral-200 p-8"
              >
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Event Resources</h2>
                <div className="space-y-4">
                  {event.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-yellow-600 hover:bg-yellow-50 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <DocumentArrowDownIcon className="w-6 h-6 text-yellow-700 group-hover:text-neutral-800" />
                        <div>
                          <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-800">
                            {resource.name}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {resource.type} {resource.size && `• ${resource.size}`}
                          </p>
                        </div>
                      </div>
                      <ArrowLeftIcon className="w-5 h-5 text-neutral-400 group-hover:text-yellow-700 rotate-180" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-lg shadow-md border border-neutral-200 p-6"
            >
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Add to Calendar</h3>
              <CalendarExport event={event} />
            </motion.div>

            {isUpcoming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md border border-neutral-200 p-6"
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Register for Event</h3>

                {registrationStatus === 'success' && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Registration Successful!</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        You will receive a confirmation email shortly.
                      </p>
                    </div>
                  </div>
                )}

                {registrationStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Registration Failed</p>
                      <p className="text-xs text-red-700 mt-1">
                        Please try again or contact support.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-neutral-700 mb-1">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors duration-200"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Now'}
                  </button>
                </form>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-lg shadow-md border border-neutral-200 p-6"
            >
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a
                  href="mailto:events@investuganda.go.ug"
                  className="flex items-center gap-3 text-neutral-700 hover:text-yellow-700 transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  <span className="text-sm">events@investuganda.go.ug</span>
                </a>
                <a
                  href="tel:+256414301000"
                  className="flex items-center gap-3 text-neutral-700 hover:text-yellow-700 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span className="text-sm">+256 414 301 000</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
