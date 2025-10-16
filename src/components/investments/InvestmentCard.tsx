'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InvestmentOpportunity } from '../../types';
import { Phone, Mail, Globe, MapPin, TrendingUp, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleContactAction = (type: 'phone' | 'email' | 'website', e: React.MouseEvent) => {
    e.stopPropagation();
    const contact = investment.contact;
    
    switch (type) {
      case 'phone':
        window.open(`tel:${contact.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${contact.email}?subject=Investment Inquiry - ${investment.title}`, '_self');
        break;
      case 'website':
        window.open(contact.website, '_blank');
        break;
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
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer border border-gray-200 hover:border-green-300 ${
          onSelect ? 'hover:bg-green-50' : ''
        }`}
        onClick={() => onSelect?.(investment)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Logo and Basic Info */}
          <div className="flex items-center gap-4 lg:min-w-0 lg:flex-1">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {getSectorIcon(investment.sector)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {investment.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(investment.priority)}`}>
                  {investment.priority.charAt(0).toUpperCase() + investment.priority.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{investment.category}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{investment.description}</p>
            </div>
          </div>

          {/* Investment Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-0 lg:flex-shrink-0">
            <div className="text-center">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900">{investment.investmentRange}</p>
              <p className="text-xs text-gray-500">Investment Range</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900">{investment.expectedROI}</p>
              <p className="text-xs text-gray-500">Expected ROI</p>
            </div>
            <div className="text-center">
              <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900">{investment.timeline}</p>
              <p className="text-xs text-gray-500">Timeline</p>
            </div>
            <div className="text-center">
              <MapPin className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900">{investment.contact.agency.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">Contact Agency</p>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex gap-2 lg:flex-shrink-0">
            <button
              onClick={(e) => handleContactAction('phone', e)}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title={`Call ${investment.contact.phone}`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => handleContactAction('email', e)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title={`Email ${investment.contact.email}`}
            >
              <Mail className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => handleContactAction('website', e)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title={`Visit ${investment.contact.website}`}
            >
              <Globe className="w-5 h-5" />
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
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-green-300 group ${
        onSelect ? 'hover:bg-green-50' : ''
      }`}
      onClick={() => onSelect?.(investment)}
    >
      {/* Header with Logo and Priority */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
            {getSectorIcon(investment.sector)}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(investment.priority)}`}>
            {investment.priority.charAt(0).toUpperCase() + investment.priority.slice(1)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
          {investment.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">{investment.category}</p>
        
        <p className="text-sm text-gray-700 line-clamp-3 mb-4">
          {investment.description}
        </p>
      </div>

      {/* Investment Metrics */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Investment Range</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{investment.investmentRange}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-500">Expected ROI</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{investment.expectedROI}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-500">Timeline</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{investment.timeline}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-500">Agency</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{investment.contact.agency.split(' ')[0]}</p>
          </div>
        </div>

        {/* Risk Factors (if available) */}
        {investment.riskFactors && investment.riskFactors.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500 font-medium">Key Risks</p>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {investment.riskFactors[0]}
            </p>
          </div>
        )}
      </div>

      {/* Contact Actions */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-600">
            Contact: {investment.contact.agency.split(' ')[0]}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => handleContactAction('phone', e)}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title={`Call ${investment.contact.phone}`}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleContactAction('email', e)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title={`Email ${investment.contact.email}`}
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleContactAction('website', e)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              title={`Visit ${investment.contact.website}`}
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};