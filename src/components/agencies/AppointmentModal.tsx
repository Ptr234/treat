'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { AgencyContact } from '@/data/agencies';
import { useNotification } from '@/contexts/NotificationContext';

interface AppointmentModalProps {
  agency: AgencyContact;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({ agency, isOpen, onClose }: AppointmentModalProps) {
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    alternativeDate: '',
    alternativeTime: '',
    purpose: '',
    duration: '30',
    meetingType: 'in-person' as 'in-person' | 'virtual' | 'phone',
    specialRequirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return appointmentData.name && appointmentData.email && appointmentData.phone;
      case 2:
        return appointmentData.serviceType && appointmentData.purpose;
      case 3:
        return appointmentData.preferredDate && appointmentData.preferredTime;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Format appointment details for email
      const appointmentDetails = `
APPOINTMENT REQUEST - ${agency.acronym}

Personal Information:
Name: ${appointmentData.name}
Email: ${appointmentData.email}
Phone: ${appointmentData.phone}
Company: ${appointmentData.company || 'N/A'}

Service Details:
Service Type: ${appointmentData.serviceType}
Purpose: ${appointmentData.purpose}
Expected Duration: ${appointmentData.duration} minutes
Meeting Type: ${appointmentData.meetingType.charAt(0).toUpperCase() + appointmentData.meetingType.slice(1)}

Preferred Schedule:
First Choice: ${appointmentData.preferredDate} at ${appointmentData.preferredTime}
Alternative: ${appointmentData.alternativeDate ? `${appointmentData.alternativeDate} at ${appointmentData.alternativeTime}` : 'No alternative provided'}

Special Requirements:
${appointmentData.specialRequirements || 'None'}

This appointment request was submitted through the OneStopCentre Uganda portal.

Please confirm the appointment by replying to this email with:
- Confirmed date and time
- Meeting location (if in-person) or meeting link (if virtual)
- Any documents to bring
- Contact person details

Thank you.`;

      const subject = `Appointment Request - ${appointmentData.serviceType} - ${appointmentData.name}`;
      const mailtoUrl = `mailto:${agency.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(appointmentDetails)}`;
      
      window.open(mailtoUrl, '_blank');

      // Simulate appointment submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      showNotification(
        `Your appointment request has been sent to ${agency.acronym}. They will contact you within 24 hours to confirm the details.`,
        'success',
        'Appointment Request Sent'
      );

      // Reset form
      setAppointmentData({
        name: '',
        email: '',
        phone: '',
        company: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        alternativeDate: '',
        alternativeTime: '',
        purpose: '',
        duration: '30',
        meetingType: 'in-person',
        specialRequirements: ''
      });
      setCurrentStep(1);
      onClose();
    } catch {
      showNotification(
        'Failed to send appointment request. Please try again or contact the agency directly.',
        'error',
        'Appointment Request Failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={appointmentData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={appointmentData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={appointmentData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="+256 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={appointmentData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Your company (optional)"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Required *
              </label>
              <select
                name="serviceType"
                value={appointmentData.serviceType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Select a service</option>
                {agency.services.map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Duration
                </label>
                <select
                  name="duration"
                  value={appointmentData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  name="meetingType"
                  value={appointmentData.meetingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="in-person">In-Person Meeting</option>
                  <option value="virtual">Virtual Meeting</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Meeting *
              </label>
              <textarea
                name="purpose"
                value={appointmentData.purpose}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Please describe what you'd like to discuss or accomplish in this meeting..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Preferences</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Please provide your preferred appointment time and an alternative option.
                Operating hours: {agency.operatingHours}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">First Choice</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={appointmentData.preferredDate}
                    onChange={handleInputChange}
                    required
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <select
                    name="preferredTime"
                    value={appointmentData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="font-medium text-gray-900">Alternative Option (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Date
                  </label>
                  <input
                    type="date"
                    name="alternativeDate"
                    value={appointmentData.alternativeDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Time
                  </label>
                  <select
                    name="alternativeTime"
                    value={appointmentData.alternativeTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{appointmentData.name}</span>
                <span className="text-gray-500">({appointmentData.email})</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                <span>{appointmentData.serviceType}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span>{appointmentData.preferredDate} at {appointmentData.preferredTime}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span>{appointmentData.duration} minutes ({appointmentData.meetingType})</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements or Notes
              </label>
              <textarea
                name="specialRequirements"
                value={appointmentData.specialRequirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Any special requirements, accessibility needs, or additional notes..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                By submitting this request, you agree that {agency.acronym} may contact you to confirm 
                appointment details. You will receive confirmation within 24 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-purple-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Book Appointment</h2>
                <p className="text-purple-100">{agency.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-700 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded-full ${
                      step <= currentStep ? 'bg-white' : 'bg-purple-800'
                    }`}
                  />
                ))}
              </div>
              <p className="text-purple-100 text-sm mt-2">
                Step {currentStep} of 4
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 border border-gray-300 rounded-md transition-colors ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  validateStep(currentStep)
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <CalendarIcon className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Sending...' : 'Book Appointment'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}