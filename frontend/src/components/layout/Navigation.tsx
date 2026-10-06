'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRightIcon, Bars3Icon, ChevronDownIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
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

const MENU_PATHS: Record<string, string[]> = {
  Services: ['/business', '/track', '/services'],
  Invest: ['/investments', '/projects', '/incentives', '/analytics'],
  Resources: ['/downloads', '/guide', '/events', '/tools', '/chatbot', '/support'],
};

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600" aria-label="OneStop Centre Uganda home">
      <Image src="/images/uganda-flag.png" alt="Flag of Uganda" width={36} height={24} className="h-6 w-9 flex-shrink-0 object-cover" priority />
      <Image src="/images/oneStopCenter-logo.jpeg" alt="" width={42} height={42} className="h-9 w-9 object-contain min-[390px]:h-10 min-[390px]:w-10" priority />
      <span className="leading-[1.05]">
        <span className="block text-sm font-extrabold tracking-tight text-white">OneStop Centre</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.2em] text-yellow-400">Uganda Investment Authority</span>
      </span>
    </Link>
  );
}

export default function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const closeMenus = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setActiveMobileMenu(null);
  };

  return (
    <>
      {/* Utility strip */}
      <div className="hidden border-b border-neutral-200 bg-white text-[11px] text-neutral-600 md:block">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 lg:px-8">
          <span className="font-semibold text-neutral-800">Republic of Uganda <span className="mx-2 text-neutral-400">|</span> Uganda Investment Authority</span>
          <div className="flex items-center gap-5">
            <Link href="/events" className="hover:text-red-600 transition-colors">News &amp; events</Link>
            <Link href="/support" className="hover:text-red-600 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <header id="site-header" className="sticky z-50 border-b border-neutral-200 bg-white" style={{ top: 'var(--newsbar-h, 0px)' }}>
        <div aria-hidden="true" className="mx-auto flex h-1 max-w-6xl">
          <span className="flex-1 bg-black" />
          <span className="flex-1 bg-yellow-400" />
          <span className="flex-1 bg-red-600" />
        </div>
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-stretch justify-between gap-2 bg-black px-3 sm:h-[76px] sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 shrink items-center pr-1 sm:shrink-0 sm:pr-2">
            <Brand />
          </div>

          <nav aria-label="Main navigation" className="hidden items-stretch gap-0.5 xl:flex xl:gap-1">
            {MENUS.map((menu) => {
              const isCurrent = MENU_PATHS[menu.title]?.some((path) => pathname.startsWith(path)) ?? false;
              const expanded = activeMenu === menu.title;
              const menuId = `menu-${menu.title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
              return (
                <div
                  key={menu.title}
                  className="relative flex"
                  onMouseEnter={() => setActiveMenu(menu.title)}
                  onMouseLeave={() => setActiveMenu(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setActiveMenu(null);
                      e.currentTarget.querySelector('button')?.focus();
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={menuId}
                    onClick={() => setActiveMenu(menu.title)}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 text-[15px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 xl:px-4 ${expanded || isCurrent ? 'bg-white/10 text-yellow-400' : 'text-white hover:bg-white/10 hover:text-yellow-400'}`}
                  >
                    {menu.title}
                    <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {expanded && (
                    <div id={menuId} className="absolute left-0 top-full z-50 w-72 border border-neutral-200 bg-white shadow-xl">
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <p className="bg-neutral-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[.15em] text-neutral-500">{group.label}</p>
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href + link.label} className="border-t border-neutral-200">
                                <Link
                                  href={link.href}
                                  onClick={closeMenus}
                                  className="block border-l-4 border-transparent px-4 py-3 text-sm text-neutral-900 transition-colors hover:border-yellow-400 hover:bg-neutral-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
                                >
                                  {link.label}
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
            <Link href="/agencies" aria-current={pathname.startsWith('/agencies') ? 'page' : undefined} className={`inline-flex shrink-0 items-center whitespace-nowrap px-3 text-[15px] transition-colors hover:bg-white/10 hover:text-yellow-400 ${pathname.startsWith('/agencies') ? 'font-semibold text-yellow-400' : 'text-white'}`}>Agencies</Link>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex xl:gap-3">
            {isAuthenticated ? (
              <Link href="/profile" className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white hover:text-yellow-400">
                <UserCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {user?.name ?? 'My account'}
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="whitespace-nowrap px-2 py-2 text-sm font-semibold text-white hover:text-yellow-400">Log in</button>
            )}
            <Link href="/investments/onboarding" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
              Start here <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center xl:hidden">
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-site-navigation" className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav id="mobile-site-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-6rem)] overscroll-contain overflow-y-auto border-t border-neutral-200 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg xl:hidden">
            <div className="flex flex-col gap-1">
              {MENUS.map((menu) => (
                <div key={menu.title} className="border-b border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setActiveMobileMenu(activeMobileMenu === menu.title ? null : menu.title)}
                    aria-expanded={activeMobileMenu === menu.title}
                    className="flex w-full items-center justify-between py-3 text-left text-sm font-bold text-black"
                  >
                    {menu.title}
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${activeMobileMenu === menu.title ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {activeMobileMenu === menu.title && (
                    <div className="grid grid-cols-1 gap-y-4 pb-4 min-[420px]:grid-cols-2 min-[420px]:gap-x-4 min-[420px]:gap-y-5">
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{group.label}</p>
                          {group.links.map((link) => (
                            <Link key={link.href + link.label} href={link.href} onClick={closeMenus} aria-current={pathname === link.href ? 'page' : undefined} className="block min-h-10 py-2 text-sm font-medium text-neutral-800 hover:text-red-600">
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/agencies" onClick={closeMenus} className="py-3 text-sm font-bold text-black">Agencies</Link>
              <Link href="/track" onClick={closeMenus} className="py-3 text-sm font-bold text-black">Track an application</Link>
              <Link href="/investments/onboarding" onClick={closeMenus} className="mt-2 bg-black px-4 py-3 text-center text-sm font-bold text-yellow-400">Start here</Link>
              {isAuthenticated ? (
                <Link href="/profile" onClick={closeMenus} className="py-3 text-sm font-semibold text-neutral-800">My account</Link>
              ) : (
                <button onClick={() => { closeMenus(); setShowAuthModal(true); }} className="py-3 text-left text-sm font-semibold text-neutral-800">Log in</button>
              )}
            </div>
          </nav>
        )}
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="user" />
    </>
  );
}
