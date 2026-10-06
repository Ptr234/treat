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
      { label: 'Projects Map', href: '/projects' },
      { label: 'Investment Incentives', href: '/incentives' },
      { label: 'Investment Process', href: '/investments/process' },
      { label: 'Events Calendar', href: '/events' },
      { label: 'Agency directory', href: '/agencies' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Business Registration', href: '/business/registration' },
      { label: 'Track an Application', href: '/track' },
      { label: 'Investor Aftercare', href: '/support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'User Guide', href: '/guide' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'AI Assistant', href: '/chatbot' },
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

const BOTTOM_LINKS = [
  { label: 'Contact Us', href: '/support' },
  { label: 'User Guide', href: '/guide' },
  { label: 'Search', href: '/search' },
  { label: 'Admin', href: '/login' },
];

const linkClass =
  'text-sm text-neutral-700 hover:text-red-600 hover:underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const headingClass = 'text-xs font-bold uppercase tracking-[0.16em] text-black';

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-white text-neutral-700">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <Image
                src="/images/oneStopCenter-logo.jpeg"
                alt="OneStop Centre Uganda logo"
                width={44}
                height={44}
                className="flex-shrink-0 rounded-lg bg-white object-contain"
              />
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-black transition-colors group-hover:text-red-600">
                  OneStop Centre
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                  Uganda
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">
              Uganda&apos;s OneStop Centre for business registration, investment facilitation, and
              regulatory compliance, connecting investors with public agencies and services.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={`${section.title} links`}>
              <h2 className={headingClass}>{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-neutral-200 pt-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {CONTACTS.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm">
                  <c.icon className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />
                  {c.href ? (
                    <a href={c.href} className="text-neutral-700 transition-colors hover:text-red-600">
                      {c.label}
                    </a>
                  ) : (
                    <span className="text-neutral-700">{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
          <p className="text-center text-xs text-neutral-600 sm:text-sm md:text-left">
            &copy; 2026 Uganda OneStop Centre. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-700 sm:text-sm">
            {BOTTOM_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition-colors hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
