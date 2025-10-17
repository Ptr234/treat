'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid, List, TrendingUp, Clock, DollarSign, AlertCircle, Phone, Mail, Globe } from 'lucide-react';
import opportunitiesData from '@/data/investment-opportunities.json';

const InvestmentOpportunities = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState('');
  const [selectedROI, setSelectedROI] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');

  const opportunities = opportunitiesData;

  // Filter and search functionality
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.agency.toLowerCase().includes(searchTerm.toLowerCase());

      // Investment range filter
      const matchesInvestmentRange = selectedInvestmentRange === '' || (() => {
        const oppRange = opp.investmentRange.toLowerCase();
        switch (selectedInvestmentRange) {
          case 'Under USD 500K':
            return oppRange.includes('500k') && !oppRange.includes('5m') && !oppRange.includes('2m');
          case 'USD 500K - 2M':
            return oppRange.includes('500k') || oppRange.includes('1m') || oppRange.includes('2m');
          case 'USD 2M - 10M':
            return oppRange.includes('2m') || oppRange.includes('5m') || oppRange.includes('8m') || oppRange.includes('10m');
          case 'USD 10M - 50M':
            return oppRange.includes('15m') || oppRange.includes('25m') || oppRange.includes('50m');
          case 'Over USD 50M':
            return oppRange.includes('50m+') || false;
          default:
            return true;
        }
      })();

      // ROI filter
      const matchesROI = selectedROI === '' || (() => {
        const oppROI = opp.roi.toLowerCase();
        switch (selectedROI) {
          case '10-15% annually':
            return oppROI.includes('12-18') || oppROI.includes('10-15');
          case '15-25% annually':
            return oppROI.includes('18-25') || oppROI.includes('20-30') || oppROI.includes('15-25');
          case '25%+ annually':
            return oppROI.includes('25-35') || oppROI.includes('25-40') || oppROI.includes('20-30');
          default:
            return true;
        }
      })();

      // Timeline filter
      const matchesTimeline = selectedTimeline === '' || (() => {
        const oppTimeline = opp.timeline.toLowerCase();
        switch (selectedTimeline) {
          case '12-24 months':
            return oppTimeline.includes('12-24') || oppTimeline.includes('12-18') || oppTimeline.includes('15-30');
          case '24-36 months':
            return oppTimeline.includes('24-48') || oppTimeline.includes('18-36');
          case '36+ months':
            return oppTimeline.includes('24-48') || oppTimeline.includes('36');
          default:
            return true;
        }
      })();

      return matchesSearch && matchesInvestmentRange && matchesROI && matchesTimeline;
    });
  }, [searchTerm, selectedInvestmentRange, selectedROI, selectedTimeline, opportunities]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInvestmentRange('');
    setSelectedROI('');
    setSelectedTimeline('');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1674574124738-01ad0110118e?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay for readability */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Opportunities</h2>
          <p className="text-gray-600">Discover high-potential investment opportunities in Uganda&apos;s growing economy</p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent hover:border-yellow-300 transition-all duration-200 text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  showFilters ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-600">{filteredOpportunities.length} opportunities found</span>
            {(searchTerm || selectedInvestmentRange || selectedROI || selectedTimeline) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>

                {/* Investment Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Investment Range</label>
                  <div className="space-y-2">
                    {['Under USD 500K', 'USD 500K - 2M', 'USD 2M - 10M', 'USD 10M - 50M', 'Over USD 50M'].map((range) => (
                      <label key={range} className="flex items-center group cursor-pointer hover:bg-yellow-50 p-2 rounded-lg transition-all duration-200">
                        <input 
                          type="radio" 
                          name="investment" 
                          value={range}
                          checked={selectedInvestmentRange === range}
                          onChange={(e) => setSelectedInvestmentRange(e.target.value)}
                          className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 cursor-pointer" 
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 group-hover:font-medium transition-all duration-200">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expected ROI */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Expected ROI</label>
                  <div className="space-y-2">
                    {['10-15% annually', '15-25% annually', '25%+ annually'].map((roi) => (
                      <label key={roi} className="flex items-center group cursor-pointer hover:bg-yellow-50 p-2 rounded-lg transition-all duration-200">
                        <input 
                          type="radio" 
                          name="roi" 
                          value={roi}
                          checked={selectedROI === roi}
                          onChange={(e) => setSelectedROI(e.target.value)}
                          className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 cursor-pointer" 
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 group-hover:font-medium transition-all duration-200">{roi}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Timeline</label>
                  <div className="space-y-2">
                    {['12-24 months', '24-36 months', '36+ months'].map((timeline) => (
                      <label key={timeline} className="flex items-center group cursor-pointer hover:bg-yellow-50 p-2 rounded-lg transition-all duration-200">
                        <input 
                          type="radio" 
                          name="timeline" 
                          value={timeline}
                          checked={selectedTimeline === timeline}
                          onChange={(e) => setSelectedTimeline(e.target.value)}
                          className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 cursor-pointer" 
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 group-hover:font-medium transition-all duration-200">{timeline}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Opportunities Grid */}
          <main className="flex-1">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredOpportunities.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria or clearing the filters</p>
                  <button
                    onClick={clearFilters}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                filteredOpportunities.map((opp) => (
                <Link 
                  key={opp.id} 
                  href={`/investments/${opp.id}`} 
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  {/* Uganda Flag Stripe - Black, Yellow, Red */}
                  <div className="h-1.5 flex group-hover:h-2 transition-all duration-300">
                    <div className="flex-1 bg-black group-hover:bg-gray-900"></div>
                    <div className="flex-1 bg-yellow-400 group-hover:bg-yellow-500"></div>
                    <div className="flex-1 bg-red-600 group-hover:bg-red-700"></div>
                  </div>
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-300 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 overflow-hidden">
                          <div className="w-10 h-10 relative">
                            <Image 
                              src={opp.logoPath} 
                              alt={`${opp.agency} logo`}
                              width={40}
                              height={40}
                              className="object-contain"
                              onError={() => {
                                // Fallback will be handled by Next.js automatically
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors duration-300 line-clamp-2">
                            {opp.title}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md group-hover:bg-yellow-100 group-hover:text-yellow-800 transition-colors duration-300">
                            {opp.category}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full flex-shrink-0 border border-red-200 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                        {opp.priority}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {opp.description}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Investment</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{opp.investmentRange}</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-yellow-700" />
                          <span className="text-xs text-yellow-700">Expected ROI</span>
                        </div>
                        <p className="text-sm font-bold text-yellow-800">{opp.roi}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{opp.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs">{opp.agency}</span>
                      </div>
                    </div>

                    {/* Key Risks */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-900 mb-0.5">Key Risks</p>
                          <p className="text-xs text-red-700">{opp.keyRisks}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(opp.contact.website, '_blank')}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2.5 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        Learn More
                      </button>
                      <button 
                        onClick={() => window.open(`tel:${opp.contact.phone}`, '_self')}
                        className="p-2.5 border-2 border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
                        title={`Call ${opp.agency} at ${opp.contact.phone}`}
                      >
                        <Phone className="w-4 h-4 text-gray-600 hover:text-yellow-600" />
                      </button>
                      <button 
                        onClick={() => {
                          const subject = encodeURIComponent(`Investment Inquiry: ${opp.title}`);
                          const body = encodeURIComponent(
                            `Dear ${opp.agency} Team,\n\n` +
                            `I am interested in learning more about the investment opportunity: ${opp.title}.\n\n` +
                            `Investment Range: ${opp.investmentRange}\n` +
                            `Expected ROI: ${opp.roi}\n` +
                            `Timeline: ${opp.timeline}\n\n` +
                            `Please provide me with more detailed information about this opportunity, including:\n` +
                            `- Application process and requirements\n` +
                            `- Available government incentives\n` +
                            `- Next steps to proceed\n\n` +
                            `Thank you for your time and assistance.\n\n` +
                            `Best regards`
                          );
                          window.open(`mailto:${opp.contact.email}?subject=${subject}&body=${body}`, '_self');
                        }}
                        className="p-2.5 border-2 border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
                        title={`Email ${opp.agency} at ${opp.contact.email}`}
                      >
                        <Mail className="w-4 h-4 text-gray-600 hover:text-yellow-600" />
                      </button>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOpportunities;