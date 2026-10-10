'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GovBanner from './GovBanner';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatWidget from '@/components/chatbot/ChatWidget';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatbot = pathname.startsWith('/chatbot');
  // /dashboard and /agency-chat are staff-only admin console routes with
  // their own DashboardShell (sidebar + topbar + sign-out). Without this
  // check they also rendered the full public site header, mega-menu,
  // footer, and the investor-facing chat widget stacked around the admin
  // chrome — two navigation systems on screen at once, and a floating
  // "Ask Assistant" bubble on top of agency-chat's own staff chat tool.
  const isStaffConsole = pathname.startsWith('/dashboard') || pathname.startsWith('/agency-chat');
  // Printable documents (registration certificates) carry no site chrome.
  const isCertificate = pathname.endsWith('/certificate');
  // The Sanity Studio is a full-screen app with its own navigation, and its
  // CSS reset collapsed the site header's spacing when the two were combined.
  const isStudio = pathname.startsWith('/studio');

  // These pages own their entire viewport — no public site chrome.
  if (isChatbot || isStaffConsole || isCertificate || isStudio) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:block focus:bg-[#ffd700] focus:px-4 focus:py-3 focus:text-base focus:font-bold focus:text-black focus:underline"
      >
        Skip to main content
      </a>
      <GovBanner />
      <Navigation />

      <div id="phase-banner" className="border-b border-[#dcd8cf] bg-white">
        <p className="gov-container flex items-start gap-3 py-2.5 text-sm text-[#3b3934] sm:items-center">
          <strong className="gov-tag gov-tag--gold mt-0.5 shrink-0 sm:mt-0">Beta</strong>
          <span>
            This is a new digital service.{' '}
            <Link href="/support" className="gov-link font-normal">Your feedback</Link> will help us improve it.
          </span>
        </p>
      </div>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <div className="border-t border-[#dcd8cf] bg-white" data-print-hide>
        <div className="gov-container flex flex-col gap-3 py-6 text-[15px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#3b3934]">
            Is something wrong with this page?{' '}
            <Link href={`/support?page=${encodeURIComponent(pathname)}#contact-form`} className="gov-link">Report a problem</Link>
          </p>
          <a href="#main-content" className="gov-link inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-2 -rotate-45 border-r-2 border-t-2 border-current" />
            Back to top
          </a>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
