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
    <section className="border-t border-neutral-200 pt-6" aria-labelledby="quick-actions-heading">
      <h3 id="quick-actions-heading" className="text-lg font-bold text-black">Next steps</h3>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={openAssistant}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-bold text-yellow-400 transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
          Ask the AI assistant
        </button>
        <Link
          href="/investments/onboarding"
          className="block w-full rounded-md border-2 border-black px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          Start onboarding
        </Link>
      </div>
    </section>
  );
}
