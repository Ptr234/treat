'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AuthModal from '@/components/auth/AuthModal';

interface FooterLink {
  name: string;
  href: string;
}

interface FooterLinks {
  [key: string]: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const footerLinks: FooterLinks = {
    Services: [
      { name: 'All Services', href: '/services' },
      { name: 'Business Registration', href: '/business/registration' },
      { name: 'Tax Calculator', href: '/tools/tax-calculator' },
      { name: 'Document Checklist', href: '/tools/document-checklist' }
    ],
    Investment: [
      { name: 'Investment Opportunities', href: '/investments' },
      { name: 'Investment Onboarding', href: '/investments/onboarding' },
      { name: 'ROI Calculator', href: '/tools/roi-calculator' },
      { name: 'Agencies Directory', href: '/agencies' }
    ],
    'Digital Tools': [
      { name: 'AI Investor Assistant', href: '/chatbot' },
      { name: 'Events Calendar', href: '/events' },
      { name: 'Projects Map', href: '/projects' },
      { name: 'Issue Tracking', href: '/tickets' }
    ],
    Resources: [
      { name: 'How to Use the Portal', href: '/guide' },
      { name: 'Downloads', href: '/downloads' },
      { name: 'Tools & Calculators', href: '/tools' },
      { name: 'Invoice Generator', href: '/tools/invoice-generator' },
      { name: 'Support Center', href: '/support' }
    ],
    Contact: [
      { name: 'Ask the AI Assistant', href: '/chatbot' },
      { name: 'Submit an Inquiry', href: '/support' },
      { name: 'About Us', href: '/about' }
    ]
  };

  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget'));
  };

  return (
    <>
      <footer role="contentinfo" aria-label="Site footer" className="bg-black text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-yellow-500 to-red-500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8">
            <div className="lg:col-span-2">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center mr-3">
                    <Image
                      src="/images/oneStopCenter-logo.jpeg"
                      alt="OneStopCentre Uganda Official Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">OneStopCentre Uganda</h3>
                    <p className="text-sm text-yellow-400 font-semibold">InvestUganda simplified</p>
                  </div>
                </div>
                <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
                  Your gateway to streamlined government services, business registration,
                  and investment opportunities in Uganda. Professional, reliable, and efficient.
                </p>
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-yellow-400">{category}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-neutral-300 hover:text-white transition-colors text-sm hover:text-yellow-300 block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Need Help — AI Assistant CTA */}
          <div className="mt-12 pt-8 border-t border-neutral-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-lg font-semibold text-white mb-1">Need Help?</h4>
                <p className="text-sm text-neutral-400">Our AI Assistant can answer your investment questions instantly.</p>
              </div>
              <button
                onClick={openAssistant}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/20"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Ask the AI Assistant
              </button>
            </div>
          </div>

          {/* Copyright & Policy */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 mt-6 border-t border-neutral-800">
            <p className="text-neutral-400 text-sm">
              &copy; {currentYear} OneStop Centre Uganda. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/about" className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/about" className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/support" className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors">
                Accessibility
              </Link>
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Auth Modal — email/password + Google */}
      <AuthModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} mode="admin" />
    </>
  );
};

export default Footer;
