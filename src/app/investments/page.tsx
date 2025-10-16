'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { InvestmentOpportunity } from '../../types';
import { InvestmentGrid } from '../../components/investments/InvestmentGrid';
import { InvestmentFiltersComponent, InvestmentFilters } from '../../components/investments/InvestmentFilters';
import { getAllInvestmentsWithContacts } from '../../data/investments/optimized';
import { getInvestmentStats } from '../../data/investments/comprehensive';
import { INVESTMENT_CATEGORIES } from '../../data/investments/categories';
import { TrendingUp, DollarSign, Clock, Building, Target, Users } from 'lucide-react';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<InvestmentFilters>({
    category: 'all',
    sector: 'all sectors',
    priority: 'all',
    investmentRange: 'all',
    roiRange: 'all',
    timelineRange: 'all',
    searchQuery: ''
  });

  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'roi' | 'timeline' | 'investmentRange'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load investments data
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const investmentData = getAllInvestmentsWithContacts();
        setInvestments(investmentData);
      } catch (error) {
        console.error('Error loading investments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestments();
  }, []);

  // Filter investments based on current filters
  const filteredInvestments = useMemo(() => {
    let filtered = [...investments];

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(inv => inv.category === filters.category);
    }

    // Apply sector filter
    if (filters.sector !== 'all sectors') {
      filtered = filtered.filter(inv => 
        inv.sector.toLowerCase().includes(filters.sector.toLowerCase()) ||
        inv.category.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(inv => inv.priority === filters.priority);
    }

    // Apply investment range filter
    if (filters.investmentRange !== 'all') {
      // This would need more complex logic based on actual ranges
      // For now, we'll skip this filter
    }

    // Apply search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.title.toLowerCase().includes(query) ||
        inv.description.toLowerCase().includes(query) ||
        inv.category.toLowerCase().includes(query) ||
        inv.sector.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [investments, filters]);

  const handleInvestmentSelect = (investment: InvestmentOpportunity) => {
    // Could navigate to detailed view or open modal
    console.log('Selected investment:', investment);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as 'title' | 'priority' | 'roi' | 'timeline' | 'investmentRange');
    setSortOrder(newSortOrder);
  };

  const stats = getInvestmentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Investment Opportunities in Uganda
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Discover profitable investment opportunities across high-growth sectors with government support and incentives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/investments/onboarding"
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Investment Journey
              </Link>
              <Link
                href="/tools/roi-calculator"
                className="border border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Calculate ROI
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalInvestments}</div>
              <div className="text-sm text-gray-600">Total Opportunities</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.highPriorityCount}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.sectors}</div>
              <div className="text-sm text-gray-600">Sectors</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMarketValue}</div>
              <div className="text-sm text-gray-600">Market Value</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageTimeline}</div>
              <div className="text-sm text-gray-600">Avg Timeline</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-2">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <InvestmentFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={true}
            />

            {/* Quick Categories */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Categories</h3>
              <div className="space-y-2">
                {INVESTMENT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: category.name }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.category === category.name
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Grid */}
          <div className="flex-1">
            <InvestmentGrid
              investments={filteredInvestments}
              isLoading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onInvestmentSelect={handleInvestmentSelect}
              searchQuery={filters.searchQuery}
              onSearchChange={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              showFilters={true}
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Invest in Uganda?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of investors who have already discovered the potential of Uganda&apos;s growing economy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/investments/onboarding"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started Now
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}