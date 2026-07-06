'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  DocumentTextIcon,
  CalculatorIcon,
  HandRaisedIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  SparklesIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

// ── Homepage background/hero images (built-in defaults) ───────────────
// Used until a Homepage Settings document is created in Sanity.
const DEFAULT_HERO_IMAGES = [
  '/images/Pride.webp',
  '/images/uganda-kampala-city-view.webp',
  '/images/uganda-pearl-africa.jpg',
  '/images/lake-bunyonyi-uganda.jpg',
  '/images/Infrastucture.webp',
];
const DEFAULT_ABOUT_IMAGE = '/images/uganda-flag-city.jpg';
const DEFAULT_CTA_IMAGE = '/images/uganda-business-bg.jpeg';

// ── Priority investment sectors (image-forward showcase) ──────────────
// Built-in defaults, used until Homepage Sector Cards are created in Sanity.
type Sector = { title: string; blurb: string; image: string; link?: string };

const DEFAULT_SECTORS: Sector[] = [
  {
    title: 'Agriculture & Agro-Processing',
    blurb: 'Coffee, tea, dairy and value-added processing across fertile highlands.',
    image: '/images/uganda-pearl-africa.jpg',
  },
  {
    title: 'Tourism & Hospitality',
    blurb: 'The Pearl of Africa — gorillas, the Nile, lakes and national parks.',
    image: '/images/lake-bunyonyi-uganda.jpg',
  },
  {
    title: 'Infrastructure & Real Estate',
    blurb: 'Roads, industrial parks, housing and large-scale urban development.',
    image: '/images/Infrastucture.webp',
  },
  {
    title: 'ICT & Innovation',
    blurb: 'A fast-growing digital economy and a young, tech-ready workforce.',
    image: '/images/uganda-kampala-city-view.webp',
  },
  {
    title: 'Manufacturing & Industry',
    blurb: 'Import substitution and export-ready manufacturing with tax incentives.',
    image: '/images/uganda-background.jpeg',
  },
  {
    title: 'Energy & Minerals',
    blurb: 'Oil & gas, hydropower, renewables and an expanding mining sector.',
    image: '/images/Tourism.webp',
  },
];

// ── Partner government institutions (trust marquee) ────────────────────
const AGENCY_LOGOS = [
  { name: 'Uganda Investment Authority', src: '/images/logos/UIA%20logo.png' },
  { name: 'Uganda Revenue Authority', src: '/images/logos/URA%20logo.png' },
  { name: 'Uganda Registration Services Bureau', src: '/images/logos/URSB%20logo.png' },
  { name: 'Bank of Uganda', src: '/images/logos/BOU.jpeg' },
  { name: 'National Environment Management Authority', src: '/images/logos/NEMA.png' },
  { name: 'National Social Security Fund', src: '/images/logos/NSSF%20logo.png' },
  { name: 'Kampala Capital City Authority', src: '/images/logos/kcca.png' },
  { name: 'Electricity Regulatory Authority', src: '/images/logos/ERA-logo.png' },
  { name: 'Uganda Communications Commission', src: '/images/logos/UCC%20logo.png' },
  { name: 'Capital Markets Authority', src: '/images/logos/CMA%20logo.png' },
  { name: 'Uganda Tourism Board', src: '/images/logos/UTB.png' },
  { name: 'Petroleum Authority of Uganda', src: '/images/logos/PAU.png' },
];

const SERVICES = [
  { icon: RocketLaunchIcon, title: 'Investment Facilitation', description: 'End-to-end facilitation from project conception to implementation, with government support and regulatory guidance.' },
  { icon: DocumentTextIcon, title: 'Business Registration', description: 'Company formation and registration through URSB with streamlined, single-window processing.' },
  { icon: CalculatorIcon, title: 'Tax & Compliance', description: 'Tax registration, URA compliance and ongoing advisory tailored to your sector and incentives.' },
  { icon: ChartBarIcon, title: 'ROI Analysis', description: 'Professional return-on-investment modelling with Uganda-specific market and sector data.' },
  { icon: HandRaisedIcon, title: 'Investment Aftercare', description: 'Ongoing support, aftercare and government liaison for sustainable, long-term growth.' },
  { icon: ShieldCheckIcon, title: 'Regulatory Compliance', description: "Expert guidance through Uganda's regulatory landscape with full compliance assurance." },
];

