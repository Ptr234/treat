'use client';

import PageBand from '@/components/ui/PageBand';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import staticData from '@/data/investment-opportunities.json';
import type { InvestmentOpportunity } from '@/types';

const opportunitiesData = staticData as unknown as InvestmentOpportunity[];

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

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
 <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Investments</li>
          </ol>
        </nav>
      </div>

      {/* Title and intro */}
      <PageBand>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_.6fr] lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Invest in Uganda</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            Browse {opportunities.length} published opportunities across {categories.length} sectors, from agriculture and tourism to energy, infrastructure and technology. Compare indicative investment ranges, expected timelines and reported returns, then open a project to review its description and lead agency. Use search and sector filters to narrow the list to the areas that fit your plans. Figures are provided for early research and should be confirmed with the responsible agency before you make an investment decision.
          </p>
        </div>
        <div className="relative hidden h-44 lg:block">
          <Image src="/images/lake-bunyonyi-uganda.jpg" alt="Lake Bunyonyi in Uganda" fill className="object-cover" priority />
        </div>
      </section>
      </PageBand>

      {/* Search & filter */}
      <section className="mx-auto mt-10 max-w-6xl border-y border-neutral-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <label htmlFor="investment-search" className="sr-only">Search investment opportunities</label>
            <input
              id="investment-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by sector, agency, or keyword..."
              className="w-full rounded-md border-2 border-black bg-white py-2.5 pl-10 pr-10 text-sm text-black placeholder-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-red-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              aria-pressed={selectedCategory === ''}
              className={`whitespace-nowrap border-b-2 px-2 py-2 text-xs font-bold transition-colors ${
                selectedCategory === '' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-700 hover:text-red-600'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                aria-pressed={selectedCategory === cat}
                className={`whitespace-nowrap border-b-2 px-2 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === cat ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-700 hover:text-red-600'
                }`}
              >
                {String(cat).split('&')[0]?.trim()}
              </button>
            ))}
          </div>
        </div>
        {(searchTerm || selectedCategory) && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-neutral-600">{filteredOpportunities.length} results</span>
            <button type="button" onClick={clearFilters} className={`${linkClass} text-sm`}>Clear</button>
          </div>
        )}
      </section>

      {/* Opportunities */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {filteredOpportunities.length === 0 ? (
          <div className="border-l-4 border-red-600 bg-neutral-50 p-6">
            <h3 className="text-lg font-bold">No opportunities found</h3>
            <p className="mt-2 text-sm text-neutral-700">Try adjusting your search or filter.</p>
            <button type="button" onClick={clearFilters} className={`${linkClass} mt-4 inline-block text-sm`}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {filteredOpportunities.map((opp) => (
              <article key={opp.id} className="border-t border-neutral-200 pt-6">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                  <span className="text-red-600">{opp.category?.split('&')[0]?.trim()}</span>
                  <span className="text-neutral-500">· {opp.priority} priority</span>
                </div>

                <h3 className="mt-2 text-lg font-bold leading-snug">
                  <Link
                    href={`/investments/${opp.id}`}
                    className="text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm"
                  >
                    {opp.title}
                  </Link>
                </h3>

                <p className="mt-3 text-sm leading-7 text-neutral-700">{opp.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 bg-neutral-50 py-3 pl-4 pr-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Investment</p>
                    <p className="mt-0.5 font-semibold text-black">{opp.investmentRange}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">ROI</p>
                    <p className="mt-0.5 font-semibold text-black">{opp.roi}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Timeline</p>
                    <p className="mt-0.5 font-semibold text-black">{opp.timeline}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">Agency</p>
                    <p className="mt-0.5 font-semibold text-black">{opp.agency?.split('(')[0]?.trim()}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link href={`/investments/${opp.id}`} className={linkClass}>View opportunity</Link>
                  <button
                    type="button"
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent('openChatWidget', {
                        detail: { message: `I'm interested in: ${opp.title} (${opp.category}). Investment: ${opp.investmentRange}, ROI: ${opp.roi}. Tell me more.` }
                      }));
                    }}
                    className={linkClass}
                  >
                    Ask assistant
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default InvestmentOpportunities;
