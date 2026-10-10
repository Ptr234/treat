'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  Squares2X2Icon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardLabel, postLoginPath } from '@/lib/roles';
import AuthModal from '@/components/auth/AuthModal';

type NavLink = { label: string; href: string; note?: string };
type Menu = { title: string; intro: string; feature: NavLink; groups: { label: string; links: NavLink[] }[] };

const MENUS: Menu[] = [
  {
    title: 'Services',
    intro: 'Registration, licensing, tax and permits from the agencies that regulate business in Uganda.',
    feature: { label: 'Register a business', href: '/business/registration', note: 'Reserve a name and incorporate with URSB' },
    groups: [
      {
        label: 'Start a business',
        links: [
          { label: 'Business registration', href: '/business/registration' },
          { label: 'Licences and permits', href: '/services#starting' },
          { label: 'Track an application', href: '/track' },
        ],
      },
      {
        label: 'Run a business',
        links: [
          { label: 'Compliance and social security', href: '/services#operations' },
          { label: 'Work permits for foreign staff', href: '/services#foreign' },
          { label: 'Government agency directory', href: '/agencies' },
          { label: 'Investor aftercare', href: '/support' },
        ],
      },
    ],
  },
  {
    title: 'Invest',
    intro: 'Published projects, sectors, incentives and the steps from enquiry to operating licence.',
    feature: { label: 'Browse investment projects', href: '/investments', note: 'Filter by sector, value and lead agency' },
    groups: [
      {
        label: 'Opportunities',
        links: [
          { label: 'Investment projects', href: '/investments' },
          { label: 'Licensed projects map', href: '/projects' },
          { label: 'Investment statistics', href: '/analytics' },
        ],
      },
      {
        label: 'Plan an investment',
        links: [
          { label: 'Investment process', href: '/investments/process' },
          { label: 'Tax incentives', href: '/incentives' },
          { label: 'Investor onboarding', href: '/investments/onboarding' },
          { label: 'ROI calculator', href: '/tools/roi-calculator' },
        ],
      },
    ],
  },
  {
    title: 'Guidance',
    intro: 'Guides, forms, calculators and events for investors and business owners.',
    feature: { label: 'How to use this service', href: '/guide', note: 'Eight steps from first visit to facilitation' },
    groups: [
      {
        label: 'Read and download',
        links: [
          { label: 'User guide', href: '/guide' },
          { label: 'Forms and downloads', href: '/downloads' },
          { label: 'Events calendar', href: '/events' },
        ],
      },
      {
        label: 'Tools',
        links: [
          { label: 'All business tools', href: '/tools' },
          { label: 'Tax calculator', href: '/tools/tax-calculator' },
          { label: 'Document checklist', href: '/tools/document-checklist' },
          { label: 'Investment assistant', href: '/chatbot' },
        ],
      },
    ],
  },
];

const DIRECT_LINKS: NavLink[] = [
  { label: 'Agencies', href: '/agencies' },
  { label: 'Projects map', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/support' },
];

const pathOf = (href: string) => href.split('#')[0] ?? href;
const matches = (pathname: string, href: string) => {
  const path = pathOf(href);
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex min-w-0 items-center gap-3 no-underline sm:gap-4" aria-label="OneStop Centre Uganda — home">
      <Image
        src="/images/osc-logo.png"
        alt=""
        width={56}
        height={56}
        priority
        className={`${compact ? 'h-10 w-10' : 'h-12 w-12 sm:h-14 sm:w-14'} shrink-0`}
      />
      <span aria-hidden="true" className="hidden h-12 w-px bg-[#b9b4a9] sm:block" />
      <span className="min-w-0 leading-none">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a0d1c] sm:text-[11px]">The Republic of Uganda</span>
        <span className="mt-1 block font-display text-[22px] font-semibold tracking-tight text-black group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 sm:text-[26px]">
          OneStop Centre
        </span>
        <span className="mt-1 hidden text-[12px] font-medium text-[#5c5850] sm:block">Uganda Investment Authority</span>
      </span>
    </Link>
  );
}

