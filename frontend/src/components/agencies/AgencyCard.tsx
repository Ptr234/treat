'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

export default function AgencyCard({ agency, className = '' }: AgencyCardProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  const getCategoryColor = (category: AgencyContact['category']) => {
    const colors = {
      investment: 'from-yellow-600 to-red-700',
      registration: 'from-red-700 to-red-900',
      taxation: 'from-yellow-500 to-yellow-700',
      environment: 'from-red-600 to-yellow-700',
      standards: 'from-neutral-800 to-red-900',
      infrastructure: 'from-yellow-700 to-red-800',
      immigration: 'from-red-800 to-neutral-900',
      lands: 'from-yellow-600 to-red-700',
      social_security: 'from-red-700 to-neutral-900',
      finance: 'from-yellow-500 to-yellow-700',
      tourism: 'from-red-600 to-red-800',
      employers: 'from-neutral-800 to-red-900',
      conservation: 'from-yellow-700 to-red-800'
    };
    return colors[category] || colors.investment;
  };

  const getUrgencyIndicator = (urgency: 'high' | 'medium' | 'low') => {
    const indicators = {
      high: { color: 'bg-red-600', text: 'High Priority' },
      medium: { color: 'bg-yellow-500', text: 'Medium Priority' },
      low: { color: 'bg-neutral-600', text: 'Standard' }
    };
    return indicators[urgency];
  };

  const urgencyInfo = getUrgencyIndicator(agency.urgencyLevel);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`bg-white rounded-md overflow-hidden border-2 border-neutral-200 hover:border-black transition-all duration-300 ${className}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(agency.category)} p-4 relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {agency.logo && (
                <div className="w-12 h-12 p-2 border-t-2 border-black pt-5">
                  <Image
                    src={agency.logo}
                    alt={`${agency.acronym} Logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/logos/default-agency.png';
                    }}
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-black">{agency.acronym}</h3>
                <p className="text-black/70 text-sm">{agency.category.charAt(0).toUpperCase() + agency.category.slice(1)}</p>
              </div>
            </div>
            <div className={`${urgencyInfo.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
              {urgencyInfo.text}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-black mb-2">{agency.name}</h4>
          <p className="text-neutral-700 text-sm mb-4 line-clamp-3">{agency.description}</p>

          {/* Services */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-yellow-500 mb-2">Key Services:</h5>
            <div className="flex flex-wrap gap-2">
              {agency.services.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="text-neutral-700 text-xs px-2 py-1 border-t-2 border-black pt-5"
                >
                  {service}
                </span>
              ))}
              {agency.services.length > 3 && (
                <span className="text-red-600 text-xs">+{agency.services.length - 3} more</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 mb-4 text-sm text-neutral-700">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-neutral-600" />
              <span>{agency.operatingHours}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-neutral-600" />
              <span className="truncate">{agency.contact.address}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2 mt-4">
            <button
              onClick={openAssistant}
              className="flex items-center justify-center space-x-2 bg-yellow-500 text-black px-4 py-2.5 rounded-md hover:bg-yellow-400 transition-all font-bold min-h-[44px]"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Ask About {agency.acronym}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/agencies/${agency.id}`}
                className="flex items-center justify-center space-x-2 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-md hover:bg-red-600 hover:text-red-600 transition-all font-medium text-sm border border-neutral-200 min-h-[44px]"
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>View Services</span>
              </Link>

              {agency.hasAppointmentBooking && (
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition-all font-medium text-sm min-h-[44px]"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

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
