'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { InvestmentEvent } from '@/types';

interface EventCardProps {
  event: InvestmentEvent;
  index?: number;
}

const categoryColors = {
  forum: 'bg-black text-white',
  mission: 'bg-black text-white',
  symposium: 'bg-neutral-700 text-white',
  summit: 'bg-yellow-500 text-black',
  webinar: 'bg-yellow-400 text-black'
};

const statusColors = {
  upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ongoing: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300'
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const registrationPercentage = (event.registered / event.capacity) * 100;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getButtonText = () => {
    switch (event.status) {
      case 'upcoming':
        return 'Register Now';
      case 'ongoing':
        return 'Join Event';
      default:
        return 'View Details';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link href={`/events/${event.id}/`} className="block">
        <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
          {/* Event Image or Gradient Placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-black to-neutral-700 overflow-hidden">
            {event.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.imageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-yellow-400 text-6xl font-bold opacity-20">
                  {event.title.charAt(0)}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[event.category]}`}>
                {event.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col">
            {/* Title */}
            <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2 min-h-[3.5rem]">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-1">
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              {/* Date/Time */}
              <div className="flex items-center text-sm text-neutral-700">
                <CalendarIcon className="w-5 h-5 mr-2 text-yellow-600" />
                <span>
                  {formatDate(event.date)}
                  {event.endDate && event.endDate !== event.date && ` - ${formatDate(event.endDate)}`}
                  {' • '}{event.time}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-neutral-700">
                <MapPinIcon className="w-5 h-5 mr-2 text-red-500" />
                <span className="flex items-center gap-2">
                  {event.location}
                  {event.isVirtual && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Virtual
                    </span>
                  )}
                </span>
              </div>

              {/* Registration Progress */}
              <div className="flex items-center text-sm text-neutral-700">
                <UserGroupIcon className="w-5 h-5 mr-2 text-neutral-600" />
                <span>{event.registered} / {event.capacity} registered</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {registrationPercentage >= 90 ? 'Nearly Full!' : `${Math.round(registrationPercentage)}% capacity`}
              </p>
            </div>

            {/* CTA Button */}
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors duration-200 group min-h-[44px]"
            >
              {getButtonText()}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
