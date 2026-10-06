'use client';

import React from 'react';
import BusinessRegistrationWizard from '@/components/forms/BusinessRegistrationWizard';

// Note: Metadata cannot be used in client components, so we'll handle SEO differently
// export const metadata: Metadata = {
//   title: 'Business Registration',
//   description: 'Streamlined business registration process with digital document submission and comprehensive support.',
// };

export default function BusinessRegistrationPage() {
  return (
 <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div>
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-red-600">Business registration</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Business Registration Wizard
            </h1>
            <p className="mt-5 text-base leading-7 text-neutral-700 sm:text-lg">
              Use the guided steps to identify the registration path for your business and understand the information you may need to prepare. The wizard helps you review likely documents, process stages and estimated costs before you proceed. Take time to check names, ownership details and contact information as you enter them. This tool provides planning guidance; the final requirements, fees and filing decision are set by the responsible authorities.
            </p>
          </div>
          
          <div className="border-t border-neutral-200 pt-10">
            <BusinessRegistrationWizard />
          </div>

          <div className="mt-12 border-l-4 border-red-600 pl-6">
            <h3 className="mb-2 text-lg font-bold text-black">Important note</h3>
            <p className="text-sm leading-7 text-neutral-700">
              This wizard provides estimates and guidance for business registration in Uganda. 
              Final costs and requirements may vary. Please verify with the relevant authorities 
              before proceeding with your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
