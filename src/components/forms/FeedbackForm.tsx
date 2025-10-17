'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  FaceSmileIcon, 
  FaceFrownIcon, 
  StarIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface FeedbackData {
  rating: number;
  category: string;
  subject: string;
  message: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  allowContact: boolean;
  anonymous: boolean;
}

interface FeedbackFormProps {
  onClose?: () => void;
  context?: string; // page or feature context
}

export default function FeedbackForm({ onClose, context }: FeedbackFormProps) {
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    rating: 0,
    category: '',
    subject: '',
    message: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    allowContact: true,
    anonymous: false
  });

  const feedbackCategories = [
    { value: 'bug', label: 'Bug Report', icon: '🐛', description: 'Something is not working correctly' },
    { value: 'feature', label: 'Feature Request', icon: '💡', description: 'Suggest a new feature or improvement' },
    { value: 'usability', label: 'Usability Issue', icon: '🎯', description: 'The interface is confusing or hard to use' },
    { value: 'content', label: 'Content Feedback', icon: '📝', description: 'Information is incorrect or outdated' },
    { value: 'performance', label: 'Performance Issue', icon: '⚡', description: 'The site is slow or unresponsive' },
    { value: 'general', label: 'General Feedback', icon: '💬', description: 'Other feedback or suggestions' }
  ];

  const updateFeedbackData = <K extends keyof FeedbackData>(key: K, value: FeedbackData[K]) => {
    setFeedbackData(prev => ({ ...prev, [key]: value }));
  };

  const updateContactInfo = <K extends keyof FeedbackData['contactInfo']>(
    key: K, 
    value: FeedbackData['contactInfo'][K]
  ) => {
    setFeedbackData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [key]: value }
    }));
  };

  const handleRatingClick = (rating: number) => {
    updateFeedbackData('rating', rating);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return feedbackData.rating > 0 && feedbackData.category;
      case 2:
        return feedbackData.subject.trim() && feedbackData.message.trim();
      case 3:
        return feedbackData.anonymous || (feedbackData.contactInfo.name.trim() && feedbackData.contactInfo.email.trim());
      default:
        return true;
    }
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification(
        'Thank you for your feedback! We appreciate your input and will review it carefully.',
        'success',
        'Feedback Submitted'
      );
      
      // Reset form
      setFeedbackData({
        rating: 0,
        category: '',
        subject: '',
        message: '',
        contactInfo: { name: '', email: '', phone: '' },
        allowContact: true,
        anonymous: false
      });
      setCurrentStep(1);
      
      if (onClose) {
        onClose();
      }
    } catch {
      showNotification(
        'Failed to submit feedback. Please try again later.',
        'error',
        'Submission Failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How was your experience?</h3>
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    {star <= feedbackData.rating ? (
                      <StarIconSolid className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              
              {feedbackData.rating > 0 && (
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center space-x-2">
                    {feedbackData.rating >= 4 ? (
                      <FaceSmileIcon className="w-8 h-8 text-green-500" />
                    ) : (
                      <FaceFrownIcon className="w-8 h-8 text-orange-500" />
                    )}
                    <span className="text-lg font-medium text-gray-900">
                      {feedbackData.rating >= 4 ? 'Great!' : 'We can do better!'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {feedbackCategories.map((category) => (
                  <div
                    key={category.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      feedbackData.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateFeedbackData('category', category.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{category.label}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={feedbackData.subject}
                onChange={(e) => updateFeedbackData('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Brief summary of your feedback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more
              </label>
              <textarea
                value={feedbackData.message}
                onChange={(e) => updateFeedbackData('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={6}
                placeholder="Please provide detailed feedback to help us improve..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {feedbackData.message.length}/500 characters
              </p>
            </div>

            {context && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Context:</strong> Feedback about {context}
                </p>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Submit anonymously</h4>
                <p className="text-sm text-gray-500">We won&apos;t be able to follow up with you</p>
              </div>
              <button
                onClick={() => updateFeedbackData('anonymous', !feedbackData.anonymous)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  feedbackData.anonymous ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    feedbackData.anonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {!feedbackData.anonymous && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={feedbackData.contactInfo.name}
                    onChange={(e) => updateContactInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={feedbackData.contactInfo.email}
                    onChange={(e) => updateContactInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={feedbackData.contactInfo.phone}
                    onChange={(e) => updateContactInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="+256 XXX XXX XXX"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={feedbackData.allowContact}
                    onChange={(e) => updateFeedbackData('allowContact', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Allow us to contact you for follow-up questions
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
              <p className="text-gray-600 mt-1">
                Help us improve OneStopCentre Uganda by sharing your thoughts and suggestions.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Step {currentStep} of 3
            </p>
          </div>
        </div>

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
          
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className={`px-6 py-2 rounded-md transition-colors ${
                validateCurrentStep()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitFeedback}
              disabled={!validateCurrentStep() || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                validateCurrentStep() && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}