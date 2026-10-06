'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-[65vh] bg-neutral-50 text-neutral-950">
      <nav aria-label="Breadcrumb" className="border-b border-neutral-200 bg-white">
        <ol className="mx-auto flex max-w-6xl gap-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
          <li><Link href="/" className="font-semibold text-red-700 underline underline-offset-2">Home</Link></li>
          <li aria-hidden="true" className="text-neutral-400">/</li>
          <li aria-current="page" className="font-semibold">Track an application</li>
        </ol>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-red-700">Application services</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Track your business registration</h1>
          <p className="mt-4 leading-7 text-neutral-700">Enter the reference number from your registration confirmation. You may be asked to verify the email address used when you applied.</p>
          <form onSubmit={submit} className="mt-8">
            <label htmlFor="application-reference" className="block text-sm font-semibold">Application reference number</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="application-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                autoComplete="off"
                className="min-h-12 min-w-0 flex-1 rounded-md border border-neutral-400 px-4 text-base focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-700"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'reference-error' : 'reference-help'}
                placeholder="For example, the reference in your email"
              />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#10283f] px-5 font-bold text-white hover:bg-[#1b3d5c] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                Find application
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {error ? <p id="reference-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p> : <p id="reference-help" className="mt-2 text-xs text-neutral-600">The reference is on the confirmation shown after submission or sent to your email.</p>}
          </form>
          <div className="mt-8 border-t border-neutral-200 pt-5 text-sm">
            <p className="font-semibold">Need to submit a new application?</p>
            <Link href="/business/registration" className="mt-2 inline-block font-semibold text-red-700 underline decoration-yellow-400 decoration-2 underline-offset-4">Start business registration</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
