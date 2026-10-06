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
    title: 'Start a business',
    intro: 'Get oriented and take your first steps in Uganda.',
    groups: [
      { label: 'First steps', links: [{ label: 'Investment onboarding', href: '/investments/onboarding' }, { label: 'Explore opportunities', href: '/investments' }, { label: 'Business guide', href: '/guide' }] },
      { label: 'Registrations', links: [{ label: 'Register a business', href: '/business/registration' }, { label: 'Investment certificate', href: '/investments/onboarding' }, { label: 'Agency directory', href: '/agencies' }] },
    ],
  },
  {
    title: 'Services',
    intro: 'Find public services for setting up and running a business.',
    groups: [
      { label: 'Business services', links: [{ label: 'Registration & incorporation', href: '/business/registration' }, { label: 'Permits & licences', href: '/services' }, { label: 'Tax & compliance', href: '/services' }] },
      { label: 'Support', links: [{ label: 'Investment facilitation', href: '/investments' }, { label: 'Investor aftercare', href: '/support' }, { label: 'Contact an agency', href: '/agencies' }] },
    ],
  },
  {
    title: 'Invest in Uganda',
    intro: 'Research the market, sectors and licensed projects.',
    groups: [
      { label: 'Opportunities', links: [{ label: 'Priority sectors', href: '/investments' }, { label: 'Licensed projects map', href: '/projects' }, { label: 'Investor analytics', href: '/analytics' }] },
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
      <Image src="/images/oneStopCenter-logo.jpeg" alt="" width={42} height={42} className="h-10 w-10 object-contain" priority />
      <span className="leading-[1.05]">
        <span className="block text-sm font-extrabold tracking-tight text-black">OneStop Centre</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.2em] text-red-600">Uganda Investment Authority</span>
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
          <span>Official investment services · Republic of Uganda</span>
          <div className="flex items-center gap-5">
            <Link href="/events" className="hover:text-red-600 transition-colors">News &amp; events</Link>
            <Link href="/support" className="hover:text-red-600 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <header className="sticky z-50 border-b border-neutral-200 bg-white" style={{ top: 'var(--newsbar-h, 0px)' }}>
        <div className="mx-auto flex h-[76px] max-w-7xl items-stretch justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center pr-2">
            <Brand />
          </div>

          <nav aria-label="Main navigation" className="hidden items-stretch gap-1 lg:flex xl:gap-3">
            {MENUS.map((menu) => {
              const isCurrent = pathname.startsWith(menu.title === 'Invest in Uganda' ? '/investments' : menu.title === 'Services' ? '/services' : menu.title === 'Resources' ? '/downloads' : '/business');
              const expanded = activeMenu === menu.title;
              const menuId = `menu-${menu.title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
              return (
                <div
                  key={menu.title}
                  className="relative flex"
                  onMouseEnter={() => setActiveMenu(menu.title)}
                  onMouseLeave={() => setActiveMenu(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveMenu(null); }}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={menuId}
                    onClick={() => setActiveMenu(menu.title)}
                    onFocus={() => setActiveMenu(menu.title)}
                    className={`inline-flex items-center gap-2 px-6 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 ${expanded || isCurrent ? 'bg-neutral-100 text-red-600' : 'text-neutral-800 hover:bg-neutral-50 hover:text-red-600'}`}
                  >
                    {menu.title}
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
            <Link href="/agencies" className="inline-flex items-center px-6 text-base text-neutral-800 transition-colors hover:bg-neutral-50 hover:text-red-600">Agencies</Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-red-600">
                <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                {user?.name ?? 'My account'}
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-2 py-2 text-sm font-semibold text-neutral-800 hover:text-red-600">Log in</button>
            )}
            <Link href="/investments/onboarding" className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2.5 text-xs font-bold text-yellow-400 transition hover:bg-neutral-800">
              Start here <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center lg:hidden">
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="rounded p-2 text-black hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="max-h-[calc(100vh-6rem)] overflow-y-auto border-t border-neutral-200 bg-white px-4 py-4 shadow-lg lg:hidden">
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 pb-4">
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{group.label}</p>
                          {group.links.map((link) => (
                            <Link key={link.href + link.label} href={link.href} onClick={closeMenus} className="block py-1.5 text-xs font-medium text-neutral-800 hover:text-red-600">
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
              <Link href="/investments/onboarding" onClick={closeMenus} className="mt-2 rounded-md bg-black px-4 py-3 text-center text-sm font-bold text-yellow-400">Start your investment journey</Link>
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
