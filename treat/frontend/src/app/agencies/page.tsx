'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Clock, MapPin, X, MessageCircle } from 'lucide-react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ugandaAgencies } from '@/data/agencies';

const GovernmentAgencies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const agencies = ugandaAgencies.map(agency => ({
    id: agency.id,
    name: agency.name,
    acronym: agency.acronym,
    category: agency.category.charAt(0).toUpperCase() + agency.category.slice(1),
    priority: agency.urgencyLevel === 'high' ? 'High' : agency.urgencyLevel === 'medium' ? 'Medium' : 'Standard',
    description: agency.description,
    gradient: getAgencyGradient(agency.category),
    services: agency.services,
    hours: agency.operatingHours,
    address: agency.contact.address,
    logo: agency.logo,
    hasAppointmentBooking: agency.hasAppointmentBooking
  }));

  function getAgencyGradient(category: string): string {
    const gradientMap: Record<string, string> = {
      'investment': 'from-yellow-600 to-red-700',
      'registration': 'from-red-700 to-red-900',
      'taxation': 'from-yellow-500 to-yellow-700',
      'environment': 'from-red-600 to-yellow-700',
      'standards': 'from-neutral-800 to-red-900',
      'infrastructure': 'from-yellow-700 to-red-800',
      'immigration': 'from-red-800 to-neutral-900',
      'lands': 'from-yellow-600 to-red-700',
      'social_security': 'from-red-700 to-neutral-900',
      'finance': 'from-yellow-500 to-yellow-700',
      'tourism': 'from-red-600 to-red-800',
      'employers': 'from-neutral-800 to-red-900',
      'conservation': 'from-yellow-700 to-red-800'
    };
    return gradientMap[category] || 'from-neutral-800 to-neutral-900';
  }

  const categories = ['all', 'Investment', 'Registration', 'Taxation', 'Immigration', 'Environment', 'Standards', 'Infrastructure'];

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = searchQuery === '' ||
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || agency.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') return 'bg-red-600';
    if (priority === 'Medium') return 'bg-yellow-500';
    return 'bg-neutral-600';
  };

  const openAssistant = (agencyName: string, acronym: string) => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agencyName} (${acronym}) services` }
    }));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-16" style={{ backgroundImage: 'url(/images/uganda-map-flag.jpg)' }}>
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3">All Government Agencies</h2>
          <p className="text-lg text-neutral-200">Access essential government services for business and investment</p>
        </div>
      </section>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-neutral-900 border border-neutral-700 px-5 py-3 rounded-xl">
              <p className="text-sm text-neutral-400">Showing</p>
              <p className="text-2xl font-bold text-yellow-400">{filteredAgencies.length} <span className="text-sm font-normal text-neutral-500">of {agencies.length}</span></p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agencies by name, acronym, or service..."
                className="w-full pl-10 pr-12 py-3.5 bg-neutral-900 border-2 border-neutral-700 text-white placeholder-neutral-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent hover:border-yellow-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white hover:scale-110 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 min-h-[44px] rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                      : 'bg-neutral-900 text-neutral-300 border-2 border-neutral-700 hover:border-yellow-500 hover:scale-105'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agencies Grid */}
        {filteredAgencies.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-white mb-2">No agencies found</h3>
            <p className="text-neutral-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-neutral-900 rounded-2xl border-2 border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-600 hover:-translate-y-2 transition-all duration-300 group flex flex-col"
              >
                {/* Agency Header */}
                <div className={`bg-gradient-to-r ${agency.gradient} p-4 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-20 rounded-full translate-y-12 -translate-x-12"></div>

                  <div className="relative flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                        {agency.logo ? (
                          <Image
                            src={agency.logo}
                            alt={`${agency.acronym} logo`}
                            width={30}
                            height={30}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-neutral-800">{agency.acronym[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{agency.acronym}</h3>
                        <p className="text-[11px] text-white/70">{agency.category}</p>
                      </div>
                    </div>
                    <span className={`${getPriorityBadge(agency.priority)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg`}>
                      {agency.priority}
                    </span>
                  </div>

                  <h4 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{agency.name}</h4>
                  <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{agency.description}</p>
                </div>

                {/* Agency Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Key Services */}
                  <div className="mb-4">
                    <h5 className="text-xs font-bold text-yellow-500 mb-2 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Key Services
                    </h5>
                    <ul className="space-y-1.5">
                      {agency.services.slice(0, 2).map((service, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="line-clamp-1">{service}</span>
                        </li>
                      ))}
                      {agency.services.length > 2 && (
                        <li className="text-xs text-yellow-600 font-medium">+{agency.services.length - 2} more services</li>
                      )}
                    </ul>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-neutral-800">
                    <div className="flex items-start gap-2 text-xs">
                      <Clock className="w-3 h-3 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-400 line-clamp-1">{agency.hours}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-neutral-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-400 line-clamp-1">{agency.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-2 mt-auto">
                    <button
                      onClick={() => openAssistant(agency.name, agency.acronym)}
                      className="bg-yellow-500 text-black px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Ask the Assistant
                    </button>
                    <Link
                      href={`/agencies/${agency.id}`}
                      className="bg-neutral-800 text-neutral-300 px-3 py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs border border-neutral-700"
                    >
                      <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                      Request Service
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentAgencies;
