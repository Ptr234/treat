'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ArrowRightIcon,
  DocumentTextIcon,
  CalculatorIcon,
  HandRaisedIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    fdi: 49.5,
    investments: 9922,
    satisfaction: 98,
    sectors: 8
  });

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const interval = setInterval(() => {
      setLiveStats(prev => ({
        fdi: Math.max(49.4, Math.min(49.6, prev.fdi + (Math.random() - 0.5) * 0.01)),
        investments: prev.investments + Math.floor(Math.random() * 2),
        satisfaction: Math.max(97, Math.min(99, prev.satisfaction + (Math.random() - 0.5) * 0.1)),
        sectors: prev.sectors
      }));
    }, 3000);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(interval);
    };
  }, []);

  const openAssistant = (message?: string) => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: message ? { message } : undefined
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="yellow" className="mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Uganda Investment Portal</h2>
          <p className="text-neutral-300">Loading excellence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/Pride.webp)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/85"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #FFD700 0%, transparent 25%), radial-gradient(circle at 75% 75%, #CE1126 0%, transparent 25%)'
          }}></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <div>
            <h1 className="mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <span className="block text-white text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide uppercase mb-3" style={{ letterSpacing: '0.15em' }}>
                Uganda Investment
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-300 text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tight drop-shadow-lg">
                Excellence Hub
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl lg:text-2xl text-neutral-200 mb-10 max-w-3xl mx-auto leading-relaxed font-light tracking-wide" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Expert investment advisory services with government backing. Unlock Uganda&apos;s <span className="text-yellow-400 font-semibold">$49.5B+</span> investment opportunities through our comprehensive facilitation platform.
          </p>

          {/* Hero CTAs — AI Assistant First */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => openAssistant()}
              className="group inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20 text-lg"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
              Ask the AI Assistant
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/investments/onboarding"
              className="group inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg transition-all duration-300 hover:bg-neutral-100 hover:shadow-xl"
              prefetch={true}
            >
              Start Investment Journey
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/tools/roi-calculator"
              className="group inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl"
              prefetch={true}
            >
              Calculate Returns
              <CalculatorIcon className="w-5 h-5 ml-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-white/95 backdrop-blur-sm border-t border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-neutral-900">
                    {liveStats.investments.toLocaleString()}+
                  </div>
                  <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                    Licensed Projects
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-neutral-900">
                    {liveStats.satisfaction.toFixed(0)}%
                  </div>
                  <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                    Success Rate
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-neutral-900">
                    ${liveStats.fdi.toFixed(1)}B+
                  </div>
                  <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                    FDI Facilitated
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-neutral-900">
                    {liveStats.sectors}
                  </div>
                  <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                    Key Sectors
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-neutral-500">
                  Data: January 1991 — December 2025 | Source: Uganda Investment Authority
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Investment Advisor Section */}
      <section className="py-16 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your AI Investment Advisor
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Get instant answers about investing in Uganda — business registration, tax incentives, sector opportunities, and more.
          </p>

          {/* Quick Topic Pills */}
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

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-xl">
                <Image
                  src="/images/uganda-flag-city.jpg"
                  alt="Uganda Investment Authority - One Stop Centre"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                  loading="eager"
                />
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                About Uganda Investment Authority
              </h2>

              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Uganda&apos;s premier investment facilitation center, strategically positioned to unlock the country&apos;s vast economic potential. With government backing and comprehensive market knowledge, we transform investment challenges into sustainable opportunities.
              </p>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Our expert team provides end-to-end investment support, from initial consultation to project implementation, ensuring optimal returns in Uganda&apos;s fastest-growing sectors.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-2xl font-bold text-neutral-900">1.25M+</div>
                  <div className="text-sm text-neutral-600">Jobs Created</div>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="text-2xl font-bold text-neutral-900">6.3%</div>
                  <div className="text-sm text-neutral-600">GDP Growth</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="text-2xl font-bold text-neutral-900">$61B</div>
                  <div className="text-sm text-neutral-600">GDP (2024)</div>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="text-2xl font-bold text-neutral-900">11</div>
                  <div className="text-sm text-neutral-600">Industrial Parks</div>
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg transition-colors hover:bg-neutral-800"
                aria-label="Learn more about Uganda Investment Portal"
              >
                Learn More
                <ArrowRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Professional Investment Services
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-8">
              Comprehensive investment facilitation and business support services backed by government expertise and regulatory knowledge.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg transition-colors hover:bg-neutral-800"
              aria-label="View all investment services offered"
            >
              View All Services
              <ArrowRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: RocketLaunchIcon,
                title: "Investment Facilitation",
                description: "Complete investment facilitation services from project conception to implementation, with government support and regulatory guidance."
              },
              {
                icon: DocumentTextIcon,
                title: "Business Registration",
                description: "Complete business registration and company formation services through URSB with streamlined processing."
              },
              {
                icon: CalculatorIcon,
                title: "Tax & Compliance",
                description: "Comprehensive tax registration, URA compliance, and ongoing tax advisory services."
              },
              {
                icon: ChartBarIcon,
                title: "ROI Analysis",
                description: "Professional return on investment analysis with Uganda-specific market data and sector performance metrics."
              },
              {
                icon: HandRaisedIcon,
                title: "Investment Support",
                description: "Ongoing investment support, aftercare services, and government liaison for sustainable business growth."
              },
              {
                icon: ShieldCheckIcon,
                title: "Regulatory Compliance",
                description: "Expert guidance through Uganda's regulatory landscape with full compliance assurance and legal support."
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">{service.title}</h3>
                <p className="text-neutral-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Invest in Uganda?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join 9,922+ successful investors who have discovered Uganda&apos;s potential. Start your investment journey today with professional guidance and government support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openAssistant()}
              className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-xl"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Ask the AI Assistant
            </button>
            <Link
              href="/investments/onboarding"
              className="inline-flex items-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-lg transition-colors hover:bg-neutral-100"
            >
              Start Investment Journey
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
