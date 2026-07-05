'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Business Registration', href: '/services/registration' },
      { label: 'Investment Facilitation', href: '/services/facilitation' },
      { label: 'Tax & Compliance', href: '/services/tax' },
      { label: 'Aftercare Support', href: '/services/aftercare' },
    ],
  },
  {
    label: 'Invest',
    href: '/investments',
    children: [
      { label: 'Investment Opportunities', href: '/investments' },
      { label: 'Why Uganda', href: '/about/why-uganda' },
      { label: 'Success Stories', href: '/projects' },
      { label: 'Market Data', href: '/analytics' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-secondary-500 shadow-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="text-2xl font-black bg-gradient-to-r from-primary-900 to-secondary-500
                          bg-clip-text text-transparent">
              TREAT
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="text-primary-900 font-semibold text-sm hover:text-secondary-500
                           transition-colors duration-200 flex items-center gap-1 py-2"
                >
                  {item.label}
                  {item.children && <ChevronDownIcon className="w-4 h-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.children && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={activeDropdown === item.label ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100
                             group-hover:visible transition-all duration-200"
                  >
                    <div className="bg-white rounded-lg shadow-lg border-t-4 border-secondary-500 py-2 min-w-64">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-6 py-3 text-primary-900 hover:bg-yellow-50
                                   hover:text-secondary-500 transition-colors text-sm font-medium"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/business/new"
            className="hidden md:inline-block bg-primary-900 text-white px-6 py-2 rounded-lg
                     font-bold text-sm hover:bg-primary-800 transition-colors duration-200
                     shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6 text-primary-900" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-primary-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-neutral-50 border-t border-neutral-200"
            >
              <div className="px-6 py-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => !item.children && setIsOpen(false)}
                      className="block py-3 text-primary-900 font-semibold hover:text-secondary-500
                               transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 space-y-2 mt-2 border-l-2 border-secondary-500 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className="block py-2 text-primary-700 hover:text-secondary-500
                                     transition-colors text-xs font-medium"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link
                  href="/business/new"
                  onClick={() => setIsOpen(false)}
                  className="block mt-6 bg-primary-900 text-white px-4 py-3 rounded-lg
                           font-bold text-sm hover:bg-primary-800 transition-colors text-center"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
