'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InvestmentOpportunity } from '../../types';
import { MapPin, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface InvestmentCardProps {
  investment: InvestmentOpportunity;
  index: number;
  viewMode: 'grid' | 'list';
  onSelect?: (investment: InvestmentOpportunity) => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ 
  investment, 
  index, 
  viewMode = 'grid',
  onSelect 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'medium': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'low': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'agriculture': return '🌾';
      case 'tourism': return '🦁';
      case 'minerals': return '⛏️';
      case 'ict': return '💻';
      case 'manufacturing': return '🏭';
      case 'energy': return '⚡';
      default: return '🏢';
    }
  };


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-neutral-200 hover:border-yellow-300 group ${
          onSelect ? 'hover:bg-yellow-50' : ''
        }`}
        onClick={() => onSelect?.(investment)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Image and Basic Info */}
          <div className="flex items-center gap-4 lg:min-w-0 lg:flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border border-yellow-300">
              {getSectorIcon(investment.sector)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-yellow-800 transition-colors">
                  {investment.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(investment.priority)}`}>
                  {investment.priority.charAt(0).toUpperCase() + investment.priority.slice(1)}
                </span>
              </div>
              <p className="text-sm font-medium text-yellow-600 mb-2">{investment.category}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{investment.description}</p>
            </div>
          </div>

          {/* Investment Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-0 lg:flex-shrink-0">
            <div className="text-center p-3 bg-neutral-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-bold text-gray-900">{investment.investmentRange}</p>
              <p className="text-xs text-gray-600 font-medium">Investment</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-bold text-gray-900">{investment.expectedROI}</p>
              <p className="text-xs text-gray-600 font-medium">Est. ROI</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-bold text-gray-900">{investment.timeline}</p>
              <p className="text-xs text-gray-600 font-medium">Timeline</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-bold text-gray-900">{investment.contact.agency.split(' ')[0]}</p>
              <p className="text-xs text-gray-600 font-medium">Agency</p>
            </div>
          </div>

          {/* View Details Button - appears on hover */}
          <div className="lg:flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(investment);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-neutral-200 hover:border-yellow-300 group relative ${
        onSelect ? 'hover:bg-yellow-50' : ''
      }`}
      onClick={() => onSelect?.(investment)}
    >
      {/* Premium Image Header */}
      <div className="h-48 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getPriorityColor(investment.priority)} bg-white/90`}>
            {investment.priority.charAt(0).toUpperCase() + investment.priority.slice(1)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-4xl">
          {getSectorIcon(investment.sector)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-800 transition-colors">
          {investment.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
          <p className="text-sm font-semibold text-yellow-600">{investment.category}</p>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-3 mb-6">
          {investment.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-yellow-200">
            <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Investment</p>
              <p className="text-sm font-bold text-gray-900">{investment.investmentRange}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-yellow-200">
            <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Est. ROI</p>
              <p className="text-sm font-bold text-gray-900">{investment.expectedROI}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-yellow-200">
            <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Timeline</p>
              <p className="text-sm font-bold text-gray-900">{investment.timeline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-yellow-200">
            <div className="w-8 h-8 border-2 border-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Agency</p>
              <p className="text-sm font-bold text-gray-900">{investment.contact.agency.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* View Details Button - Hidden until hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(investment);
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};