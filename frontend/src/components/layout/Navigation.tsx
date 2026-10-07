'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRightIcon, ArrowRightOnRectangleIcon, Bars3Icon, ChevronDownIcon, MapIcon, Squares2X2Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardLabel, postLoginPath } from '@/lib/roles';
import AuthModal from '@/components/auth/AuthModal';

const MENUS = [
  {
    title: 'Services',
    intro: 'Find the services and first steps for doing business in Uganda.',
    groups: [
      { label: 'Get started', links: [{ label: 'Investment onboarding', href: '/investments/onboarding' }, { label: 'Business guide', href: '/guide' }, { label: 'Track an application', href: '/track' }] },
      { label: 'Business services', links: [{ label: 'Registration & incorporation', href: '/business/registration' }, { label: 'Permits & licences', href: '/services' }, { label: 'Tax & compliance', href: '/services' }, { label: 'Agency directory', href: '/agencies' }, { label: 'Investor aftercare', href: '/support' }] },
    ],
  },
  {
    title: 'Invest',
    intro: 'Research the market, sectors and licensed projects.',
    groups: [
      { label: 'Opportunities', links: [{ label: 'Priority sectors', href: '/investments' }, { label: 'Licensed projects map', href: '/projects' }, { label: 'Investor analytics', href: '/analytics' }, { label: 'Investment incentives', href: '/incentives' }, { label: 'Investment process', href: '/investments/process' }] },
      { label: 'Plan your investment', links: [{ label: 'ROI calculator', href: '/tools/roi-calculator' }, { label: 'Investment onboarding', href: '/investments/onboarding' }, { label: 'Investor profiles', href: '/investments/onboarding' }] },
    ],
  },
  {
    title: 'Resources',
    intro: 'Guides and practical tools for your next decision.',
    groups: [
      { label: 'Learn', links: [{ label: 'Guides & FAQs', href: '/guide' }, { label: 'Downloads', href: '/downloads' }, { label: 'Events', href: '/events' }] },
      { label: 'Tools', links: [{ label: 'Business calculators', href: '/tools' }, { label: 'AI investment assistant', href: '/chatbot' }, { label: 'Help centre', href: '/support' }] },
    ],
  },
];

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600" aria-label="OneStop Centre Uganda home">
      <Image src="/images/uganda-flag.png" alt="Flag of Uganda" width={36} height={24} className="h-6 w-9 flex-shrink-0 object-cover" priority />
      <Image src="/images/oneStopCenter-logo.jpeg" alt="" width={42} height={42} className="h-9 w-9 object-contain min-[390px]:h-10 min-[390px]:w-10" priority />
      <span className="leading-[1.05]">
        <span className="block text-sm font-extrabold tracking-tight text-black">OneStop Centre</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.2em] text-red-600">Uganda Investment Authority</span>
      </span>
    </Link>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const closeMenus = () => {
    setMobileOpen(false);
    setActiveMobileMenu(null);
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [accountMenuOpen]);

  return (
    <>
      {/* Utility strip */}
      <div className="hidden border-b border-neutral-200 bg-white text-[11px] text-neutral-600 md:block">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 lg:px-8">
          <span className="font-semibold text-neutral-800">Republic of Uganda <span className="mx-2 text-neutral-400">|</span> Uganda Investment Authority</span>
          <div className="flex items-center gap-5">
            <Link href="/events" className="hover:text-red-600 transition-colors">News &amp; events</Link>
            <Link href="/search" className="hover:text-red-600 transition-colors">Search</Link>
            <Link href="/support" className="hover:text-red-600 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <header id="site-header" className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
        <div aria-hidden="true" className="mx-auto flex h-1 max-w-6xl">
          <span className="flex-1 bg-black" />
          <span className="flex-1 bg-yellow-400" />
          <span className="flex-1 bg-red-600" />
        </div>
        <div className="mx-auto grid min-h-[68px] max-w-6xl grid-cols-[1fr_auto_1fr] items-stretch gap-2 px-3 sm:h-[76px] sm:gap-4 sm:px-6 lg:px-8">
          <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-center">
            <Brand />
          </div>


          <div className="col-start-1 row-start-1 hidden shrink-0 items-center justify-self-start gap-2 xl:flex xl:gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  aria-expanded={accountMenuOpen}
                  aria-controls="account-menu"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-neutral-800 hover:text-red-600"
                >
                  <UserCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {user.name}
                  <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {accountMenuOpen && (
                  <div id="account-menu" className="absolute left-0 top-full z-50 mt-2 w-56 border border-neutral-200 bg-white py-1.5 shadow-xl">
                    <Link
                      href={postLoginPath(user.role)}
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-red-600"
                    >
                      <Squares2X2Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {dashboardLabel(user.role)}
                    </Link>
                    <Link
                      href="/projects"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-red-600"
                    >
                      <MapIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Project Maps
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-red-600"
                    >
                      <UserCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Profile
                    </Link>
                    <div className="my-1 border-t border-neutral-200" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-100 hover:text-red-600"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="whitespace-nowrap px-2 py-2 text-sm font-semibold text-neutral-800 hover:text-red-600">Log in</button>
                <Link href="/investments/onboarding" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap bg-black px-4 py-2.5 text-sm font-bold text-yellow-400 transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
                  Start here <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <div className="col-start-3 row-start-1 flex items-center justify-self-end">
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-site-navigation" className="flex h-11 shrink-0 items-center justify-center gap-2 rounded px-3 text-black hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
              {mobileOpen ? <span className="text-sm font-bold">Close</span> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav id="mobile-site-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-7rem)] overscroll-contain overflow-y-auto border-t border-neutral-200 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:inset-x-auto sm:right-0 sm:w-96 sm:px-6">
            <div className="flex flex-col gap-1">
              {MENUS.map((menu) => {
                const open = activeMobileMenu === menu.title;
                return (
                  <div key={menu.title} className="border-b border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setActiveMobileMenu(open ? null : menu.title)}
                      aria-expanded={open}
                      aria-controls={`mobile-${menu.title.toLowerCase()}`}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span>
                        <span className="block font-display text-lg font-semibold text-black">{menu.title}</span>
                        <span className="mt-0.5 block text-xs text-neutral-600">{menu.intro}</span>
                      </span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${open ? 'bg-black text-yellow-400' : 'bg-neutral-100 text-black'}`} aria-hidden="true">
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {open && (
                      <div id={`mobile-${menu.title.toLowerCase()}`} className="mb-4 space-y-5 bg-neutral-50 px-4 py-4">
                        {menu.groups.map((group) => (
                          <div key={group.label}>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">{group.label}</p>
                            <ul className="mt-2 divide-y divide-neutral-200 bg-white">
                              {group.links.map((link) => (
                                <li key={link.href + link.label}>
                                  <Link
                                    href={link.href}
                                    onClick={closeMenus}
                                    aria-current={pathname === link.href ? 'page' : undefined}
                                    className="group flex min-h-11 items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-red-600"
                                  >
                                    {link.label}
                                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600" aria-hidden="true" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link href="/agencies" onClick={closeMenus} className="py-3 text-sm font-bold text-black">Agencies</Link>
              <Link href="/track" onClick={closeMenus} className="py-3 text-sm font-bold text-black">Track an application</Link>
              {isAuthenticated && user ? (
                <div className="mt-2 border-t border-neutral-200 pt-2">
                  <Link
                    href={postLoginPath(user.role)}
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 py-3 text-sm font-bold text-black"
                  >
                    <Squares2X2Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {dashboardLabel(user.role)}
                  </Link>
                  <Link href="/projects" onClick={closeMenus} className="flex items-center gap-2.5 py-3 text-sm font-semibold text-neutral-800">
                    <MapIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Project Maps
                  </Link>
                  <Link href="/profile" onClick={closeMenus} className="flex items-center gap-2.5 py-3 text-sm font-semibold text-neutral-800">
                    <UserCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => { closeMenus(); handleLogout(); }}
                    className="flex w-full items-center gap-2.5 py-3 text-left text-sm font-semibold text-neutral-800"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/investments/onboarding" onClick={closeMenus} className="mt-2 bg-black px-4 py-3 text-center text-sm font-bold text-yellow-400">Start here</Link>
                  <button onClick={() => { closeMenus(); setShowAuthModal(true); }} className="py-3 text-left text-sm font-semibold text-neutral-800">Log in</button>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="user" />
    </>
  );
}
