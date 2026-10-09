'use client';

import React from 'react';
import Link from 'next/link';
import BusinessRegistrationWizard from '@/components/forms/BusinessRegistrationWizard';
import PageHeader from '@/components/ui/PageHeader';

// Metadata is provided by ./layout.tsx — this page is a client component.

export default function BusinessRegistrationPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Services', href: '/services' }, { label: 'Register a business' }]}
        caption="Uganda Registration Services Bureau"
        title="Register a business"
        lead="Reserve a name and register your company step by step. Check names, ownership details and contact information carefully as you enter them — you can track your application afterwards with the reference number."
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div className="min-w-0">
          <BusinessRegistrationWizard />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
          <div className="gov-related">
            <h2>Before you start</h2>
            <p className="text-[15px] text-[#3b3934]">Have these ready:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[#3b3934]">
              <li>proposed business names</li>
              <li>identity documents for directors and shareholders</li>
              <li>your registered physical address</li>
            </ul>
            <Link href="/tools/document-checklist" className="gov-link mt-3 inline-block">Full document checklist</Link>
          </div>
          <div className="gov-inset gov-inset--red text-[15px]">
            <p className="font-bold">Important</p>
            <p className="mt-1 leading-6 text-[#3b3934]">
              Costs shown are estimates. Final fees and requirements are set by URSB — verify them before you pay.
            </p>
          </div>
          <div className="gov-related !border-black">
            <h2>Already applied?</h2>
            <Link href="/track" className="gov-link">Track your application</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
