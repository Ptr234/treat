'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BanknotesIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ArrowDownTrayIcon,
  MapIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  highlight?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Projects Map', href: '/projects', icon: MapIcon },
  { name: 'Events Calendar', href: '/events', icon: CalendarDaysIcon },
  { name: 'Investments', href: '/investments', icon: BanknotesIcon },
  { name: 'Services', href: '/services', icon: BriefcaseIcon },
  { name: 'Tools', href: '/tools', icon: WrenchScrewdriverIcon },
  { name: 'Resources', href: '/downloads', icon: ArrowDownTrayIcon },
  { name: 'AI Assistant', href: '/chatbot', icon: ChatBubbleLeftRightIcon, highlight: true },
  { name: 'OSC Hub', href: '/agencies', icon: BuildingLibraryIcon },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <Image
        src="/images/oneStopCenter-logo.jpeg"
        alt="OneStopCentre Uganda logo"
        width={40}
        height={40}
        className="rounded-lg object-contain bg-white flex-shrink-0"
      />
      <span className="leading-tight">
        <span className="block text-base font-black text-white group-hover:text-yellow-400 transition-colors">
          OneStopCentre
        </span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-500">
          Uganda
        </span>
      </span>
    </Link>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navLinks = (
    <ul className="flex flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setIsOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${
                  active
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : item.highlight
                      ? 'text-yellow-400 hover:bg-white/10'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
              {item.highlight && !active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const authArea = isAuthenticated ? (
    <div className="space-y-1.5">
      <Link
        href="/account"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        <UserCircleIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">{user?.name ?? 'My Account'}</span>
      </Link>
      <button
        onClick={() => {
          setIsOpen(false);
          logout();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-400 hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        Sign Out
      </button>
    </div>
  ) : (
    <button
      onClick={() => {
        setIsOpen(false);
        setShowAuthModal(true);
      }}
      className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25"
    >
      Sign In
    </button>
  );

  const sidebarInner = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <Brand />
      </div>

      {/* Links — fill the height consistently */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {navLinks}
      </nav>

      {/* Auth */}
      <div className="px-3 pb-6 pt-4 border-t border-white/10">{authArea}</div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-50 bg-black border-b-2 border-yellow-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar — pinned full-height on desktop, slide-in overlay on mobile */}
      {/* Fixed to the viewport so the nav never moves on scroll; content offsets past it via lg:ml-64 */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 z-40
                    transform transition-transform duration-300 lg:transform-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {sidebarInner}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* User sign-in (Google) — admin sign-in lives in the footer */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="user" />
    </>
  );
}
