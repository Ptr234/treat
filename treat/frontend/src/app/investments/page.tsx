'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, TrendingUp, Clock, DollarSign, MessageCircle, Globe, X, ArrowRight } from 'lucide-react';
import opportunitiesData from '@/data/investment-opportunities.json';

// 3 creative card styles rotating across the grid
const cardThemes = [
  {
    // Black card — gold accents
    card: 'bg-black border-neutral-800',
    header: 'bg-gradient-to-r from-yellow-500/10 to-transparent',
    title: 'text-white group-hover:text-yellow-400',
    desc: 'text-neutral-400',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    metric: 'bg-white/5 border-white/10',
    metricLabel: 'text-neutral-500',
    metricValue: 'text-white',
    roiBg: 'bg-yellow-500/15 border-yellow-500/20',
    roiLabel: 'text-yellow-400',
    roiValue: 'text-yellow-300',
    cta: 'bg-yellow-500 text-black hover:bg-yellow-400',
    ctaIcon: 'text-black',
    priority: 'bg-red-500/20 text-red-400 border-red-500/30',
    priorityMed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    logo: 'bg-white border-neutral-700',
    stripe: true,
  },
  {
    // Yellow/Gold card — dark accents
    card: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 border-yellow-600/30',
    header: 'bg-gradient-to-r from-black/5 to-transparent',
    title: 'text-black group-hover:text-red-700',
    desc: 'text-black/60',
    badge: 'bg-black/10 text-black/80 border-black/20',
    metric: 'bg-black/10 border-black/10',
    metricLabel: 'text-black/50',
    metricValue: 'text-black/90',
    roiBg: 'bg-black/15 border-black/15',
    roiLabel: 'text-black/60',
    roiValue: 'text-black font-extrabold',
    cta: 'bg-black text-yellow-400 hover:bg-neutral-900',
    ctaIcon: 'text-yellow-400',
    priority: 'bg-red-600/20 text-red-800 border-red-600/30',
    priorityMed: 'bg-black/15 text-black/70 border-black/20',
    logo: 'bg-white border-yellow-600/30',
    stripe: false,
  },
  {
    // Red card — white/gold accents
    card: 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 border-red-800/30',
    header: 'bg-gradient-to-r from-white/5 to-transparent',
    title: 'text-white group-hover:text-yellow-300',
    desc: 'text-white/70',
    badge: 'bg-white/15 text-white/90 border-white/20',
    metric: 'bg-white/10 border-white/10',
    metricLabel: 'text-white/50',
    metricValue: 'text-white',
    roiBg: 'bg-yellow-500/20 border-yellow-400/20',
    roiLabel: 'text-yellow-300',
    roiValue: 'text-yellow-200 font-extrabold',
    cta: 'bg-white text-red-600 hover:bg-yellow-50',
    ctaIcon: 'text-red-600',
    priority: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30',
    priorityMed: 'bg-white/15 text-white/80 border-white/20',
    logo: 'bg-white border-white/30',
    stripe: false,
  },
];

const InvestmentOpportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const opportunities = opportunitiesData;

  const categories = useMemo(() => {
    const cats = [...new Set(opportunities.map(o => o.category))];
    return cats.sort();
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = searchTerm === '' ||
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.agency.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' ||
        opp.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, opportunities]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-neutral-100">

      {/* Hero Banner */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src="/images/lake-bunyonyi-uganda.jpg"
          alt="Lake Bunyonyi, Uganda"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-neutral-100" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="flex gap-1.5 mb-4">
            <div className="w-8 h-1.5 rounded-full bg-black" />
            <div className="w-8 h-1.5 rounded-full bg-yellow-500" />
            <div className="w-8 h-1.5 rounded-full bg-red-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            Invest in Uganda
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            {opportunities.length} curated opportunities across {categories.length} sectors
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by sector, agency, or keyword..."
                className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-black bg-neutral-50"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === '' ? 'bg-black text-yellow-400 shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat ? 'bg-yellow-500 text-black shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {String(cat).split('&')[0]?.trim()}
                </button>
              ))}
            </div>
          </div>
          {(searchTerm || selectedCategory) && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-neutral-500">{filteredOpportunities.length} results</span>
              <button onClick={clearFilters} className="text-red-500 hover:text-red-600 font-semibold">Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No opportunities found</h3>
            <p className="text-neutral-500 mb-4">Try adjusting your search or filter</p>
            <button onClick={clearFilters} className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredOpportunities.map((opp, index) => {
              const theme = cardThemes[index % 3]!;

              return (
                <Link
                  key={opp.id}
                  href={`/investments/${opp.id}`}
                  className={`group block rounded-2xl border overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${theme.card}`}
                >
                  {/* Flag stripe on black cards only */}
                  {theme.stripe && (
                    <div className="h-1 flex">
                      <div className="flex-1 bg-black" />
                      <div className="flex-1 bg-yellow-500" />
                      <div className="flex-1 bg-red-500" />
                    </div>
                  )}

                  <div className={`p-1.5 ${theme.header}`}>
                    <div className="p-3">
                      {/* Top row: logo + category + priority */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border overflow-hidden flex-shrink-0 ${theme.logo}`}>
                            <Image
                              src={opp.logoPath}
                              alt={opp.agency}
                              width={30}
                              height={30}
                              className="object-contain"
                              onError={() => {}}
                            />
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${theme.badge}`}>
                            {opp.category?.split('&')[0]?.trim()}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          opp.priority === 'High' ? theme.priority : theme.priorityMed
                        }`}>
                          {opp.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`font-bold text-sm leading-snug mb-2 line-clamp-2 transition-colors min-h-[2.5rem] ${theme.title}`}>
                        {opp.title}
                      </h3>

                      {/* Description */}
                      <p className={`text-xs mb-4 line-clamp-2 leading-relaxed ${theme.desc}`}>
                        {opp.description}
                      </p>

                      {/* Metrics 2x2 */}
                      <div className="grid grid-cols-2 gap-1.5 mb-4">
                        <div className={`rounded-lg px-2.5 py-2 border ${theme.metric}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <DollarSign className={`w-3 h-3 ${theme.metricLabel}`} />
                            <span className={`text-[10px] ${theme.metricLabel}`}>Investment</span>
                          </div>
                          <p className={`text-[11px] font-semibold truncate ${theme.metricValue}`}>{opp.investmentRange}</p>
                        </div>
                        <div className={`rounded-lg px-2.5 py-2 border ${theme.roiBg}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <TrendingUp className={`w-3 h-3 ${theme.roiLabel}`} />
                            <span className={`text-[10px] ${theme.roiLabel}`}>ROI</span>
                          </div>
                          <p className={`text-[11px] font-bold truncate ${theme.roiValue}`}>{opp.roi}</p>
                        </div>
                        <div className={`rounded-lg px-2.5 py-2 border ${theme.metric}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className={`w-3 h-3 ${theme.metricLabel}`} />
                            <span className={`text-[10px] ${theme.metricLabel}`}>Timeline</span>
                          </div>
                          <p className={`text-[11px] font-semibold truncate ${theme.metricValue}`}>{opp.timeline}</p>
                        </div>
                        <div className={`rounded-lg px-2.5 py-2 border ${theme.metric}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Globe className={`w-3 h-3 ${theme.metricLabel}`} />
                            <span className={`text-[10px] ${theme.metricLabel}`}>Agency</span>
                          </div>
                          <p className={`text-[11px] font-semibold truncate ${theme.metricValue}`}>{opp.agency?.split('(')[0]?.trim()}</p>
                        </div>
                      </div>

                      {/* CTA Row */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            document.dispatchEvent(new CustomEvent('openChatWidget', {
                              detail: { message: `I'm interested in: ${opp.title} (${opp.category}). Investment: ${opp.investmentRange}, ROI: ${opp.roi}. Tell me more.` }
                            }));
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${theme.cta}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Ask AI
                        </button>
                        <div className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${theme.cta}`}>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentOpportunities;
