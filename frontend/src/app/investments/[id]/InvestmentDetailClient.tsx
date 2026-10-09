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
    <section className="gov-panel" aria-labelledby="quick-actions-heading">
      <h3 id="quick-actions-heading" className="font-display text-2xl font-semibold text-white">Next steps</h3>
      <div className="mt-5 flex flex-col gap-4">
        <button
          type="button"
          onClick={openAssistant}
          className="gov-btn gov-btn--gold w-full"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
          Ask the AI assistant
        </button>
        <Link
          href="/investments/onboarding"
          className="gov-btn gov-btn--outline-inverse w-full"
        >
          Start onboarding
        </Link>
      </div>
    </section>
  );
}
