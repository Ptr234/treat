'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface ServiceRequestFormProps {
  agencyName: string;
  agencyCode: string;
  agencyEmail?: string;
  services: string[];
}

export default function ServiceRequestForm({ agencyName, agencyCode, agencyEmail, services }: ServiceRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; ref?: string } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await apiFetch<{ referenceNumber: string }>('/api/contact/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          agencyCode,
          agencyName,
          agencyEmail: agencyEmail || null,
          name: formData.get('name'),
          email: formData.get('email'),
          serviceType: formData.get('service'),
          subject: `Service Request: ${formData.get('service')}`,
          message: formData.get('message'),
          phone: formData.get('phone') || '+256000000000',
          urgency: 'normal',
        }),
      });

      if (!res.success) throw new Error(res.error);

      setResult({
        success: true,
        message: `Service request submitted successfully! Reference: ${res.data?.referenceNumber}. We will contact you within 24-48 hours.`,
        ref: res.data?.referenceNumber,
      });
      (e.target as HTMLFormElement).reset();
    } catch {
      setResult({
        success: false,
        message: 'Failed to submit request. Please try again or contact the agency directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-neutral-800 p-4 sm:p-6 rounded-lg border border-neutral-700">
      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${
          result.success
            ? 'bg-green-900/30 border-green-700 text-green-300'
            : 'bg-red-900/30 border-red-700 text-red-300'
        }`}>
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="+256 XXX XXX XXX"
          />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-neutral-300 mb-2">
            Service Required <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            name="service"
            required
            className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
          Message / Additional Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 sm:py-2 bg-neutral-900 border border-neutral-600 text-white placeholder-neutral-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder="Please provide details about your service request..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Service Request'}
      </button>
    </form>
  );
}
