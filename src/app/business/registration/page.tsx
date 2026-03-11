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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Business Registration Wizard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete your business registration step by step with our comprehensive wizard. 
              Get accurate cost estimates, required documents, and timeframes for your business type.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <BusinessRegistrationWizard />
          </div>
          
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Note</h3>
            <p className="text-yellow-700">
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