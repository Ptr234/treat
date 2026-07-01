'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import {
  ArrowRightIcon,
  DocumentTextIcon,
  CalculatorIcon,
  HandRaisedIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
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

// ── Partner government institutions (trust strip) ─────────────────────
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

export default function HomePage() {
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
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5500);
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
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          {/* Sliding hero slideshow */}
          <AnimatePresence initial={false}>
            <motion.div
              key={heroIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.06, x: -40 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #FFD700 0%, transparent 30%), radial-gradient(circle at 80% 80%, #CE1126 0%, transparent 30%)' }}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center text-white max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <Reveal className="flex flex-col items-center w-full" y={36}>
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 text-xs sm:text-sm font-medium tracking-wide uppercase backdrop-blur-sm">
            <CheckBadgeIcon className="w-4 h-4" />
            Uganda Investment Authority · OneStop Centre
          </span>

          <h1 className="mb-5 sm:mb-7 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <span className="block text-white text-lg xs:text-xl sm:text-3xl md:text-5xl lg:text-6xl font-medium tracking-wide uppercase mb-2 sm:mb-3" style={{ letterSpacing: '0.15em' }}>
              Uganda Investment
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-300 text-[2rem] xs:text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tight drop-shadow-lg">
              Excellence Hub
            </span>
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-200 mb-7 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light tracking-wide" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Government-backed investment advisory under one roof. Unlock Uganda&apos;s{' '}
            <span className="text-yellow-400 font-semibold">$49.5B+</span> in opportunities through a single, streamlined facilitation platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:gap-4 items-center w-full">
            <div className="flex flex-col xs:flex-row gap-3 w-full xs:w-auto justify-center">
              <button
                onClick={() => openAssistant()}
                className="group inline-flex items-center justify-center px-4 xs:px-5 sm:px-8 py-3 sm:py-4 bg-yellow-500 text-black font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20 text-sm xs:text-base sm:text-lg"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                Ask the AI Assistant
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
              <Link
                href="/investments/onboarding"
                className="group inline-flex items-center justify-center px-4 xs:px-5 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-lg transition-all duration-300 hover:bg-neutral-100 hover:shadow-xl text-sm xs:text-base sm:text-lg"
                prefetch={true}
              >
                Start Investment Journey
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>
            <Link
              href="/tools/roi-calculator"
              className="group inline-flex items-center justify-center px-4 py-2 xs:px-5 xs:py-3 sm:px-8 sm:py-4 border border-white/60 xs:border-2 xs:border-white text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl text-xs xs:text-sm sm:text-lg"
              prefetch={true}
            >
              Calculate Returns
              <CalculatorIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform flex-shrink-0" />
            </Link>
          </div>
          </Reveal>

          {/* Slideshow indicators */}
          {heroImages.length > 1 && (
            <div className="flex items-center gap-2 mt-10">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === heroIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats banner */}
        <div className="relative z-10">
          <div className="bg-white/95 backdrop-blur-sm border-t border-neutral-200">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 py-3 xs:py-4 sm:py-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-8 text-center">
                {[
                  { value: `${liveStats.investments.toLocaleString()}+`, label: 'Licensed Projects' },
                  { value: `${liveStats.satisfaction.toFixed(0)}%`, label: 'Success Rate' },
                  { value: `$${liveStats.fdi.toFixed(1)}B+`, label: 'FDI Facilitated' },
                  { value: `${liveStats.sectors}`, label: 'Key Sectors' },
                ].map((s) => (
                  <div key={s.label} className="space-y-0.5 sm:space-y-2">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-neutral-900">{s.value}</div>
                    <div className="text-[11px] sm:text-sm text-neutral-600 font-medium uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-2 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-neutral-500">
                  Data: January 1991 — December 2025 | Source: Uganda Investment Authority
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Agency trust strip ────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-8">
            Backed by Uganda&apos;s leading government institutions
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-8 items-center">
            {AGENCY_LOGOS.map((logo) => (
              <div key={logo.name} className="relative h-12 sm:h-14 opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <Reveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={aboutImage}
                  alt="Uganda Investment Authority — OneStop Centre"
                  width={640}
                  height={460}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
              </div>
              {/* Floating accent badge */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-black text-white rounded-xl shadow-xl px-5 py-4 border border-yellow-500/30">
                <div className="text-2xl font-black text-yellow-400">16+</div>
                <div className="text-xs text-neutral-300 uppercase tracking-wide">Agencies, One Roof</div>
              </div>
            </div>
            </Reveal>

            <Reveal delay={0.1}>
            <div>
              <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">Who we are</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                About Uganda Investment Authority
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Uganda&apos;s premier investment facilitation centre, bringing together more than sixteen government agencies in a single portal. With government backing and deep market knowledge, we turn investment challenges into sustainable opportunities.
              </p>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Our expert team provides end-to-end support — from first consultation to project implementation — ensuring optimal returns in Uganda&apos;s fastest-growing sectors.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { v: '1.25M+', l: 'Jobs Created', c: 'border-yellow-500' },
                  { v: '6.3%', l: 'GDP Growth', c: 'border-red-500' },
                  { v: '$61B', l: 'GDP (2024)', c: 'border-yellow-500' },
                  { v: '11', l: 'Industrial Parks', c: 'border-red-500' },
                ].map((s) => (
                  <div key={s.l} className={`border-l-4 ${s.c} pl-4`}>
                    <div className="text-2xl font-bold text-neutral-900">{s.v}</div>
                    <div className="text-sm text-neutral-600">{s.l}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg transition-colors hover:bg-neutral-800"
              >
                Learn More
                <ArrowRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Priority sectors (image cards) ────────────────────────── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">Where to invest</span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Priority Investment Sectors</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              High-growth sectors backed by incentives, infrastructure and a strategic position at the heart of East Africa.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector, i) => (
              <Reveal key={sector.title} delay={i * 0.07} className="h-full">
              <Link
                href={sector.link || '/investments'}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 h-72 block"
              >
                <Image
                  src={sector.image}
                  alt={sector.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{sector.title}</h3>
                  <p className="text-sm text-neutral-200 leading-relaxed mb-3 line-clamp-2">{sector.blurb}</p>
                  <span className="inline-flex items-center text-yellow-400 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    Explore opportunities
                    <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                  </span>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/investments"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg transition-colors hover:bg-neutral-800"
            >
              Explore All Investments
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Investment Advisor ─────────────────────────────────── */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/uganda-kampala-city-view.webp" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your AI Investment Advisor</h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Get instant answers about investing in Uganda — business registration, tax incentives, sector opportunities and more.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: 'Bankable Projects', query: 'What are the current bankable investment projects in Uganda?' },
              { label: 'Why Uganda?', query: 'Why should I invest in Uganda? What is the economic overview?' },
              { label: 'Tax Incentives', query: 'What tax incentives are available for investors in Uganda?' },
              { label: 'Business Registration', query: 'How do I register a business in Uganda?' },
            ].map((topic) => (
              <button
                key={topic.label}
                onClick={() => openAssistant(topic.query)}
                className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-full text-sm font-medium hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-300 transition-all duration-300"
              >
                {topic.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openAssistant()}
            className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20 text-lg"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            Start a Conversation
          </button>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-yellow-600 font-semibold text-sm uppercase tracking-[0.18em] mb-3">What we do</span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Professional Investment Services</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
              Comprehensive facilitation and business support, backed by government expertise and regulatory knowledge.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg transition-colors hover:bg-neutral-800"
            >
              View All Services
              <ArrowRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.06} className="h-full">
              <div
                className="group bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg hover:border-yellow-400/60 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-yellow-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center mb-6 transition-colors">
                  <service.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{service.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{service.description}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={ctaImage} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/80" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #FFD700 0%, transparent 45%), radial-gradient(circle at 90% 100%, #CE1126 0%, transparent 40%)' }}
          />
        </div>
        <Reveal className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to Invest in Uganda?</h2>
          <p className="text-base sm:text-xl text-neutral-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join {liveStats.investments.toLocaleString()}+ successful investors who have discovered Uganda&apos;s potential. Start your journey today with professional guidance and government support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => openAssistant()}
              className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-yellow-500 text-black font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl text-base sm:text-lg"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              Ask the AI Assistant
            </button>
            <Link
              href="/investments/onboarding"
              className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-4 bg-white text-neutral-900 font-semibold rounded-lg transition-colors hover:bg-neutral-100 text-base sm:text-lg"
            >
              Start Investment Journey
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
