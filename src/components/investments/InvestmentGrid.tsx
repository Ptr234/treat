'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvestmentOpportunity } from '../../types';
import { InvestmentCard } from './InvestmentCard';
import { Grid3x3, List, Search, SortAsc, SortDesc, Loader2 } from 'lucide-react';

interface InvestmentGridProps {
  investments: InvestmentOpportunity[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onInvestmentSelect?: (investment: InvestmentOpportunity) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: 'title' | 'priority' | 'roi' | 'timeline' | 'investmentRange';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  showFilters?: boolean;
  className?: string;
}

export const InvestmentGrid: React.FC<InvestmentGridProps> = ({
  investments,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  onInvestmentSelect,
  searchQuery = '',
  onSearchChange,
  sortBy = 'priority',
  sortOrder = 'desc',
  onSortChange,
  showFilters = true,
  className = ''
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Filter and sort investments
  const processedInvestments = useMemo(() => {
    let filtered = investments;

    // Apply search filter
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      filtered = investments.filter(investment =>
        investment.title.toLowerCase().includes(query) ||
        investment.description.toLowerCase().includes(query) ||
        investment.category.toLowerCase().includes(query) ||
        investment.sector.toLowerCase().includes(query) ||
        investment.contact.agency.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'roi':
          // Extract first number from ROI string for sorting
          aValue = parseFloat(a.expectedROI.match(/\d+/)?.[0] || '0');
          bValue = parseFloat(b.expectedROI.match(/\d+/)?.[0] || '0');
          break;
        case 'timeline':
          // Extract first number from timeline string for sorting
          aValue = parseFloat(a.timeline.match(/\d+/)?.[0] || '0');
          bValue = parseFloat(b.timeline.match(/\d+/)?.[0] || '0');
          break;
        case 'investmentRange':
          // Extract first number from investment range for sorting
          aValue = parseFloat(a.investmentRange.match(/\d+/)?.[0] || '0');
          bValue = parseFloat(b.investmentRange.match(/\d+/)?.[0] || '0');
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        const numA = typeof aValue === 'number' ? aValue : 0;
        const numB = typeof bValue === 'number' ? bValue : 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });

    return sorted;
  }, [investments, localSearchQuery, sortBy, sortOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange?.(sortBy, newOrder);
    } else {
      // New field, start with desc for priority, asc for others
      const newOrder = newSortBy === 'priority' ? 'desc' : 'asc';
      onSortChange?.(newSortBy, newOrder);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading investment opportunities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header with controls */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search investments..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="roi">Expected ROI</option>
              <option value="timeline">Timeline</option>
              <option value="investmentRange">Investment Range</option>
            </select>
            <button
              onClick={() => handleSortChange(sortBy)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {getSortIcon(sortBy) || <SortAsc className="w-4 h-4" />}
            </button>
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {processedInvestments.length} investment{processedInvestments.length !== 1 ? 's' : ''} found
          {localSearchQuery && ` for "${localSearchQuery}"`}
        </p>
      </div>

      {/* Investment Grid/List */}
      <AnimatePresence mode="wait">
        {processedInvestments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
            <p className="text-gray-600 mb-4">
              {localSearchQuery 
                ? `No investments match your search for "${localSearchQuery}"`
                : 'No investment opportunities are currently available'
              }
            </p>
            {localSearchQuery && (
              <button
                onClick={() => {
                  setLocalSearchQuery('');
                  onSearchChange?.('');
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {processedInvestments.map((investment, index) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                index={index}
                viewMode={viewMode}
                onSelect={onInvestmentSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};