'use client';

import React from 'react';
import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { InvestmentOpportunity } from '@/types';

interface InvestmentDetailClientProps {
  opportunity: InvestmentOpportunity;
}

export default function InvestmentDetailClient({ opportunity }: InvestmentDetailClientProps) {
  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I'm interested in the investment opportunity: ${opportunity.title}. Investment range: ${opportunity.investmentRange}, Expected ROI: ${opportunity.roi}. Please provide more details.` }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={openAssistant}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg transition-all duration-200"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Ask the AI Assistant
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
