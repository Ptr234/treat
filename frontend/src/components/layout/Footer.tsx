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

const linkClass =
  'text-sm text-neutral-700 hover:text-red-600 hover:underline decoration-yellow-400 underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-sm';

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t-4 border-yellow-400 bg-white text-neutral-700"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* About */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-lg font-bold text-black">
              <span aria-hidden="true" className="h-1 w-4 bg-red-600" />
              About us
            </h4>
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-sm">
              <Image
                src="/images/oneStopCenter-logo.jpeg"
                alt="OneStopCentre Uganda logo"
                width={44}
                height={44}
                className="rounded-lg object-contain bg-white flex-shrink-0"
              />
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-black group-hover:text-red-600 transition-colors">
                  OneStopCentre
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-400">
                  Uganda
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-600 mb-6">
              Uganda&apos;s OneStop Centre for business registration, investment facilitation, and
              regulatory compliance, connecting investors with public agencies and services.
            </p>
            <ul className="space-y-2.5">
              {CONTACTS.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-sm">
                  <c.icon className="mt-0.5 w-4 h-4 text-yellow-400 flex-shrink-0" aria-hidden="true" />
                  {c.href ? (
                    <a href={c.href} className="text-neutral-600 hover:text-red-600 transition-colors">
                      {c.label}
                    </a>
                  ) : (
                    <span className="text-neutral-600">{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-5 flex items-center gap-2 text-lg font-bold text-black">
                <span aria-hidden="true" className="h-1 w-4 bg-red-600" />
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
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
      <div className="border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-neutral-600 text-xs sm:text-sm text-center md:text-left">
            &copy; 2026 Uganda OneStop Centre. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-neutral-700">
            <Link href="/support" className="hover:text-red-600 transition-colors">
              Contact Us
            </Link>
            <Link href="/guide" className="hover:text-red-600 transition-colors">
              User Guide
            </Link>
            <Link href="/search" className="hover:text-red-600 transition-colors">
              Search
            </Link>
            <Link href="/login" className="hover:text-red-600 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
