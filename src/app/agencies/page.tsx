'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Globe, Search, Star, Calendar, X } from 'lucide-react';
import { ugandaAgencies } from '@/data/agencies';

const GovernmentAgencies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Transform our existing data to match template structure with enhanced properties
  const agencies = ugandaAgencies.map(agency => ({
    id: agency.id,
    name: agency.name,
    acronym: agency.acronym,
    category: agency.category.charAt(0).toUpperCase() + agency.category.slice(1),
    priority: agency.urgencyLevel === 'high' ? 'High' : agency.urgencyLevel === 'medium' ? 'Medium' : 'Standard',
    description: agency.description,
    color: getAgencyColor(agency.category),
    gradient: getAgencyGradient(agency.category),
    services: agency.services,
    hours: agency.operatingHours,
    address: agency.contact.address,
    website: agency.contact.website || `www.${agency.acronym.toLowerCase()}.go.ug`,
    contact: agency.contact,
    logo: agency.logo,
    hasAppointmentBooking: agency.hasAppointmentBooking
  }));

  function getAgencyColor(category: string): string {
    const colorMap: Record<string, string> = {
      'investment': 'green',
      'registration': 'blue', 
      'taxation': 'orange',
      'environment': 'teal',
      'standards': 'purple',
      'infrastructure': 'indigo',
      'immigration': 'blue',
      'lands': 'emerald',
      'social_security': 'cyan',
      'finance': 'amber',
      'tourism': 'rose',
      'employers': 'violet',
      'conservation': 'green'
    };
    return colorMap[category] || 'gray';
  }

  function getAgencyGradient(category: string): string {
    const gradientMap: Record<string, string> = {
      'investment': 'from-green-500 to-emerald-600',
      'registration': 'from-blue-500 to-indigo-600',
      'taxation': 'from-orange-500 to-red-600',
      'environment': 'from-teal-500 to-green-600',
      'standards': 'from-purple-500 to-violet-600',
      'infrastructure': 'from-indigo-500 to-blue-600',
      'immigration': 'from-blue-600 to-cyan-600',
      'lands': 'from-emerald-500 to-teal-600',
      'social_security': 'from-cyan-500 to-blue-600',
      'finance': 'from-amber-500 to-orange-600',
      'tourism': 'from-rose-500 to-pink-600',
      'employers': 'from-violet-500 to-purple-600',
      'conservation': 'from-green-600 to-emerald-700'
    };
    return gradientMap[category] || 'from-gray-500 to-gray-600';
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
    if (priority === 'High') {
      return 'bg-red-500';
    } else if (priority === 'Medium') {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1587574293963-416154235727?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay for readability */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Government Agencies</h2>
              <p className="text-gray-600">Access essential government services for business and investment</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600">Showing</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAgencies.length} <span className="text-sm font-normal">of {agencies.length}</span></p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agencies by name, acronym, or service..."
                className="w-full pl-10 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent hover:border-yellow-300 transition-all text-black"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all"
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
                  className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-yellow-400 text-black shadow-md scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400 hover:scale-105'
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
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-yellow-400 hover:-translate-y-2 transition-all duration-300 group"
              >
                {/* Agency Header */}
                <div className={`bg-gradient-to-r ${agency.gradient} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        {agency.logo ? (
                          <Image
                            src={agency.logo}
                            alt={`${agency.acronym} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-700">{agency.acronym[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{agency.acronym}</h3>
                        <p className="text-xs text-white/80">{agency.category}</p>
                      </div>
                    </div>
                    <span className={`${getPriorityBadge(agency.priority)} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                      {agency.priority} Priority
                    </span>
                  </div>
                  
                  <h4 className="text-white font-semibold text-lg mb-2">{agency.name}</h4>
                  <p className="text-white/90 text-sm leading-relaxed">{agency.description}</p>
                </div>

                {/* Agency Content */}
                <div className="p-6">
                  {/* Key Services */}
                  <div className="mb-5">
                    <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Key Services
                    </h5>
                    <ul className="space-y-2">
                      {agency.services.slice(0, 2).map((service, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{service}</span>
                        </li>
                      ))}
                      {agency.services.length > 2 && (
                        <li className="text-sm text-yellow-600 font-medium">+{agency.services.length - 2} more services</li>
                      )}
                    </ul>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                    <div className="flex items-start gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{agency.hours}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{agency.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button 
                      onClick={() => {
                        const subject = encodeURIComponent(`Inquiry for ${agency.name} Services`);
                        const body = encodeURIComponent(
                          `Dear ${agency.name} Team,\\n\\n` +
                          `I am interested in learning more about your services, specifically:\\n\\n` +
                          `- ${agency.services[0] || 'General information'}\\n\\n` +
                          `Please provide me with more information about:\\n` +
                          `- Service requirements and procedures\\n` +
                          `- Required documents\\n` +
                          `- Processing timelines\\n` +
                          `- Fees and charges\\n\\n` +
                          `Thank you for your assistance.\\n\\n` +
                          `Best regards`
                        );
                        window.location.href = `mailto:${agency.contact.email}?subject=${subject}&body=${body}`;
                      }}
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>
                    <button 
                      onClick={() => window.location.href = `tel:${agency.contact.phone}`}
                      className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {agency.hasAppointmentBooking ? (
                      <button 
                        onClick={() => alert(`Booking appointment with ${agency.name}. This would open a calendar/booking system.`)}
                        className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-purple-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Book
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.location.href = `tel:${agency.contact.phone}`}
                        className="bg-gray-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Contact
                      </button>
                    )}
                    <button 
                      onClick={() => window.open(agency.website, '_blank')}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2.5 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Site
                    </button>
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