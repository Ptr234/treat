'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NEWS_DISMISSED_KEY = 'newsbar_dismissed';

export default function NewsBar() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(NEWS_DISMISSED_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(NEWS_DISMISSED_KEY, 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-black text-white">
      <div className="flex items-center justify-center h-9 px-4 relative">
        <p className="text-xs sm:text-sm font-medium text-neutral-100 text-center truncate pr-8">
          <span className="text-yellow-400 font-semibold">New:</span>{' '}
          AI Investment Assistant now available in 5 languages — English, French, Arabic, Chinese & Swahili
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-white transition-colors"
          aria-label="Dismiss announcement"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
