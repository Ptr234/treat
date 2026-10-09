'use client';

import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';
import React, { useState, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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

  const radioClass = 'h-5 w-5 shrink-0';

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Events' }]}
        caption="News and events"
        title="Events and investment activities"
        lead="Investment forums, missions, summits and webinars involving Uganda’s business community. Check the event page for updates before making travel plans."
      >
        <FactRow
          facts={[
            { label: 'Upcoming', value: stats.upcomingCount },
            { label: 'Past', value: stats.pastCount },
            { label: 'All events', value: stats.totalCount },
          ]}
        />
      </PageHeader>

      <div className="gov-container grid gap-10 py-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        {/* Filters */}
        <aside aria-label="Filter events" className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-[#f5f3ee] p-5">
            <h2 className="text-lg font-bold">Filter events</h2>
            <label htmlFor="event-search" className="gov-label mt-5">Search</label>
            <input
              id="event-search"
              type="search"
              placeholder="Title, place or organiser"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gov-input"
            />

            <fieldset className="mt-6">
              <legend className="gov-label">Type of event</legend>
              <div className="mt-2 space-y-2.5">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center gap-3 text-[15px] font-normal">
                    <input type="radio" name="event-category" className={radioClass} checked={selectedCategory === category.value} onChange={() => setSelectedCategory(category.value)} />
                    {category.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="gov-label">Status</legend>
              <div className="mt-2 space-y-2.5">
                {statuses.map((status) => (
                  <label key={status.value} className="flex items-center gap-3 text-[15px] font-normal">
                    <input type="radio" name="event-status" className={radioClass} checked={selectedStatus === status.value} onChange={() => setSelectedStatus(status.value)} />
                    {status.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSelectedStatus('all'); setSearchQuery(''); }}
                className="gov-btn gov-btn--secondary gov-btn--sm mt-6 w-full"
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div>
          <section aria-labelledby="upcoming-heading">
            <h2 id="upcoming-heading" className="gov-title-l border-b-2 border-black pb-3">
              Upcoming events <span className="font-normal text-[#5c5850]">({upcomingEvents.length})</span>
            </h2>

            {loading ? (
              <p role="status" className="flex items-center gap-3 py-10 text-[#3b3934]">
                <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black" aria-hidden="true" />
                Loading events…
              </p>
            ) : upcomingEvents.length > 0 ? (
              <div>
                {upcomingEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="gov-inset mt-6">
                <h3 className="text-lg font-bold">No upcoming events match your filters</h3>
                <p className="mt-1 text-[15px] text-[#3b3934]">Clear the filters or check back soon for new events.</p>
              </div>
            )}
          </section>

          {pastEvents.length > 0 && (
            <section className="mt-14" aria-labelledby="past-heading">
              <h2 id="past-heading">
                <button
                  type="button"
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  aria-expanded={showPastEvents}
                  className="flex w-full items-center justify-between border-b-2 border-black pb-3 text-left text-[clamp(1.625rem,3vw,2.25rem)] font-bold hover:text-[#9a0d1c]"
                >
                  <span>Past events <span className="font-normal text-[#5c5850]">({pastEvents.length})</span></span>
                  <ChevronDownIcon className={`h-7 w-7 transition-transform ${showPastEvents ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h2>
              {showPastEvents && (
                <div>
                  {pastEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
