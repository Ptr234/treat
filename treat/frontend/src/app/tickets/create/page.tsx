'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationCircleIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { TicketCategory, TicketPriority } from '@/types';

interface TicketFormData {
  category: TicketCategory | '';
  title: string;
  description: string;
  priority: TicketPriority;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  attachments: string[];
}

interface CategoryOption {
  value: TicketCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sla: string;
  priority: TicketPriority;
}

const categories: CategoryOption[] = [
  {
    value: 'general_inquiry',
    label: 'General Inquiry',
    description: 'General questions about investment procedures and requirements',
    icon: ChatBubbleLeftRightIcon,
    sla: 'Response: 24h | Resolution: 5 days',
    priority: 'low'
  },
  {
    value: 'procedure_query',
    label: 'Procedure Query',
    description: 'Specific questions about processes and documentation',
    icon: DocumentTextIcon,
    sla: 'Response: 8h | Resolution: 3 days',
    priority: 'medium'
  },
  {
    value: 'application_support',
    label: 'Application Support',
    description: 'Get help with your submitted applications',
    icon: ClockIcon,
    sla: 'Response: 4h | Resolution: 2 days',
    priority: 'medium'
  },
  {
    value: 'license_delay',
    label: 'License Delay',
    description: 'Report delays in license or permit processing',
    icon: ExclamationCircleIcon,
    sla: 'Response: 2h | Resolution: 5 days',
    priority: 'high'
  },
  {
    value: 'complaint',
    label: 'Complaint',
    description: 'Formal complaints about services or processes',
    icon: ExclamationCircleIcon,
    sla: 'Response: 2h | Resolution: 3 days',
    priority: 'high'
  },
  {
    value: 'vip',
    label: 'VIP Investor',
    description: 'Priority support for high-value investment inquiries',
    icon: StarIcon,
    sla: 'Response: 1h | Resolution: Same day',
    priority: 'critical'
  }
];

export default function CreateTicketPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TicketFormData>({
    category: '',
    title: '',
    description: '',
    priority: 'low',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    attachments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
    } else if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (formData.description.length < 20) {
        newErrors.description = 'Please provide more details (minimum 20 characters)';
      }
    } else if (step === 3) {
      if (!formData.contactName.trim()) {
        newErrors.contactName = 'Name is required';
      }
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'Phone is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      try {
        const ticketData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
        };

        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          alert(result.error || 'Failed to create ticket. Please try again.');
          return;
        }

        const refNumber = result.data?.referenceNumber || 'Pending';
        alert(`Ticket created successfully!\n\nReference: ${refNumber}\n\nYou will receive an email confirmation at ${formData.contactEmail}`);
        router.push('/tickets/');
      } catch (error) {
        console.error('Failed to create ticket:', error);
        alert('Failed to create ticket. Please try again.');
      }
    }
  };

  const selectedCategory = categories.find(c => c.value === formData.category);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/tickets/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tickets
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-2">Submit your inquiry or issue</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step < currentStep
                        ? 'bg-yellow-600 text-black'
                        : step === currentStep
                        ? 'bg-yellow-600 text-black ring-4 ring-yellow-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <CheckCircleIcon className="w-6 h-6" /> : step}
                  </div>
                  <p className="text-xs mt-2 text-gray-600 hidden sm:block">
                    {step === 1 && 'Category'}
                    {step === 2 && 'Details'}
                    {step === 3 && 'Contact'}
                    {step === 4 && 'Review'}
                  </p>
                </div>
                {step < 4 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className={`h-full ${
                        step < currentStep ? 'bg-yellow-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Category</h2>
                <p className="text-gray-600 mb-6">Choose the type of issue or inquiry</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.value}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            category: category.value,
                            priority: category.priority
                          });
                          setErrors({});
                        }}
                        className={`p-5 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          formData.category === category.value
                            ? 'border-yellow-600 bg-yellow-50'
                            : 'border-gray-200 hover:border-yellow-300'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-3 ${
                          formData.category === category.value ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                        <h3 className="font-semibold text-gray-900 mb-1">{category.label}</h3>
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        <p className="text-xs text-gray-500 font-medium">{category.sla}</p>
                      </button>
                    );
                  })}
                </div>

                {errors.category && (
                  <p className="text-red-600 text-sm mt-2">{errors.category}</p>
                )}
              </motion.div>
            )}

            {/* Step 2: Issue Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Details</h2>
                <p className="text-gray-600 mb-6">Describe your inquiry or issue</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of your issue"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide detailed information about your inquiry or issue..."
                      rows={6}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length} characters (minimum 20)
                    </p>
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        formData.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        formData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {formData.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        (Auto-assigned based on category)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact & Attachments */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-600 mb-6">How can we reach you?</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Your full name"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.contactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactName && (
                      <p className="text-red-600 text-sm mt-1">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactEmail && (
                      <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+256 700 000 000"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactPhone && (
                      <p className="text-red-600 text-sm mt-1">{errors.contactPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <PaperClipIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop files or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, PNG, JPG (max 10MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const fileName = prompt('Enter mock file name (e.g., document.pdf)');
                          if (fileName) {
                            setFormData({
                              ...formData,
                              attachments: [...formData.attachments, fileName]
                            });
                          }
                        }}
                        className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Mock File
                      </button>
                    </div>
                    {formData.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">{file}</span>
                            <button
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  attachments: formData.attachments.filter((_, i) => i !== index)
                                });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600 mb-6">Please review your information before submitting</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                    <div className="flex items-center gap-3">
                      {selectedCategory && (
                        <>
                          <selectedCategory.icon className="w-6 h-6 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">{selectedCategory.label}</p>
                            <p className="text-sm text-gray-600">{selectedCategory.sla}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Issue Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-2">{formData.title}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.description}</p>
                      <div className="mt-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          formData.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          formData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {formData.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm"><span className="font-medium">Name:</span> {formData.contactName}</p>
                      <p className="text-sm"><span className="font-medium">Email:</span> {formData.contactEmail}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {formData.contactPhone}</p>
                      {formData.attachments.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-1">Attachments:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {formData.attachments.map((file, index) => (
                              <li key={index}>{file}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium transition-colors"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Submit Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
