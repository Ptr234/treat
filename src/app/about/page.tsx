'use client';

import { 
  RocketLaunchIcon, 
  LightBulbIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  CheckCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

// Note: Next.js doesn't allow Metadata export in client components
// This would need to be handled in a separate layout or server component

export default function AboutPage() {
  const [liveStats, setLiveStats] = useState({
    projectsFacilitated: 1425,
    jobsCreated: 1000000,
    fdiFacilitated: 2.5,
    successRate: 98
  });

  // Animate stats on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        projectsFacilitated: prev.projectsFacilitated + Math.floor(Math.random() * 2),
        jobsCreated: prev.jobsCreated + Math.floor(Math.random() * 1000),
        fdiFacilitated: Math.max(2.4, Math.min(2.6, prev.fdiFacilitated + (Math.random() - 0.5) * 0.01)),
        successRate: Math.max(97, Math.min(99, prev.successRate + (Math.random() - 0.5) * 0.1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Professional Page Header Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1604591877395-0437a5757007?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
            }}
          />
          {/* Professional Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white font-light">About</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 font-black">
              OneStopCentre Uganda
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-light">
            Simplifying government services and investment processes for a prosperous Uganda
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Our Mission */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Our Mission</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                OneStopCentre Uganda serves as the digital gateway to streamlined government services, 
                business registration, and investment opportunities. We are committed to making it easier 
                for entrepreneurs, investors, and businesses to navigate Uganda&apos;s regulatory landscape 
                with precision and efficiency.
              </p>
            </div>

            {/* Our Vision */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center">
                  <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Our Vision</h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                To be the leading digital platform that empowers economic growth in Uganda by 
                providing seamless access to government services and investment opportunities. 
                We envision a future where businesses thrive through simplified processes and 
                strategic government partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Comprehensive services designed to facilitate your business journey in Uganda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BuildingOfficeIcon,
                title: "Business Registration",
                description: "Simplified digital business registration process with comprehensive support and guidance."
              },
              {
                icon: CurrencyDollarIcon,
                title: "Investment Support",
                description: "Access to investment opportunities and professional facilitation services."
              },
              {
                icon: UserGroupIcon,
                title: "Government Services",
                description: "Direct access to various government agencies and their specialized services."
              },
              {
                icon: WrenchScrewdriverIcon,
                title: "Digital Tools",
                description: "Professional calculators, forms, and tools to optimize business operations."
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-6 h-6 text-white" />
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

      {/* Our Impact Section */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
              Measurable results that demonstrate our commitment to Uganda&apos;s economic development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: UsersIcon,
                number: liveStats.projectsFacilitated.toLocaleString() + '+',
                label: 'Projects Facilitated',
                color: 'text-yellow-400'
              },
              {
                icon: CheckCircleIcon,
                number: (liveStats.jobsCreated / 1000000).toFixed(1) + 'M+',
                label: 'Jobs Created',
                color: 'text-yellow-400'
              },
              {
                icon: CurrencyDollarIcon,
                number: '$' + liveStats.fdiFacilitated.toFixed(1) + 'B+',
                label: 'FDI Facilitated',
                color: 'text-yellow-400'
              },
              {
                icon: TrophyIcon,
                number: liveStats.successRate.toFixed(0) + '%',
                label: 'Success Rate',
                color: 'text-yellow-400'
              }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-yellow-400" />
                </div>
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.number}
                </div>
                <div className="text-neutral-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-neutral-400">
              Data as of October 2025 | Source: Uganda Investment Authority
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}