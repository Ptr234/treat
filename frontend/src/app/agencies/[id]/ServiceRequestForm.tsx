'use client';

import { useState } from 'react';
import { useAccountEmail } from '@/hooks/useAccountEmail';
import AccountEmailHint from '@/components/ui/AccountEmailHint';
import { apiFetch } from '@/lib/api-client';

interface ServiceRequestFormProps {
  agencyName: string;
  agencyCode: string;
  agencyEmail?: string;
  services: string[];
}

export default function ServiceRequestForm({ agencyName, agencyCode, agencyEmail, services }: ServiceRequestFormProps) {
  const accountEmail = useAccountEmail();
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
          phone: (formData.get('phone') as string | null)?.trim() || null,
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

  const inputClass = 'gov-input';
  const labelClass = 'gov-label';

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {result && (
        <div
          role={result.success ? 'status' : 'alert'}
          className={result.success ? 'gov-panel text-[15px]' : 'gov-inset gov-inset--red text-[15px] font-semibold'}
        >
          {result.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Full name <span className="text-red-600">*</span></label>
          <input type="text" id="name" name="name" required className={inputClass} placeholder="Enter your full name" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email address <span className="text-red-600">*</span></label>
          <input
            key={accountEmail ?? 'visitor'}
            type="email"
            id="email"
            name="email"
            required
            defaultValue={accountEmail ?? undefined}
            readOnly={Boolean(accountEmail)}
            aria-describedby={accountEmail ? 'service-email-hint' : undefined}
            className={`${inputClass} ${accountEmail ? 'bg-neutral-100' : ''}`}
            placeholder="your.email@example.com"
          />
          {accountEmail && <AccountEmailHint id="service-email-hint" />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone number</label>
          <input type="tel" id="phone" name="phone" className={inputClass} placeholder="+256 XXX XXX XXX" />
        </div>
        <div>
          <label htmlFor="service" className={labelClass}>Service required <span className="text-red-600">*</span></label>
          <select id="service" name="service" required className={inputClass}>
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message / additional details <span className="text-red-600">*</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={inputClass}
          placeholder="Please provide details about your service request..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="gov-btn"
      >
        {isSubmitting ? 'Submitting…' : 'Submit service request'}
      </button>
    </form>
  );
}
