'use client';

import React from 'react';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
} from '@heroicons/react/24/outline';

const FOOTER_SECTIONS = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Investments', href: '/investments' },
      { label: 'Services', href: '/services' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Business Registration', href: '/services/registration' },
      { label: 'Investment Facilitation', href: '/services/facilitation' },
      { label: 'Tax & Compliance', href: '/services/tax' },
      { label: 'Investor Aftercare', href: '/services/aftercare' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Success Stories', href: '/projects' },
      { label: 'Market Data', href: '/analytics' },
      { label: 'Market Guide', href: '/guide' },
      { label: 'FAQ', href: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary-500 to-yellow-400
                          bg-clip-text text-transparent mb-4">
              TREAT
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed mb-6">
              Uganda's OneStop Centre for business registration, investment facilitation, and regulatory compliance.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {[
                { href: '#', label: 'Facebook' },
                { href: '#', label: 'Twitter' },
                { href: '#', label: 'LinkedIn' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-secondary-500/20 hover:bg-secondary-500 text-secondary-500
                           hover:text-primary-900 rounded-lg flex items-center justify-center
                           transition-all duration-200"
                >
                  🔗
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-lg mb-4 text-secondary-500">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-300 hover:text-secondary-500 transition-colors
                               text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-neutral-700">
          <div className="flex items-start gap-4">
            <EnvelopeIcon className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm mb-2">Email</h4>
              <a
                href="mailto:info@treat.ug"
                className="text-neutral-300 hover:text-secondary-500 transition-colors text-sm"
              >
                info@treat.ug
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <PhoneIcon className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm mb-2">Phone</h4>
              <a
                href="tel:+256414301000"
                className="text-neutral-300 hover:text-secondary-500 transition-colors text-sm"
              >
                +256 414 301 000
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPinIcon className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm mb-2">Location</h4>
              <p className="text-neutral-300 text-sm">
                Plot 1, Baskerville Ave<br />
                Kololo, Kampala, Uganda
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-secondary-500/10 to-transparent border-l-4 border-secondary-500
                       p-8 rounded-lg mt-12">
          <h4 className="font-bold text-lg mb-3">Stay Updated</h4>
          <p className="text-neutral-300 text-sm mb-4">
            Subscribe to our newsletter for the latest investment opportunities and regulatory updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-primary-800 text-white rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-secondary-500 focus:border-transparent
                       placeholder-neutral-400 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-secondary-500 text-primary-900 px-6 py-3 rounded-lg font-bold
                       hover:bg-secondary-600 transition-all duration-200 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-700 bg-primary-950 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-400 text-sm text-center md:text-left">
            &copy; 2026 Uganda OneStop Centre (TREAT). All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-400">
            <Link href="/privacy" className="hover:text-secondary-500 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-secondary-500 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-secondary-500 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
