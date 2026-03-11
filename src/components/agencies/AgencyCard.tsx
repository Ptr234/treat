'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { AgencyContact } from '@/data/agencies';
import ContactModal from './ContactModal';
import AppointmentModal from './AppointmentModal';

interface AgencyCardProps {
  agency: AgencyContact;
  className?: string;
}

export default function AgencyCard({ agency, className = '' }: AgencyCardProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleEmailClick = () => {
    const subject = `Inquiry about ${agency.services[0]} - OneStopCentre Uganda`;
    const body = `Dear ${agency.acronym} Team,

I am writing to inquire about your services, specifically regarding ${agency.services[0]}.

I would appreciate if you could provide me with:
- Information about the application process
- Required documents
- Processing timeline
- Associated fees

I am reaching out through the OneStopCentre Uganda portal.

Thank you for your time and assistance.

Best regards,`;

    const mailtoUrl = `mailto:${agency.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handlePhoneClick = () => {
    const phoneNumber = agency.contact.phone.replace(/\s+/g, '');
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const getCategoryColor = (category: AgencyContact['category']) => {
    const colors = {
      investment: 'from-green-500 to-emerald-600',
      registration: 'from-blue-500 to-indigo-600',
      taxation: 'from-orange-500 to-red-600',
      environment: 'from-teal-500 to-cyan-600',
      standards: 'from-purple-500 to-pink-600',
      infrastructure: 'from-gray-500 to-slate-600',
      immigration: 'from-indigo-500 to-blue-600',
      lands: 'from-yellow-500 to-orange-600',
      social_security: 'from-rose-500 to-pink-600',
      finance: 'from-emerald-500 to-green-600',
      tourism: 'from-cyan-500 to-teal-600',
      employers: 'from-violet-500 to-purple-600',
      conservation: 'from-lime-500 to-green-600'
    };
    return colors[category] || colors.investment;
  };

  const getUrgencyIndicator = (urgency: 'high' | 'medium' | 'low') => {
    const indicators = {
      high: { color: 'bg-red-500', text: 'High Priority' },
      medium: { color: 'bg-yellow-500', text: 'Medium Priority' },
      low: { color: 'bg-green-500', text: 'Standard' }
    };
    return indicators[urgency];
  };

  const urgencyInfo = getUrgencyIndicator(agency.urgencyLevel);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 ${className}`}
      >
        {/* Header with Logo and Priority */}
        <div className={`bg-gradient-to-r ${getCategoryColor(agency.category)} p-4 relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {agency.logo && (
                <div className="w-12 h-12 bg-white rounded-lg p-2 shadow-md">
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
                <h3 className="text-xl font-bold text-white">{agency.acronym}</h3>
                <p className="text-white/90 text-sm">{agency.category.charAt(0).toUpperCase() + agency.category.slice(1)}</p>
              </div>
            </div>
            <div className={`${urgencyInfo.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
              {urgencyInfo.text}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{agency.name}</h4>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{agency.description}</p>

          {/* Services */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Key Services:</h5>
            <div className="flex flex-wrap gap-2">
              {agency.services.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {service}
                </span>
              ))}
              {agency.services.length > 3 && (
                <span className="text-gray-500 text-xs">+{agency.services.length - 3} more</span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>{agency.operatingHours}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="truncate">{agency.contact.address}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2 mt-4">
            <button
              onClick={handleEmailClick}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>Send Email</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePhoneClick}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Call</span>
              </button>

              {agency.hasAppointmentBooking ? (
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Contact</span>
                </button>
              )}
            </div>
          </div>

          {/* Website Link */}
          {agency.contact.website && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <a
                href={agency.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Visit Website</span>
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <ContactModal
        agency={agency}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

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