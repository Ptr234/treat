'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAccountEmail } from '@/hooks/useAccountEmail';
import AccountEmailHint from '@/components/ui/AccountEmailHint';
import type { InvestmentEvent } from '@/types';

// Retained for the event-registration workflow, but intentionally not mounted
// while registrations are routed through the official Uganda Investment
// Authority website.
export default function EventRegistrationForm({ event }: { event: InvestmentEvent }) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [data, setData] = useState({ name: '', email: '', phone: '', organization: '' });
  const accountEmail = useAccountEmail((email) => setData((previous) => ({ ...previous, email })));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toIsoDate = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
  };

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault();
    setIsSubmitting(true);
    try {
      const { apiFetch } = await import('@/lib/api-client');
      const response = await apiFetch('/api/contact/appointments', {
        method: 'POST',
        body: JSON.stringify({
          agencyCode: 'UIA',
          agencyName: 'Uganda Investment Authority',
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          company: data.organization.trim() || null,
          serviceType: 'Event Registration',
          purpose: `Event registration: ${event.title}\nOrganization: ${data.organization}\nDate: ${new Date(event.date).toLocaleDateString()}`,
          duration: 60,
          meetingType: event.isVirtual ? 'virtual' : 'in-person',
          preferredDate: toIsoDate(event.date),
          preferredTime: /^\d{2}:\d{2}$/.test(event.time) ? event.time : '09:00',
        }),
      });
      if (!response.success) throw new Error(response.error || 'Registration failed');
      setStatus('success');
      setData({ name: '', email: '', phone: '', organization: '' });
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'gov-input';
  const labelClass = 'gov-label';

  return (
    <>
      {status === 'success' && <div role="status" className="gov-panel mt-4 p-4"><CheckCircleIcon className="h-5 w-5" aria-hidden="true" /> Registration successful.</div>}
      {status === 'error' && <div role="alert" className="gov-inset gov-inset--red mt-4"><XCircleIcon className="h-5 w-5" aria-hidden="true" /> Registration failed. Please try again.</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div><label htmlFor="name" className={labelClass}>Full name *</label><input id="name" name="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required className={inputClass} /></div>
        <div>
          <label htmlFor="email" className={labelClass}>Email address *</label>
          <input id="email" name="email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required readOnly={Boolean(accountEmail)} aria-describedby={accountEmail ? 'event-email-hint' : undefined} className={`${inputClass} ${accountEmail ? 'bg-neutral-100' : ''}`} />
          {accountEmail && <AccountEmailHint id="event-email-hint" />}
        </div>
        <div><label htmlFor="phone" className={labelClass}>Phone number *</label><input id="phone" name="phone" type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required className={inputClass} /></div>
        <div><label htmlFor="organization" className={labelClass}>Organization *</label><input id="organization" name="organization" value={data.organization} onChange={(e) => setData({ ...data, organization: e.target.value })} required className={inputClass} /></div>
        <button type="submit" disabled={isSubmitting} className="gov-btn w-full">{isSubmitting ? 'Registering…' : 'Register now'}</button>
      </form>
    </>
  );
}
