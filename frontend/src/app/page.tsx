'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  DocumentTextIcon,
  CalculatorIcon,
  HandRaisedIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

// ── Homepage Data ───────────────────────────────────────────────────────
const DEFAULT_HERO_IMAGES = [
  '/images/Pride.webp',
  '/images/uganda-kampala-city-view.webp',
  '/images/uganda-pearl-africa.jpg',
  '/images/lake-bunyonyi-uganda.jpg',
  '/images/Infrastucture.webp',
];

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
];

const SERVICES = [
  {
    icon: RocketLaunchIcon,
    title: 'Investment Facilitation',
    description: 'End-to-end facilitation from project conception to implementation.'
  },
  {
    icon: DocumentTextIcon,
    title: 'Business Registration',
    description: 'Company formation through URSB with streamlined processing.'
  },
  {
    icon: CalculatorIcon,
    title: 'Tax & Compliance',
    description: 'Tax registration and URA compliance with expert advisory.'
  },
  {
    icon: ChartBarIcon,
    title: 'ROI Analysis',
    description: 'Professional ROI modelling with Uganda-specific market data.'
  },
  {
    icon: HandRaisedIcon,
    title: 'Investment Aftercare',
    description: 'Ongoing support and government liaison for sustainable growth.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Regulatory Compliance',
    description: 'Expert guidance through Uganda\'s regulatory landscape.'
  },
];

const AGENCY_LOGOS = [
  { name: 'Uganda Investment Authority', src: '/images/logos/UIA%20logo.png' },
  { name: 'Uganda Revenue Authority', src: '/images/logos/URA%20logo.png' },
  { name: 'Uganda Registration Services Bureau', src: '/images/logos/URSB%20logo.png' },
  { name: 'Bank of Uganda', src: '/images/logos/BOU.jpeg' },
  { name: 'National Environment Management Authority', src: '/images/logos/NEMA.png' },
  { name: 'National Social Security Fund', src: '/images/logos/NSSF%20logo.png' },
];

// ────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [liveStats, setLiveStats] = useState({
    fdi: 49.5,
    investments: 9922,
    satisfaction: 98,
    sectors: 8
  });

  // Hero carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % DEFAULT_HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="w-full bg-neutral-50">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION - Rotating carousel with Uganda flag overlay */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen max-h-600px md:max-h-700px bg-black overflow-hidden">
        {/* Hero Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={DEFAULT_HERO_IMAGES[currentHeroIndex]}
              alt="Investment opportunity"
              fill
              priority={currentHeroIndex === 0}
              className="object-cover w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Hero Content - Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Invest in Uganda's Future
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 drop-shadow-md">
              Your OneStop Centre for business registration, investment facilitation, and regulatory compliance
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-900 text-white px-8 py-4 rounded-lg font-bold
                               text-lg hover:bg-primary-800 transition-all duration-200
                               shadow-lg hover:shadow-xl hover:scale-105">
                Get Started
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg
                               font-bold text-lg border-2 border-white hover:bg-white/30
                               transition-all duration-200">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {DEFAULT_HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHeroIndex
                  ? 'bg-secondary-500 w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STATISTICS DASHBOARD - Key metrics with gold accents */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'FDI Invested', value: `$${liveStats.fdi}B+`, icon: '💰' },
              { label: 'Active Investments', value: `${liveStats.investments}+`, icon: '📊' },
              { label: 'Investor Satisfaction', value: `${liveStats.satisfaction}%`, icon: '⭐' },
              { label: 'Growth Sectors', value: `${liveStats.sectors}+`, icon: '🚀' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 rounded-lg border-l-4 border-secondary-500
                           bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-secondary-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-900 font-semibold text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* INVESTMENT OPPORTUNITIES - 4-column sector grid */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Growth Sectors
            </h2>
            <p className="text-lg text-primary-700 max-w-2xl mx-auto">
              Explore Uganda's most dynamic and promising investment opportunities across key economic sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEFAULT_SECTORS.map((sector, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-medium
                           transition-all duration-300 group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-secondary-500
                                transition-colors">
                    {sector.title}
                  </h3>
                  <p className="text-primary-700 text-sm mb-4">
                    {sector.blurb}
                  </p>
                  <a
                    href={sector.link || '#'}
                    className="text-secondary-500 font-bold text-sm hover:text-secondary-600
                             flex items-center gap-2 transition-colors"
                  >
                    Explore Sector
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Browse All CTA */}
          <div className="text-center mt-12">
            <Link
              href="/investments"
              className="inline-block bg-primary-900 text-white px-8 py-4 rounded-lg font-bold
                       hover:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View All Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SERVICES - 6 core services with icons */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-primary-700 max-w-2xl mx-auto">
              Comprehensive support from investment planning through ongoing aftercare and government liaison
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-lg border-t-4 border-secondary-500 bg-neutral-50
                           hover:shadow-lg transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center
                                mb-6 group-hover:bg-secondary-500 transition-colors">
                    <Icon className="w-8 h-8 text-primary-900" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-primary-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-primary-700 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TRUST PARTNERS - Government institutions logo strip */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-neutral-50 border-t-2 border-secondary-500">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-center text-sm font-bold text-primary-900 uppercase tracking-wider mb-8">
            Trusted by Uganda's Leading Institutions
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {AGENCY_LOGOS.slice(0, 6).map((logo, idx) => (
              <div
                key={idx}
                className="h-16 relative flex items-center justify-center grayscale hover:grayscale-0
                           transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  height={64}
                  width={120}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CTA SECTION - Strong call-to-action with gold accent */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-primary-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Invest in Uganda?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Start your investment journey with Uganda's OneStop Centre. We handle the paperwork, you handle the growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary-500 text-primary-900 px-8 py-4 rounded-lg font-bold
                               text-lg hover:bg-secondary-600 transition-all duration-200
                               shadow-lg hover:shadow-xl">
                Start Your Application
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold
                               text-lg hover:bg-white/10 transition-all duration-200">
                Schedule a Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FAQ PREVIEW - Quick answers */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How long does business registration take?',
                a: 'Standard registration through URSB takes 2-3 business days with our facilitation support.'
              },
              {
                q: 'What are the minimum investment requirements?',
                a: 'Minimum investment varies by sector. Contact us for sector-specific requirements and incentives.'
              },
              {
                q: 'Can I get tax incentives on my investment?',
                a: 'Yes. Uganda offers various incentives for qualifying investments. Our team will identify your eligibility.'
              },
              {
                q: 'How long does the investment license process take?',
                a: 'With our facilitation, most licenses are processed within 2-4 weeks depending on sector complexity.'
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group border border-neutral-300 rounded-lg p-6 cursor-pointer
                           hover:border-secondary-500 hover:bg-yellow-50 transition-all"
              >
                <summary className="flex items-center justify-between font-bold text-primary-900
                                   text-lg group-open:text-secondary-500 transition-colors">
                  {item.q}
                  <span className="transform group-open:rotate-180 transition-transform">
                    <ArrowRightIcon className="w-5 h-5" />
                  </span>
                </summary>
                <p className="mt-4 text-primary-700 text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/support"
              className="text-secondary-500 font-bold hover:text-secondary-600 flex items-center
                       justify-center gap-2 transition-colors"
            >
              View All FAQ
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* NEWSLETTER - Signup form */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-primary-900 mb-4">
            Stay Updated
          </h3>
          <p className="text-primary-700 mb-8">
            Subscribe to our newsletter for the latest investment opportunities and regulatory updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
              required
            />
            <button
              type="submit"
              className="bg-primary-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-800
                       transition-all duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