// ── Three-step investor journey (uses existing routes only) ────────────
const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Explore opportunities',
    description: 'Browse priority sectors, bankable projects and incentives curated by the Uganda Investment Authority.',
    href: '/investments',
    cta: 'Browse investments',
  },
  {
    step: '02',
    title: 'Model your returns',
    description: 'Run Uganda-specific ROI projections with real market data before you commit a single dollar.',
    href: '/tools/roi-calculator',
    cta: 'Calculate returns',
  },
  {
    step: '03',
    title: 'Start your application',
    description: 'Begin a guided onboarding that takes you from intent to licensed investor — all in one window.',
    href: '/investments/onboarding',
    cta: 'Start onboarding',
  },
];

const ADVISOR_TOPICS = [
  { label: 'Bankable Projects', query: 'What are the current bankable investment projects in Uganda?' },
  { label: 'Why Uganda?', query: 'Why should I invest in Uganda? What is the economic overview?' },
  { label: 'Tax Incentives', query: 'What tax incentives are available for investors in Uganda?' },
  { label: 'Business Registration', query: 'How do I register a business in Uganda?' },
];

const DISPLAY_FONT = { fontFamily: "'Playfair Display', Georgia, serif" };

// Small gold kicker used above every section heading.
function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] mb-4 ${
        dark ? 'text-yellow-400' : 'text-yellow-600'
      }`}
    >
      <span className="h-px w-8 bg-gradient-to-r from-yellow-500 to-red-500" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const [liveStats, setLiveStats] = useState({ fdi: 49.5, investments: 9922, satisfaction: 98, sectors: 8 });
  const [sectors, setSectors] = useState<Sector[]>(DEFAULT_SECTORS);

  // Homepage background images (CMS-managed, with built-in fallbacks).
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [aboutImage, setAboutImage] = useState<string>(DEFAULT_ABOUT_IMAGE);
  const [ctaImage, setCtaImage] = useState<string>(DEFAULT_CTA_IMAGE);
  const [heroIndex, setHeroIndex] = useState(0);

  // Pull CMS-managed sector cards + background images from Sanity.
  useEffect(() => {
    let active = true;
    fetch('/api/homepage/sectors')
      .then((r) => r.json())
      .then((json) => {
        if (active && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setSectors(json.data as Sector[]);
        }
      })
      .catch(() => {});
    fetch('/api/homepage/settings')
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        const d = json.data ?? {};
        if (Array.isArray(d.hero) && d.hero.length > 0) setHeroImages(d.hero);
        if (d.about) setAboutImage(d.about);
        if (d.cta) setCtaImage(d.cta);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Auto-advance the hero slideshow.
  useEffect(() => {
    if (heroImages.length <= 1) return;
    setHeroIndex(0);
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 6500);
    return () => clearInterval(t);
  }, [heroImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        fdi: Math.max(49.4, Math.min(49.6, prev.fdi + (Math.random() - 0.5) * 0.01)),
        investments: prev.investments + Math.floor(Math.random() * 2),
        satisfaction: Math.max(97, Math.min(99, prev.satisfaction + (Math.random() - 0.5) * 0.1)),
        sectors: prev.sectors,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openAssistant = (message?: string) => {
    document.dispatchEvent(new CustomEvent('openChatWidget', { detail: message ? { message } : undefined }));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92svh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          {/* Slideshow with slow Ken Burns drift */}
          <AnimatePresence initial={false}>
            <motion.div
              key={heroIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 8, ease: 'linear' },
              }}
            >
              <Image
                src={heroImages[heroIndex] ?? '/images/Pride.webp'}
                alt="Uganda — the Pearl of Africa"
                fill
                priority={heroIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Balanced scrim keeps centered text legible over any slide */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, #FFD700 0%, transparent 32%), radial-gradient(circle at 85% 85%, #CE1126 0%, transparent 30%)' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-44 sm:pb-48">
          <Reveal y={36} className="max-w-2xl mx-auto flex flex-col items-center text-center">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 text-[10px] sm:text-xs font-semibold tracking-[0.12em] uppercase backdrop-blur-sm">
              <CheckBadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
              Uganda Investment Authority · OneStop Centre
            </span>

            <h1 className="mb-5 text-white leading-[1.08]">
              <span className="block text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Invest in the
              </span>
              <span
                className="block text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-300 pb-2"
                style={DISPLAY_FONT}
              >
                Pearl of Africa
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-neutral-200 mb-8 max-w-xl mx-auto leading-relaxed font-light">
              The OneStop Centre brings government-backed investment advisory under one roof.
              Unlock Uganda&apos;s <span className="text-yellow-400 font-semibold">$49.5B+</span> in
              opportunities through a single, streamlined facilitation platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row items-center justify-center gap-3 mb-5">
              <Link
                href="/investments/onboarding"
                prefetch={true}
                className="group inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-yellow-500 text-black font-bold rounded-lg text-sm transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                Start Investment Journey
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
              <button
                onClick={() => openAssistant()}
                className="group inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 text-white font-semibold rounded-lg text-sm border border-white/25 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                Ask the AI Assistant
              </button>
            </div>
            <Link
              href="/tools/roi-calculator"
              prefetch={true}
              className="group inline-flex items-center justify-center text-neutral-300 font-semibold text-xs sm:text-sm transition-colors duration-300 hover:text-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              <CalculatorIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
              Calculate Returns
              <ArrowUpRightIcon className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
            </Link>
          </Reveal>

          {/* Slide progress indicators */}
          {heroImages.length > 1 && (
            <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === heroIndex}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === heroIndex ? 'w-10 bg-yellow-400' : 'w-4 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Floating live-stats card (overlaps hero) ──────────────── */}
      <section className="relative z-20 -mt-28 sm:-mt-32 px-4 sm:px-6 lg:px-8" aria-label="Investment statistics">
        <Reveal className="max-w-6xl mx-auto" y={20}>
          <div className="bg-neutral-950 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400" aria-hidden="true" />
            <div className="px-5 sm:px-10 py-7 sm:py-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { value: `${liveStats.investments.toLocaleString()}+`, label: 'Licensed Projects' },
                  { value: `$${liveStats.fdi.toFixed(1)}B+`, label: 'FDI Facilitated' },
                  { value: `${liveStats.satisfaction.toFixed(0)}%`, label: 'Success Rate' },
                  { value: `${liveStats.sectors}`, label: 'Key Sectors' },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-4xl font-black text-yellow-400 tabular-nums" style={DISPLAY_FONT}>
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-[0.16em]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 pt-5 border-t border-white/10 text-center text-[10px] sm:text-xs text-neutral-500">
                Data: January 1991 — December 2025 · Source: Uganda Investment Authority
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Agency trust marquee ──────────────────────────────────── */}
      <section className="pt-16 sm:pt-20 pb-14 sm:pb-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] sm:text-sm font-bold uppercase tracking-[0.22em] text-yellow-500 mb-10">
            Backed by Uganda&apos;s leading government institutions
          </p>
        </div>
        <div
          className="relative overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}
        >
          <motion.div
            className="flex items-center gap-14 sm:gap-20 w-max px-8"
            animate={prefersReducedMotion ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
          >
            {[...AGENCY_LOGOS, ...AGENCY_LOGOS].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                aria-hidden={i >= AGENCY_LOGOS.length}
                className="relative h-14 sm:h-16 w-28 sm:w-36 flex-shrink-0 bg-white rounded-xl p-2 opacity-90 hover:opacity-100 hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
              >
                <Image src={logo.src} alt={i < AGENCY_LOGOS.length ? logo.name : ''} fill sizes="160px" className="object-contain p-2" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-40 h-40 rounded-3xl bg-yellow-400/15 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src={aboutImage}
                    alt="Uganda Investment Authority — OneStop Centre"
                    width={640}
                    height={460}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
                </div>
                {/* Floating accent badge */}
                <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-black text-white rounded-2xl shadow-2xl px-6 py-5 border border-yellow-500/30">
                  <div className="text-3xl font-black text-yellow-400" style={DISPLAY_FONT}>16+</div>
                  <div className="text-[11px] text-neutral-300 uppercase tracking-[0.14em] font-semibold mt-0.5">Agencies, One Roof</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                <Kicker>Who we are</Kicker>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight" style={DISPLAY_FONT}>
                  One centre. Every agency an investor needs.
                </h2>
                <p className="text-base sm:text-lg text-neutral-600 mb-5 leading-relaxed">
                  The Uganda Investment Authority&apos;s OneStop Centre brings more than sixteen government
                  agencies into a single portal. With government backing and deep market knowledge, we turn
                  investment challenges into sustainable opportunities.
                </p>
                <p className="text-base sm:text-lg text-neutral-600 mb-9 leading-relaxed">
                  Our expert team provides end-to-end support — from first consultation to project
                  implementation — ensuring optimal returns in Uganda&apos;s fastest-growing sectors.
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-7 mb-10">
                  {[
                    { v: '1.25M+', l: 'Jobs Created' },
                    { v: '6.3%', l: 'GDP Growth' },
                    { v: '$61B', l: 'GDP (2024)' },
                    { v: '11', l: 'Industrial Parks' },
                  ].map((s, i) => (
                    <div key={s.l} className={`border-l-2 ${i % 2 === 0 ? 'border-yellow-500' : 'border-red-500'} pl-4`}>
                      <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums" style={DISPLAY_FONT}>{s.v}</div>
                      <div className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/about"
                  className="group inline-flex items-center px-7 py-3.5 bg-black text-white font-semibold rounded-xl transition-all duration-300 hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Learn More
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Priority sectors (bento image grid) ───────────────────── */}
      <section className="py-20 sm:py-28 bg-neutral-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
            <Reveal className="max-w-2xl">
              <Kicker dark>Where to invest</Kicker>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={DISPLAY_FONT}>
                Priority investment sectors
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
                High-growth sectors backed by incentives, infrastructure and a strategic position at the
                heart of East Africa.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="flex-shrink-0">
              <Link
                href="/investments"
                className="group inline-flex items-center px-6 py-3 border border-white/25 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                Explore All Investments
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[15rem] gap-5 sm:gap-6">
            {sectors.map((sector, i) => (
              <Reveal
                key={sector.title}
                delay={i * 0.06}
                className={`h-full ${i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''} ${i === sectors.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <Link
                  href={sector.link || '/investments'}
                  className="group relative block h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                >
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    sizes={i === 0 ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:from-black/95 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <h3 className={`font-bold text-white mb-2 leading-snug ${i === 0 ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl'}`}>
                      {sector.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2 mb-3 max-w-md">
                      {sector.blurb}
                    </p>
                    <span className="inline-flex items-center text-yellow-400 text-xs sm:text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Explore opportunities
                      <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                    </span>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three-step journey ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <Kicker>How it works</Kicker>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight" style={DISPLAY_FONT}>
              From interest to investor in three steps
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              A single window replaces months of agency-to-agency paperwork.
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 opacity-40" aria-hidden="true" />
            {JOURNEY_STEPS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.1} className="h-full">
                <Link
                  href={step.href}
                  className="group relative flex flex-col h-full bg-neutral-50 hover:bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200 hover:border-yellow-400/70 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                >
                  <span
                    className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black text-yellow-400 text-3xl font-black mb-7 shadow-lg group-hover:shadow-yellow-500/20 transition-shadow"
                    style={DISPLAY_FONT}
                  >
                    {step.step}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 flex-1">{step.description}</p>
                  <span className="inline-flex items-center text-sm font-bold text-neutral-900 group-hover:text-yellow-600 transition-colors">
                    {step.cta}
                    <ArrowRightIcon className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Investment Advisor ─────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <Image src="/images/uganda-kampala-city-view.webp" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute -top-24 left-1/3 w-[28rem] h-[28rem] bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div>
                <Kicker dark>Always on</Kicker>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight" style={DISPLAY_FONT}>
                  Your AI investment advisor
                </h2>
                <p className="text-base sm:text-lg text-neutral-300 mb-8 leading-relaxed max-w-xl">
                  Get instant answers about investing in Uganda — business registration, tax incentives,
                  sector opportunities and more, any time of day.
                </p>

                <div className="flex flex-wrap gap-2.5 mb-9">
                  {ADVISOR_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => openAssistant(topic.query)}
                      className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-full text-xs sm:text-sm font-medium hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-300 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => openAssistant()}
                  className="group inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold rounded-xl text-base sm:text-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                >
                  <SparklesIcon className="w-5 h-5 mr-2.5" />
                  Start a Conversation
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Reveal>

            {/* Decorative chat preview */}
            <Reveal delay={0.15}>
              <div aria-hidden="true" className="relative select-none pointer-events-none max-w-md mx-auto lg:mx-0 lg:ml-auto w-full">
                <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.04]">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-500 text-black">
                      <SparklesIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">OneStop Centre Assistant</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Online now
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-yellow-500 text-black text-sm font-medium px-4 py-2.5">
                        What tax incentives are available for investors?
                      </p>
                    </div>
                    <div className="flex justify-start">
                      <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-white/10 text-neutral-200 text-sm px-4 py-2.5 leading-relaxed">
                        Uganda offers a 10-year tax holiday for qualifying exporters, VAT deferment on
                        plant &amp; machinery, and duty-free import of capital goods. Would you like the
                        breakdown for your sector?
                      </p>
                    </div>
                    <div className="flex justify-start">
                      <span className="inline-flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-4 sm:-left-8 flex items-center gap-2 bg-white rounded-2xl shadow-2xl px-4 py-3">
                  <BuildingLibraryIcon className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold text-neutral-900">Backed by official UIA data</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
            <Reveal className="max-w-2xl">
              <Kicker>What we do</Kicker>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight" style={DISPLAY_FONT}>
                Professional investment services
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                Comprehensive facilitation and business support, backed by government expertise and
                regulatory knowledge.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="flex-shrink-0">
              <Link
                href="/services"
                className="group inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-xl transition-all duration-300 hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                View All Services
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.05} className="h-full">
                <div className="group relative bg-white p-7 sm:p-9 rounded-3xl border border-neutral-200 hover:border-yellow-400/70 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full overflow-hidden">
                  <span
                    className="absolute top-6 right-7 text-4xl font-black text-neutral-100 group-hover:text-yellow-100 transition-colors select-none"
                    style={DISPLAY_FONT}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative">
                    <div className="w-14 h-14 bg-yellow-50 group-hover:bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                      <service.icon className="w-7 h-7 text-yellow-600 group-hover:text-black transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{service.description}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-400 to-red-500 group-hover:w-full transition-all duration-500" aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={ctaImage} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/75" />
          <div
            className="absolute inset-0 opacity-[0.1] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #FFD700 0%, transparent 45%), radial-gradient(circle at 90% 100%, #CE1126 0%, transparent 40%)' }}
          />
        </div>
        <Reveal className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 text-[11px] sm:text-sm font-semibold tracking-[0.12em] uppercase backdrop-blur-sm">
            <CheckBadgeIcon className="w-4 h-4" />
            Join {liveStats.investments.toLocaleString()}+ licensed investors
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={DISPLAY_FONT}>
            Ready to invest in Uganda?
          </h2>
          <p className="text-base sm:text-xl text-neutral-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start your journey today with professional guidance and government support — from first
            question to licensed project, all under one roof.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/investments/onboarding"
              className="group inline-flex items-center justify-center px-7 sm:px-9 py-4 bg-yellow-500 text-black font-bold rounded-xl text-base sm:text-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              Start Investment Journey
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => openAssistant()}
              className="inline-flex items-center justify-center px-7 sm:px-9 py-4 bg-white/10 text-white font-semibold rounded-xl text-base sm:text-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              Ask the AI Assistant
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
