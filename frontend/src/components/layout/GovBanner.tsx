'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDownIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Official-site banner. Tells visitors how to recognise a genuine Government
 * of Uganda service before they share documents or payment details with it.
 */
export default function GovBanner() {
  const [open, setOpen] = useState(false);

  return (
    <section id="gov-banner" aria-label="Official government website" className="bg-[#0b0b0b] text-white">
      <div className="gov-container flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-[13px]">
        <Image src="/images/uganda-flag.png" alt="" width={24} height={16} className="h-4 w-6 shrink-0 object-cover" />
        <p className="leading-tight">An official website of the Government of the Republic of Uganda</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="gov-banner-detail"
          className="inline-flex items-center gap-1 font-semibold text-[#ffd700] underline underline-offset-2 hover:decoration-2"
        >
          Here&apos;s how you know
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div id="gov-banner-detail" className="border-t border-white/15">
          <div className="gov-container grid gap-6 py-5 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <GlobeAltIcon className="h-9 w-9 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <p className="leading-6 text-white/85">
                <strong className="block text-white">Official websites use .go.ug</strong>
                A <strong className="text-white">.go.ug</strong> address belongs to a government ministry, department or agency of Uganda.
              </p>
            </div>
            <div className="flex gap-3">
              <LockClosedIcon className="h-9 w-9 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <p className="leading-6 text-white/85">
                <strong className="block text-white">Secure websites use HTTPS</strong>
                Look for a padlock in your browser before you share personal or company information. Pay government fees only against an official payment registration number (PRN), never into a personal account.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
