'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

interface FooterLink {
  name: string;
  href: string;
  type: 'route' | 'external';
}

interface FooterLinks {
  [key: string]: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const footerLinks: FooterLinks = {
    Services: [
      { name: 'All Services', href: '/services', type: 'route' },
      { name: 'Business Registration', href: '/business/registration', type: 'route' },
      { name: 'Tax Calculator', href: '/tools/tax-calculator', type: 'route' },
      { name: 'Document Checklist', href: '/tools/document-checklist', type: 'route' }
    ],
    Investment: [
      { name: 'Investment Opportunities', href: '/investments', type: 'route' },
      { name: 'Investment Onboarding', href: '/investment-onboarding', type: 'route' },
      { name: 'ROI Calculator', href: '/tools/roi-calculator', type: 'route' },
      { name: 'Agencies Directory', href: '/agencies', type: 'route' }
    ],
    Resources: [
      { name: 'Downloads', href: '/downloads', type: 'route' },
      { name: 'Tools & Calculators', href: '/tools', type: 'route' },
      { name: 'Invoice Generator', href: '/tools/invoice-generator', type: 'route' },
      { name: 'Support Center', href: '/support', type: 'route' }
    ],
    Contact: [
      { name: 'Phone: +256 775 692 335', href: 'tel:+256775692335', type: 'external' },
      { name: 'Email: support@onestopcentre.ug', href: 'mailto:support@onestopcentre.ug', type: 'external' },
      { name: 'About Us', href: '/about', type: 'route' }
    ]
  };

  const handleLinkClick = (link: FooterLink) => {
    if (link.type === 'route') {
      router.push(link.href as never);
    } else if (link.type === 'external') {
      if (link.href.startsWith('tel:') || link.href.startsWith('mailto:')) {
        window.location.href = link.href;
      } else {
        window.open(link.href, '_blank');
      }
    } else if (link.href.startsWith('#')) {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If element not found on current page, navigate to home and then scroll
        if (window.location.pathname !== '/') {
          router.push(`/${link.href}` as never);
        }
      }
    } else {
      window.open(link.href, '_blank');
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-black text-white relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
                  <span className="hidden text-black font-bold text-lg">OSC</span>
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
              <div className="flex space-x-4">
                <button 
                  onClick={() => openExternalLink('https://twitter.com/ugandainvest')}
                  className="text-neutral-400 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-110"
                  title="Follow UIA on Twitter"
                  aria-label="Follow UIA on Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => openExternalLink('https://facebook.com/UgandaInvestmentAuthority')}
                  className="text-neutral-400 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-110"
                  title="Follow UIA on Facebook"
                  aria-label="Follow UIA on Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => openExternalLink('https://linkedin.com/company/uganda-investment-authority')}
                  className="text-neutral-400 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-110"
                  title="Connect with UIA on LinkedIn"
                  aria-label="Connect with UIA on LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.type === 'route' ? (
                        <Link
                          href={link.href as never}
                          className="text-neutral-300 hover:text-white transition-colors text-sm hover:text-yellow-300 block py-1"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="text-neutral-300 hover:text-white transition-colors text-sm text-left hover:text-yellow-300 block py-1"
                        >
                          {link.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Official Government Portals */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <BuildingLibraryIcon className="w-6 h-6 text-yellow-400 mr-2" />
              <h4 className="text-lg font-semibold text-yellow-400">
                Official Government Portals
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-yellow-400 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">MyBusiness Portal</h5>
                    <p className="text-xs text-neutral-400 mb-2">Business registration & licensing</p>
                    <button
                      onClick={() => openExternalLink('https://mybusiness.go.ug/')}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                    >
                      mybusiness.go.ug →
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 group-hover:bg-yellow-50 transition-all duration-300">
                    <Image 
                      src="/images/logos/UIA logo.png" 
                      alt="UIA Logo" 
                      width={60}
                      height={40}
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <svg className="hidden w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">Uganda Investment Authority</h5>
                    <p className="text-xs text-neutral-400 mb-2">Investment opportunities & incentives</p>
                    <button
                      onClick={() => openExternalLink('https://ugandainvest.go.ug/')}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                    >
                      ugandainvest.go.ug →
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-yellow-400 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white mb-1">eBiz Portal</h5>
                    <p className="text-xs text-neutral-400 mb-2">Electronic business services</p>
                    <button
                      onClick={() => openExternalLink('https://ebiz.go.ug/')}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                    >
                      ebiz.go.ug →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-neutral-800">
            <p className="text-neutral-400 text-sm">
              © {currentYear} OneStop Centre Uganda. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => openExternalLink('https://www.ugandainvest.go.ug/privacy-policy')}
                className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openExternalLink('https://www.ugandainvest.go.ug/terms-of-service')}
                className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => openExternalLink('https://www.ugandainvest.go.ug/accessibility')}
                className="text-neutral-400 hover:text-yellow-400 text-sm transition-colors"
              >
                Accessibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;