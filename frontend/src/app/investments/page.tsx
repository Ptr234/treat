'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import staticData from '@/data/investment-opportunities.json';
import type { InvestmentOpportunity } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';

const opportunitiesData = staticData as unknown as InvestmentOpportunity[];

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

  const countFor = (category: string) => opportunities.filter((o) => o.category === category).length;

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Investment projects' }]}
        caption="Invest"
        title="Investment projects in Uganda"
        lead="Search published projects by sector, investment range or lead agency. Open a listing for its requirements and contact details."
        actions={
          <>
            <Link href="/investments/onboarding" className="gov-btn gov-btn--start">Register your interest</Link>
            <Link href="/investments/process" className="gov-link">How the investment process works</Link>
          </>
        }
      >
        <FactRow
          facts={[
            { label: 'Projects listed', value: opportunities.length },
            { label: 'Sectors', value: categories.length },
            { label: 'Lead agencies', value: new Set(opportunities.map((project) => project.agency).filter(Boolean)).size },
          ]}
        />
      </PageHeader>

      <div className="gov-container grid gap-10 py-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        {/* Filters */}
        <aside aria-label="Filter investment projects" className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-[#f5f3ee] p-5">
            <h2 className="text-lg font-bold">Filter projects</h2>
            <label htmlFor="investment-search" className="gov-label mt-5">Search</label>
            <input
              id="investment-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, sector or agency"
              className="gov-input"
            />
            <fieldset className="mt-6">
              <legend className="gov-label">Sector</legend>
              <div className="mt-2 space-y-2.5">
                <label className="flex items-center gap-3 text-[15px] font-normal">
                  <input type="radio" name="sector" className="h-5 w-5 shrink-0" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} />
                  <span className="flex-1">All sectors</span>
                  <span className="font-data text-sm text-[#5c5850]">{opportunities.length}</span>
                </label>
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-3 text-[15px] font-normal">
                    <input type="radio" name="sector" className="h-5 w-5 shrink-0" checked={selectedCategory === category} onChange={() => setSelectedCategory(category)} />
                    <span className="flex-1">{category}</span>
                    <span className="font-data text-sm text-[#5c5850]">{countFor(category)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {(searchTerm || selectedCategory) && (
              <button type="button" onClick={clearFilters} className="gov-btn gov-btn--secondary gov-btn--sm mt-6 w-full">Clear filters</button>
            )}
          </div>
        </aside>

        {/* Results */}
        <section aria-labelledby="results-heading">
          <div className="flex flex-col gap-2 border-b-2 border-black pb-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="results-heading" aria-live="polite" className="gov-title-l">
              {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'project' : 'projects'}
            </h2>
            <p className="gov-hint max-w-sm sm:text-right">Figures are published estimates. Confirm details with the lead agency.</p>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="gov-inset mt-6">
              <h3 className="text-lg font-bold">No projects match your search</h3>
              <p className="mt-1 text-[15px] text-[#3b3934]">Try a project name, sector or agency, or clear the filters to see every listing.</p>
              <button type="button" onClick={clearFilters} className="gov-link mt-3">Clear filters</button>
            </div>
          ) : (
            <ul>
              {filteredOpportunities.map((opp) => (
                <li key={opp.id} className="border-b border-[#dcd8cf] py-7">
                  <article>
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="gov-tag gov-tag--outline">{opp.category}</span>
                      {opp.priority === 'High' && <span className="gov-tag gov-tag--gold">High priority</span>}
                    </p>
                    <h3 className="mt-3 text-[22px] font-bold leading-snug">
                      <Link href={`/investments/${opp.id}`} className="text-black underline decoration-1 underline-offset-4 hover:text-[#9a0d1c] hover:decoration-[3px]">
                        {opp.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 max-w-3xl text-[15px] leading-6 text-[#3b3934]">{opp.description}</p>

                    <dl className="mt-4 grid grid-cols-2 border-l-4 border-black bg-[#f5f3ee] text-sm sm:grid-cols-4">
                      {[
                        ['Investment', opp.investmentRange],
                        ['Estimated ROI', opp.roi],
                        ['Timeline', opp.timeline],
                        ['Lead agency', opp.agency?.split('(')[0]?.trim()],
                      ].map(([label, value]) => (
                        <div key={label} className="px-4 py-3">
                          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c5850]">{label}</dt>
                          <dd className="mt-1 font-bold text-black">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
                      <Link href={`/investments/${opp.id}`} className="gov-arrow-link">View project details</Link>
                      <button
                        type="button"
                        onClick={() => {
                          document.dispatchEvent(new CustomEvent('openChatWidget', {
                            detail: { message: `I'm interested in: ${opp.title} (${opp.category}). Investment: ${opp.investmentRange}, ROI: ${opp.roi}. Tell me more.` }
                          }));
                        }}
                        className="gov-link inline-flex items-center gap-1.5 font-normal"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden="true" />
                        Ask the assistant
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default InvestmentOpportunities;
