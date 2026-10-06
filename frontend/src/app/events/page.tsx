'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { EventCard } from '@/components/events/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { EventCategory, EventStatus } from '@/types';

export default function EventsPage() {
  const { data: events, loading } = useEvents();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Calculate stats. These are derived purely from event dates/counts so they
  // stay meaningful regardless of which optional fields the CMS populates.
  const stats = useMemo(() => {
    const upcomingCount = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length;
    const pastCount = events.filter(e => e.status === 'completed' || e.status === 'cancelled').length;
    return {
      upcomingCount,
      totalCount: events.length,
      pastCount,
    };
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Category filter
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && event.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  // Split into upcoming and past
  const upcomingEvents = filteredEvents.filter(
    e => e.status === 'upcoming' || e.status === 'ongoing'
  );
  const pastEvents = filteredEvents.filter(
    e => e.status === 'completed' || e.status === 'cancelled'
  );

  const categories: Array<{ value: EventCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All events' },
    { value: 'forum', label: 'Forums' },
    { value: 'mission', label: 'Missions' },
    { value: 'symposium', label: 'Symposiums' },
    { value: 'summit', label: 'Summits' },
    { value: 'webinar', label: 'Webinars' }
  ];

  const statuses: Array<{ value: EventStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Past events' }
  ];

  const filterButtonClass = (active: boolean) =>
    `whitespace-nowrap border-b-2 px-1 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
      active ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-700 hover:text-red-600'
    }`;

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
            <li className="font-semibold text-black" aria-current="page">Events</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Events and investment activities</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Use the events calendar to find investment forums, missions, webinars and other activities involving Uganda’s business community. Search by title, location or organizer, then narrow the list by event category and status. Event listings include dates and participation details when those have been provided by the organizer. Check the event page for updates before making travel plans or sharing registration information.
        </p>
        <dl className="mt-10 grid grid-cols-1 gap-6 border-y border-neutral-200 py-6 sm:grid-cols-3">
          <div className="border-l-4 border-yellow-400 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Upcoming events</dt>
            <dd className="font-data mt-1 text-3xl font-bold">{stats.upcomingCount}</dd>
          </div>
          <div className="border-l-4 border-yellow-400 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Total events</dt>
            <dd className="font-data mt-1 text-3xl font-bold">{stats.totalCount}</dd>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Past events</dt>
            <dd className="font-data mt-1 text-3xl font-bold">{stats.pastCount}</dd>
          </div>
        </dl>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-40 mt-10 border-y border-neutral-200 bg-white" aria-label="Filter events">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative">
            <label htmlFor="event-search" className="sr-only">Search events</label>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              id="event-search"
              type="text"
              placeholder="Search events by title, location, or organizer…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-neutral-400 bg-white py-2.5 pl-10 pr-4 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
            />
          </div>

          <div role="group" aria-label="Category" className="mt-4 flex gap-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.value}
                type="button"
                aria-pressed={selectedCategory === category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={filterButtonClass(selectedCategory === category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div role="group" aria-label="Status" className="mt-1 flex gap-4 overflow-x-auto">
            {statuses.map(status => (
              <button
                key={status.value}
                type="button"
                aria-pressed={selectedStatus === status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={filterButtonClass(selectedStatus === status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="mb-8 border-b-2 border-black pb-3 text-2xl font-bold">Upcoming events</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-black" role="status" aria-label="Loading events" />
            <p className="font-medium text-neutral-700">Loading events…</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <div className="border-l-4 border-red-600 bg-neutral-50 p-6">
            <h3 className="text-lg font-bold">No upcoming events found</h3>
            <p className="mt-2 text-sm text-neutral-700">Try adjusting your filters or check back soon for new events.</p>
          </div>
        )}
      </section>

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section className="mx-auto max-w-6xl border-t border-neutral-200 px-4 py-14 sm:px-6 lg:px-8" aria-label="Past events">
          <button
            type="button"
            onClick={() => setShowPastEvents(!showPastEvents)}
            aria-expanded={showPastEvents}
            className="flex items-center gap-2 text-2xl font-bold transition-colors hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Past events ({pastEvents.length})
            <ChevronDownIcon className={`h-6 w-6 transition-transform duration-300 ${showPastEvents ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {showPastEvents && (
            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
