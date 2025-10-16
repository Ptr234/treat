'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InvestmentOpportunity } from '../../types';
import { InvestmentGrid } from '../../components/investments/InvestmentGrid';
import { InvestmentFiltersComponent, InvestmentFilters } from '../../components/investments/InvestmentFilters';
import { getAllInvestmentsWithContacts } from '../../data/investments/optimized';
import { researchBasedInvestments, researchBasedStats } from '../../data/investments/research-based';
import { INVESTMENT_CATEGORIES } from '../../data/investments/categories';
import { TrendingUp, DollarSign, Building, Target } from 'lucide-react';
import Button from '../../components/ui/Button';

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
        // Combine research-based investments with existing data
        const optimizedData = getAllInvestmentsWithContacts();
        const investmentData = [...researchBasedInvestments, ...optimizedData];
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

  // Use research-based statistics - simplified to 4 key metrics
  const stats = useMemo(() => ({
    totalMarketValue: parseFloat(researchBasedStats.totalMarketValue.replace(/[^0-9.]/g, '')) || 0,
    totalInvestments: researchBasedInvestments.length + 12,
    highPriorityCount: researchBasedStats.highPriorityCount + 3,
    sectors: researchBasedStats.sectors + 2
  }), []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-yellow-400">Investment Opportunities</span> in Uganda
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover profitable investment opportunities across high-growth sectors with government support and incentives
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/investments/onboarding">
                <Button variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                  Start Investment Journey
                </Button>
              </Link>
              <Link href="/tools/roi-calculator">
                <Button variant="outline" size="lg" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8">
                  Calculate ROI
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section - Simplified and Professional */}
      <motion.div 
        className="bg-white border-b border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="bg-neutral-50 rounded-lg p-8 border border-neutral-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-yellow-400 rounded-lg mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                >
                  {researchBasedStats.totalMarketValue}
                </motion.div>
                <div className="text-sm text-gray-600 font-medium">Total Market Value</div>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-yellow-400 rounded-lg mx-auto mb-3">
                  <Target className="w-8 h-8 text-yellow-500" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  {stats.totalInvestments}
                </motion.div>
                <div className="text-sm text-gray-600 font-medium">Total Opportunities</div>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-yellow-400 rounded-lg mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                >
                  {stats.highPriorityCount}
                </motion.div>
                <div className="text-sm text-gray-600 font-medium">High Priority</div>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-yellow-400 rounded-lg mx-auto mb-3">
                  <Building className="w-8 h-8 text-yellow-500" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.7 }}
                >
                  {stats.sectors}
                </motion.div>
                <div className="text-sm text-gray-600 font-medium">Sectors</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Unified Filters Sidebar */}
          <motion.div 
            className="lg:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <InvestmentFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={true}
              />

              {/* Quick Categories - Integrated */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Categories</h3>
                <div className="space-y-2">
                  {INVESTMENT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: category.name }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === category.name
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'hover:bg-neutral-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-2 text-lg">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Investment Grid */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
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
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div 
        className="bg-black text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to <span className="text-yellow-400">Invest in Uganda</span>?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of investors who have already discovered the potential of Uganda&apos;s growing economy
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/investments/onboarding">
                <Button variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8">
                  Contact Our Team
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}