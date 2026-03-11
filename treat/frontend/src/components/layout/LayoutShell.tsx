'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
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
      <NewsBar />
      <Header />
      <main className="flex-1 pt-24 md:pt-28">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
