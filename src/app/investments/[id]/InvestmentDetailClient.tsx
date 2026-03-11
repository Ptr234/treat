'use client';

import React from 'react';
import Link from 'next/link';
import { InvestmentOpportunity } from '@/types';

interface InvestmentDetailClientProps {
  opportunity: InvestmentOpportunity;
}

export default function InvestmentDetailClient({ opportunity }: InvestmentDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => {
              const subject = encodeURIComponent(`Investment Inquiry: ${opportunity.title}`);
              const body = encodeURIComponent(
                `Dear ${opportunity.agency} Team,\n\n` +
                `I am interested in learning more about the investment opportunity: ${opportunity.title}.\n\n` +
                `Investment Range: ${opportunity.investmentRange}\n` +
                `Expected ROI: ${opportunity.roi}\n` +
                `Timeline: ${opportunity.timeline}\n\n` +
                `Please provide me with more detailed information about this opportunity.\n\n` +
                `Best regards`
              );
              window.open(`mailto:${opportunity.contact.email}?subject=${subject}&body=${body}`, '_self');
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg transition-all duration-200"
          >
            Send Inquiry
          </button>
          <button 
            onClick={() => window.open(`tel:${opportunity.contact.phone}`, '_self')}
            className="w-full border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Call Now
          </button>
          <Link
            href="/investments/onboarding"
            className="block w-full text-center border-2 border-yellow-400 text-yellow-600 px-4 py-3 rounded-lg font-medium hover:bg-yellow-50 transition-all duration-200"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}