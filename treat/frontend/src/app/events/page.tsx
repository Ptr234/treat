'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { EventCard } from '@/components/events/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { EventCategory, EventStatus } from '@/types';

export default function EventsPage() {
  const { data: events } = useEvents();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
    const totalRegistrations = events.reduce((sum, e) => sum + e.registered, 0);
    const uniqueCountries = new Set(
      events.flatMap(e => e.speakers.map(s => s.organization))
    ).size;

    return {
      upcomingCount: upcomingEvents.length,
      totalRegistrations,
      countriesRepresented: uniqueCountries
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
    { value: 'all', label: 'All Events' },
    { value: 'forum', label: 'Forums' },
    { value: 'mission', label: 'Missions' },
    { value: 'symposium', label: 'Symposiums' },
    { value: 'summit', label: 'Summits' },
    { value: 'webinar', label: 'Webinars' }
  ];

  const statuses: Array<{ value: EventStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Past Events' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #22c55e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #166534 0%, transparent 50%)'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Events & Investment Activities
            </h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto mb-8">
              Connect with investors, industry leaders, and government officials at Uganda&apos;s premier investment events. Network, learn, and discover opportunities across all sectors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <CalendarIcon className="w-8 h-8 text-yellow-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.upcomingCount}
                </div>
                <div className="text-sm text-neutral-600">Upcoming Events</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <UserGroupIcon className="w-8 h-8 text-yellow-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.totalRegistrations.toLocaleString()}+
                </div>
                <div className="text-sm text-neutral-600">Total Registrations</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MapPinIcon className="w-8 h-8 text-yellow-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.countriesRepresented}+
                </div>
                <div className="text-sm text-neutral-600">Organizations Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search events by title, location, or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:border-yellow-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedStatus === status.value
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Upcoming Events
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
              <CalendarIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No upcoming events found
              </h3>
              <p className="text-neutral-600">
                Try adjusting your filters or check back soon for new events.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="flex items-center gap-2 text-2xl font-bold text-neutral-900 mb-8 hover:text-yellow-700 transition-colors"
            >
              Past Events ({pastEvents.length})
              <ChevronDownIcon
                className={`w-6 h-6 transition-transform duration-300 ${
                  showPastEvents ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showPastEvents && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {pastEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