function HeaderSearch({ id, onDone }: { id: string; onDone?: () => void }) {
  const router = useRouter();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q')?.toString().trim() ?? '';
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    onDone?.();
  };
  return (
    <form role="search" onSubmit={submit} className="gov-search">
      <label htmlFor={id} className="sr-only">Search this website</label>
      <input id={id} name="q" type="search" placeholder="Search services, agencies, projects" autoComplete="off" />
      <button type="submit" aria-label="Search">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const closeAll = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
    setAccountMenuOpen(false);
  };

  // Close every panel on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
    setAccountMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    closeAll();
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (!activeMenu && !accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (activeMenu && navRef.current && !navRef.current.contains(target)) setActiveMenu(null);
      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(target)) setAccountMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeMenu, accountMenuOpen]);

  const menuIsCurrent = (menu: Menu) =>
    menu.groups.some((g) => g.links.some((l) => matches(pathname, l.href))) || matches(pathname, menu.feature.href);

  const openMenu = MENUS.find((m) => m.title === activeMenu);

  return (
    <>
      <header id="site-header" className="relative z-40 bg-white">
        {/* Masthead */}
        <div className="gov-container flex items-center justify-between gap-4 py-4 sm:py-5">
          <Brand />

          <div className="hidden w-full max-w-[22rem] flex-col items-end gap-2.5 lg:flex">
            <div className="flex items-center gap-5 text-sm">
              <a href="tel:+256414301000" className="inline-flex items-center gap-1.5 font-semibold text-black no-underline hover:underline">
                <PhoneIcon className="h-4 w-4 text-[#ce1126]" aria-hidden="true" />
                +256 414 301 000
              </a>
              {isAuthenticated && user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    aria-expanded={accountMenuOpen}
                    aria-controls="account-menu"
                    className="inline-flex items-center gap-1.5 font-semibold text-black hover:underline"
                  >
                    <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="max-w-[10rem] truncate">{user.name}</span>
                    <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {accountMenuOpen && (
                    <div id="account-menu" className="absolute right-0 top-full z-50 mt-2 w-60 border border-[#dcd8cf] border-t-4 border-t-black bg-white py-1 shadow-[0_8px_24px_rgb(0_0_0/0.12)]">
                      <Link href={postLoginPath(user.role)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-black no-underline hover:bg-[#f5f3ee] hover:underline">
                        <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
                        {dashboardLabel(user.role)}
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-black no-underline hover:bg-[#f5f3ee] hover:underline">
                        <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                        Your profile
                      </Link>
                      <div className="my-1 border-t border-[#dcd8cf]" />
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-black hover:bg-[#f5f3ee] hover:underline">
                        <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => setShowAuthModal(true)} className="inline-flex items-center gap-1.5 font-semibold text-black underline underline-offset-4 hover:decoration-2">
                  <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                  Sign in
                </button>
              )}
            </div>
            <HeaderSearch id="header-search" />
          </div>

          {/* Compact controls */}
          <div className="flex shrink-0 items-stretch gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => { setSearchOpen((v) => !v); setMobileOpen(false); }}
              aria-expanded={searchOpen}
              aria-controls="mobile-search"
              aria-label={searchOpen ? 'Close search' : 'Search this website'}
              className="grid h-11 w-11 place-items-center border-2 border-black text-black hover:bg-[#f5f3ee]"
            >
              {searchOpen ? <XMarkIcon className="h-5 w-5" aria-hidden="true" /> : <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => { setMobileOpen((v) => !v); setSearchOpen(false); }}
              aria-expanded={mobileOpen}
              aria-controls="mobile-site-navigation"
              className={`inline-flex h-11 items-center gap-2 border-2 border-black px-3 text-sm font-bold ${mobileOpen ? 'bg-black text-white' : 'text-black hover:bg-[#f5f3ee]'}`}
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" aria-hidden="true" /> : <Bars3Icon className="h-5 w-5" aria-hidden="true" />}
              Menu
            </button>
          </div>
        </div>

        {searchOpen && (
          <div id="mobile-search" className="border-t border-[#dcd8cf] bg-[#f5f3ee] lg:hidden">
            <div className="gov-container py-4">
              <HeaderSearch id="mobile-header-search" onDone={closeAll} />
            </div>
          </div>
        )}

        <div className="gov-stripe" aria-hidden="true" />

        {/* Primary navigation bar */}
        <div ref={navRef} className="relative bg-black text-white">
          <nav aria-label="Main" className="gov-container hidden lg:block">
            <ul className="flex items-stretch">
              <li>
                <Link
                  href="/"
                  aria-current={pathname === '/' ? 'page' : undefined}
                  className={`flex h-14 items-center border-b-4 px-4 text-[15px] font-bold no-underline hover:bg-white/10 ${pathname === '/' ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-white'}`}
                >
                  Home
                </Link>
              </li>
              {MENUS.map((menu) => {
                const open = activeMenu === menu.title;
                const current = menuIsCurrent(menu);
                return (
                  <li key={menu.title}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls="main-mega-menu"
                      onClick={() => setActiveMenu(open ? null : menu.title)}
                      className={`flex h-14 items-center gap-1.5 border-b-4 px-4 text-[15px] font-bold ${open ? 'border-[#ffd700] bg-white text-black' : current ? 'border-[#ffd700] text-[#ffd700] hover:bg-white/10' : 'border-transparent text-white hover:bg-white/10'}`}
                    >
                      {menu.title}
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
              {DIRECT_LINKS.map((link) => {
                const current = matches(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? 'page' : undefined}
                      className={`flex h-14 items-center border-b-4 px-4 text-[15px] font-bold no-underline hover:bg-white/10 ${current ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-white'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="ml-auto">
                <Link href="/track" className="flex h-14 items-center gap-2 px-4 text-[15px] font-bold text-white underline decoration-[#ffd700] decoration-2 underline-offset-4 hover:text-[#ffd700]">
                  Track an application
                </Link>
              </li>
            </ul>
          </nav>

          {openMenu && (
            <div id="main-mega-menu" className="absolute inset-x-0 top-full z-50 hidden border-b-4 border-black bg-white text-black shadow-[0_18px_40px_rgb(0_0_0/0.18)] lg:block">
              <div className="gov-container grid grid-cols-[1.1fr_1fr_1fr] gap-10 py-8">
                <div className="border-r border-[#dcd8cf] pr-10">
                  <p className="gov-kicker">{openMenu.title}</p>
                  <p className="mt-3 text-[15px] leading-6 text-[#3b3934]">{openMenu.intro}</p>
                  <Link href={openMenu.feature.href} className="mt-5 block border-l-[6px] border-[#ffd700] bg-[#f5f3ee] p-4 no-underline hover:bg-[#ebe8e1]">
                    <span className="gov-arrow-link">{openMenu.feature.label}</span>
                    {openMenu.feature.note && <span className="mt-1 block text-sm text-[#5c5850]">{openMenu.feature.note}</span>}
                  </Link>
                </div>
                {openMenu.groups.map((group) => (
                  <div key={group.label}>
                    <h2 className="border-b-2 border-black pb-2 text-sm font-bold uppercase tracking-[0.1em]">{group.label}</h2>
                    <ul className="mt-2">
                      {group.links.map((link) => (
                        <li key={link.href + link.label} className="border-b border-[#dcd8cf]">
                          <Link
                            href={link.href}
                            aria-current={pathname === pathOf(link.href) ? 'page' : undefined}
                            className="block py-2.5 text-[15px] font-semibold text-black underline decoration-1 underline-offset-4 hover:text-[#9a0d1c] hover:decoration-[3px]"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav id="mobile-site-navigation" aria-label="Main" className="border-b-4 border-black bg-white lg:hidden">
            <div className="gov-container py-2">
              <ul>
                <li className="border-b border-[#dcd8cf]">
                  <Link href="/" className="block py-3.5 text-base font-bold text-black no-underline">Home</Link>
                </li>
                {MENUS.map((menu) => {
                  const open = activeMenu === menu.title;
                  const sectionId = `mobile-${menu.title.toLowerCase()}`;
                  return (
                    <li key={menu.title} className="border-b border-[#dcd8cf]">
                      <button
                        type="button"
                        onClick={() => setActiveMenu(open ? null : menu.title)}
                        aria-expanded={open}
                        aria-controls={sectionId}
                        className="flex w-full items-center justify-between py-3.5 text-left text-base font-bold text-black"
                      >
                        {menu.title}
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                      {open && (
                        <div id={sectionId} className="mb-4 border-l-[6px] border-[#ffd700] bg-[#f5f3ee] px-4 py-3">
                          {menu.groups.map((group) => (
                            <div key={group.label} className="mb-3 last:mb-0">
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a0d1c]">{group.label}</p>
                              <ul className="mt-1">
                                {group.links.map((link) => (
                                  <li key={link.href + link.label}>
                                    <Link href={link.href} className="block py-2 text-[15px] font-semibold text-black underline underline-offset-4">
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
                {[...DIRECT_LINKS, { label: 'Track an application', href: '/track' }].map((link) => (
                  <li key={link.href} className="border-b border-[#dcd8cf]">
                    <Link href={link.href} aria-current={matches(pathname, link.href) ? 'page' : undefined} className="block py-3.5 text-base font-bold text-black no-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="py-4">
                {isAuthenticated && user ? (
                  <div className="grid gap-1">
                    <p className="text-sm text-[#5c5850]">Signed in as <strong className="text-black">{user.name}</strong></p>
                    <Link href={postLoginPath(user.role)} className="gov-btn mt-2">
                      <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                      {dashboardLabel(user.role)}
                    </Link>
                    <div className="mt-3 flex gap-5 text-sm">
                      <Link href="/profile" className="gov-link">Your profile</Link>
                      <button type="button" onClick={handleLogout} className="gov-link">Sign out</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => { closeAll(); setShowAuthModal(true); }} className="gov-btn">Sign in</button>
                    <a href="tel:+256414301000" className="gov-btn gov-btn--secondary">
                      <PhoneIcon className="h-5 w-5" aria-hidden="true" />
                      +256 414 301 000
                    </a>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="user" />
    </>
  );
}
