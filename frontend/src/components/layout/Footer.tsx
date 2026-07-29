'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const FOOTER_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Investments', href: '/investments' },
      { label: 'Projects Map', href: '/projects' },
      { label: 'Events Calendar', href: '/events' },
      { label: 'OSC Hub', href: '/agencies' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Business Registration', href: '/business/registration' },
      { label: 'Investment Facilitation', href: '/investments/onboarding' },
      { label: 'Tools & Calculators', href: '/tools' },
      { label: 'Investor Aftercare', href: '/support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Market Data', href: '/analytics' },
      { label: 'User Guide', href: '/guide' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'AI Assistant', href: '/chatbot' },
      { label: 'Support Tickets', href: '/tickets' },
    ],
  },
];

const CONTACTS = [
  {
    icon: EnvelopeIcon,
    label: 'info@ugandainvest.go.ug',
    href: 'mailto:info@ugandainvest.go.ug',
  },
  {
    icon: PhoneIcon,
    label: '+256 414 301 000',
    href: 'tel:+256414301000',
  },
  {
    icon: MapPinIcon,
    label: 'Plot 1, Baskerville Ave, Kololo, Kampala',
    href: undefined,
  },
];

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="bg-black text-white border-t-2 border-yellow-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <Image
                src="/images/oneStopCenter-logo.jpeg"
                alt="OneStopCentre Uganda logo"
                width={44}
                height={44}
                className="rounded-lg object-contain bg-white flex-shrink-0"
              />
              <span className="leading-tight">
                <span className="block text-lg font-black text-white group-hover:text-yellow-400 transition-colors">
                  OneStopCentre
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-500">
                  Uganda
                </span>
              </span>
            </Link>
            <p className="text-neutral-300 text-sm leading-relaxed mb-6">
              Uganda&apos;s OneStop Centre for business registration, investment facilitation, and
              regulatory compliance — 16+ government agencies under one roof.
            </p>
            <ul className="space-y-2.5">
              {CONTACTS.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <c.icon className="w-4 h-4 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                  {c.href ? (
                    <a href={c.href} className="text-neutral-300 hover:text-yellow-400 transition-colors">
                      {c.label}
                    </a>
                  ) : (
                    <span className="text-neutral-300">{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-500 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-white hover:underline decoration-yellow-500 underline-offset-4 transition-colors"
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

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-neutral-400 text-xs sm:text-sm text-center md:text-left">
            &copy; 2026 Uganda OneStop Centre. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-neutral-400">
            <Link href="/support" className="hover:text-yellow-400 transition-colors">
              Contact Us
            </Link>
            <Link href="/guide" className="hover:text-yellow-400 transition-colors">
              User Guide
            </Link>
            <Link href="/search" className="hover:text-yellow-400 transition-colors">
              Search
            </Link>
            <Link href="/login" className="hover:text-yellow-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
