'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

export default function TrackApplicationPage() {
  const router = useRouter();
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = reference.trim();
    if (!value) {
      setError('Enter the reference number from your application confirmation.');
      return;
    }
    setError('');
    router.push(`/business/registration/${encodeURIComponent(value)}`);
  };

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Track an application' }]}
        caption="Application services"
        title="Track your business registration"
        lead="Enter the reference number from your registration confirmation. You may be asked to verify the email address you used when you applied."
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <form onSubmit={submit} noValidate className="max-w-xl">
          {error && (
            <div role="alert" className="mb-8 border-4 border-[#ce1126] p-5">
              <h2 className="text-lg font-bold">There is a problem</h2>
              <a href="#application-reference" className="mt-2 inline-block font-bold text-[#9a0d1c] underline underline-offset-4">{error}</a>
            </div>
          )}
          <div className={error ? 'border-l-4 border-[#ce1126] pl-4' : ''}>
            <label htmlFor="application-reference" className="gov-label text-lg">Application reference number</label>
            <p id="reference-help" className="gov-hint mb-2">It is on the confirmation shown after you applied, and in your email.</p>
            {error && <p id="reference-error" className="mb-2 text-sm font-bold text-[#9a0d1c]">{error}</p>}
            <input
              id="application-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={`gov-input max-w-sm font-mono text-lg uppercase tracking-wider ${error ? '!border-[#ce1126]' : ''}`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reference-error reference-help' : 'reference-help'}
            />
          </div>
          <button type="submit" className="gov-btn mt-8">Find application</button>
        </form>

        <aside className="space-y-8">
          <div className="gov-related">
            <h2>Not applied yet?</h2>
            <p className="text-[15px] text-[#3b3934]">Reserve a name and register your company with URSB.</p>
            <Link href="/business/registration" className="gov-link mt-2 inline-block">Start business registration</Link>
          </div>
          <div className="gov-related !border-black">
            <h2>Tracking a support ticket?</h2>
            <p className="text-[15px] text-[#3b3934]">Use the private link in your ticket confirmation email to see replies and progress.</p>
            <Link href="/tickets/create/" className="gov-link mt-2 inline-block">Submit a new support ticket</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
