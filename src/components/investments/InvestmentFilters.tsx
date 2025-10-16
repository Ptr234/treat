'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building,
  Target,
  RotateCcw
} from 'lucide-react';
import { 
  INVESTMENT_CATEGORIES, 
  INVESTMENT_SECTORS, 
  PRIORITY_LEVELS,
  INVESTMENT_RANGES,
  ROI_RANGES,
  TIMELINE_RANGES 
} from '../../data/investments/categories';

export interface InvestmentFilters {
  category: string;
  sector: string;
  priority: string;
  investmentRange: string;
  roiRange: string;
  timelineRange: string;
  searchQuery: string;
}

interface InvestmentFiltersProps {
  filters: InvestmentFilters;
  onFiltersChange: (filters: InvestmentFilters) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const InvestmentFiltersComponent: React.FC<InvestmentFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen = false,
  onToggle,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  const updateFilter = (key: keyof InvestmentFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      sector: 'all',
      priority: 'all',
      investmentRange: 'all',
      roiRange: 'all',
      timelineRange: 'all',
      searchQuery: ''
    });
  };

  const getActiveFiltersCount = () => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => 
      key !== 'searchQuery' && value !== 'all' && value !== ''
    );
    return activeFilters.length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          onToggle?.();
        }}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Filters Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-6">
              {/* Category Filter */}
              <FilterSection title="Category" icon={Building}>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Categories</option>
                  {INVESTMENT_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Sector Filter */}
              <FilterSection title="Sector" icon={Target}>
                <select
                  value={filters.sector}
                  onChange={(e) => updateFilter('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  {INVESTMENT_SECTORS.map((sector) => (
                    <option key={sector} value={sector.toLowerCase()}>
                      {sector}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Priority Filter */}
              <FilterSection title="Priority Level" icon={Target}>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_LEVELS.map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => updateFilter('priority', priority.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        filters.priority === priority.value
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Investment Range Filter */}
              <FilterSection title="Investment Range" icon={DollarSign}>
                <div className="space-y-2">
                  {INVESTMENT_RANGES.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="investmentRange"
                        value={range.value}
                        checked={filters.investmentRange === range.value}
                        onChange={(e) => updateFilter('investmentRange', e.target.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* ROI Range Filter */}
              <FilterSection title="Expected ROI" icon={TrendingUp}>
                <div className="space-y-2">
                  {ROI_RANGES.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="roiRange"
                        value={range.value}
                        checked={filters.roiRange === range.value}
                        onChange={(e) => updateFilter('roiRange', e.target.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Timeline Filter */}
              <FilterSection title="Timeline" icon={Calendar}>
                <div className="space-y-2">
                  {TIMELINE_RANGES.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="timelineRange"
                        value={range.value}
                        checked={filters.timelineRange === range.value}
                        onChange={(e) => updateFilter('timelineRange', e.target.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Active Filters ({activeFiltersCount})
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (key === 'searchQuery' || value === 'all' || value === '') return null;
                      
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {value}
                          <button
                            onClick={() => updateFilter(key as keyof InvestmentFilters, 'all')}
                            className="hover:bg-green-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};