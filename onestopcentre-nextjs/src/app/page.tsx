'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRightIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  LightBulbIcon,
  MapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [liveStats, setLiveStats] = useState({
    fdi: 2.9,
    gdp: 6.5,
    businesses: 50893,
    investments: 1247,
    sectors: 8
  });

  // Live statistics with enhanced animations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        fdi: Math.max(2.5, Math.min(3.5, prev.fdi + (Math.random() - 0.5) * 0.02)),
        gdp: Math.max(6.0, Math.min(7.0, prev.gdp + (Math.random() - 0.5) * 0.05)),
        businesses: prev.businesses + Math.floor(Math.random() * 5),
        investments: prev.investments + Math.floor(Math.random() * 3),
        sectors: Math.max(8, Math.min(12, prev.sectors + (Math.random() > 0.98 ? 1 : 0)))
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white overflow-hidden">
      
      {/* Red Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 z-50" />
      
      {/* Live Statistics Bar */}
      <div className="fixed top-1 left-0 right-0 bg-red-600/90 backdrop-blur-md text-white py-2 px-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs md:text-sm">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-1">
              <SparklesIcon className="w-4 h-4 text-yellow-300" />
              <span className="font-medium">FDI: ${liveStats.fdi.toFixed(2)}B</span>
            </div>
            <div>
              <span className="font-medium">GDP Growth: {liveStats.gdp.toFixed(1)}%</span>
            </div>
            <div>
              <span className="font-medium">Businesses: {liveStats.businesses.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-yellow-300 font-semibold">
            🔴 LIVE: {liveStats.investments.toLocaleString()} Active Investments
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900 to-black"></div>
        <div className="absolute inset-0">
          <Image
            src="/images/uganda-kampala-city-view.webp"
            alt="Uganda Investment Hub"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 py-20">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-400/30 rounded-full px-6 py-2 backdrop-blur-sm text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-red-200 font-medium">Uganda Investment Authority</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                East Africa&apos;s Premier
              </span>
              <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Investment Hub
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Unlock Uganda&apos;s investment potential with simplified processes, government support, and guaranteed returns in Africa&apos;s fastest-growing economy.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link
                href="/investments"
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl transition-all duration-300 flex items-center space-x-3 text-lg hover:scale-105"
              >
                <span>Start Investing Today</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/services"
                className="text-white font-semibold py-4 px-8 rounded-2xl border border-white/30 hover:bg-white/10 transition-all duration-300 flex items-center space-x-2 hover:scale-102"
              >
                <span>View All Services</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 pt-8 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>GDP Growth: {liveStats.gdp.toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>FDI: ${liveStats.fdi.toFixed(1)}B</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>{liveStats.investments.toLocaleString()} Active Investments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-600 text-lg font-medium mb-8">
              Trusted by leading organizations and investors across East Africa
            </p>
            
            {/* Client Logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
              <Image src="/images/logos/UIA logo.png" alt="Uganda Investment Authority" width={80} height={48} className="object-contain" />
              <Image src="/images/logos/BOU.jpeg" alt="Bank of Uganda" width={80} height={48} className="object-contain" />
              <Image src="/images/logos/URA logo.png" alt="Uganda Revenue Authority" width={80} height={48} className="object-contain" />
              <Image src="/images/logos/URSB logo.png" alt="Uganda Registration Services Bureau" width={80} height={48} className="object-contain" />
              <Image src="/images/logos/NSSF logo.png" alt="National Social Security Fund" width={80} height={48} className="object-contain" />
              <Image src="/images/logos/UTB.png" alt="Uganda Tourism Board" width={80} height={48} className="object-contain" />
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">$2.9B+</div>
              <div className="text-gray-600 font-medium">Foreign Direct Investment</div>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">1,200+</div>
              <div className="text-gray-600 font-medium">Active Investments</div>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">97%</div>
              <div className="text-gray-600 font-medium">Investor Satisfaction</div>
            </div>
            <div className="p-6">
              <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">6.5%</div>
              <div className="text-gray-600 font-medium">Annual GDP Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              Why Invest in Uganda?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the advantages that make Uganda East Africa&apos;s most attractive investment destination
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Location</h3>
              <p className="text-gray-600 leading-relaxed">
                Gateway to East African markets with access to over 300 million consumers through regional trade agreements.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Government Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive incentives, tax holidays, and one-stop center services to streamline your investment journey.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stable Economy</h3>
              <p className="text-gray-600 leading-relaxed">
                Consistent GDP growth, stable currency, and diversified economy offering multiple investment opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Uganda Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                The Pearl of Africa Awaits Your Investment
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Uganda combines political stability, abundant natural resources, and a strategic location 
                to offer unparalleled investment opportunities in East Africa&apos;s most dynamic economy.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">60+ years of political stability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Young, educated workforce (75% under 30)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Rich natural resources & fertile land</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/uganda-kampala-city-view.webp"
                alt="Kampala City View"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-black text-gray-900">45M+</div>
                <div className="text-gray-600">Population</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-red-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-6 border border-green-500/30 backdrop-blur-sm">
              <MapIcon className="w-5 h-5 mr-2" />
              <span>Your Investment Journey Starts Here</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to 
              <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Start Investing?
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Follow our guided process to discover the perfect investment opportunity 
              and get started with Uganda&apos;s most promising sectors.
            </p>
          </div>

          {/* Interactive Flow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                title: 'Discover Opportunities',
                description: 'Explore investment sectors with 15-35% ROI potential',
                icon: LightBulbIcon,
                color: 'from-blue-500 to-cyan-600',
                href: '/investments',
                actionText: 'Browse Investments',
                highlights: ['8 Key Sectors', '1,200+ Opportunities', 'ROI Calculator']
              },
              {
                step: '02',
                title: 'Get Official Support',
                description: 'Access government services and agency assistance',
                icon: MapIcon,
                color: 'from-green-500 to-emerald-600',
                href: '/services',
                actionText: 'View Services',
                highlights: ['50+ Services', 'Fast-Track Processing', 'Expert Guidance']
              },
              {
                step: '03',
                title: 'Launch Your Investment',
                description: 'Complete applications and start your investment journey',
                icon: RocketLaunchIcon,
                color: 'from-purple-500 to-pink-600',
                href: '/business/registration',
                actionText: 'Start Application',
                highlights: ['Step-by-Step Guide', '15-30 Day Process', 'Dedicated Support']
              }
            ].map((step) => (
              <Link key={step.step} href={step.href as never} className="group cursor-pointer">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 relative overflow-hidden h-full">
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {step.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  <div className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r ${step.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                    <span>{step.actionText}</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/30 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-black text-yellow-400 mb-2">
                  {liveStats.fdi.toFixed(1)}B+
                </div>
                <div className="text-sm text-gray-300">FDI 2023 (USD)</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-400 mb-2">
                  {liveStats.gdp.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">GDP Growth Rate</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400 mb-2">
                  {liveStats.businesses.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">New Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-400 mb-2">
                  {liveStats.investments}+
                </div>
                <div className="text-sm text-gray-300">Active Opportunities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
              Join thousands of successful investors who have already discovered Uganda&apos;s potential. 
              Get started today with our expert guidance and comprehensive support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/business/registration"
                className="bg-white text-red-600 font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg hover:scale-105"
              >
                Start Investment Assessment
              </Link>
              <Link
                href="/support"
                className="border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-red-600 transition-all duration-300 hover:scale-102"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}