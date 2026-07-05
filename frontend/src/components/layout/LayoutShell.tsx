'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import NewsBar from './NewsBar';
import ChatWidget from '@/components/chatbot/ChatWidget';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatbot = pathname.startsWith('/chatbot');

  // Chatbot page owns its entire viewport — no site chrome
  if (isChatbot) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-secondary-500 focus:text-primary-900 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <NewsBar />
      <Navigation />
      <main id="main-content" role="main" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
