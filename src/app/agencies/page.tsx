'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BuildingOfficeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { ugandaAgencies, getAgencyByCategory } from '@/data/agencies';
import AgencyCard from '@/components/agencies/AgencyCard';
import { useDebouncedSearch } from '@/hooks/useDebounce';

export default function AgenciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  
  const { debouncedValue: debouncedSearch, isSearching } = useDebouncedSearch(searchQuery, 300);

  const categories = [
    { value: 'all', label: 'All Agencies', count: ugandaAgencies.length },
    { value: 'investment', label: 'Investment', count: getAgencyByCategory('investment').length },
    { value: 'registration', label: 'Registration', count: getAgencyByCategory('registration').length },
    { value: 'taxation', label: 'Taxation', count: getAgencyByCategory('taxation').length },
    { value: 'environment', label: 'Environment', count: getAgencyByCategory('environment').length },
    { value: 'standards', label: 'Standards', count: getAgencyByCategory('standards').length },
    { value: 'infrastructure', label: 'Infrastructure', count: getAgencyByCategory('infrastructure').length }
  ];

  const urgencyLevels = [
    { value: 'all', label: 'All Priority Levels' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Standard Priority' }
  ];

  const filteredAgencies = useMemo(() => {
    let filtered = ugandaAgencies;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agency => agency.category === selectedCategory);
    }

    // Filter by urgency
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(agency => agency.urgencyLevel === selectedUrgency);
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(agency =>
        agency.name.toLowerCase().includes(query) ||
        agency.acronym.toLowerCase().includes(query) ||
        agency.description.toLowerCase().includes(query) ||
        agency.services.some(service => service.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, selectedUrgency, debouncedSearch]);

  const stats = {
    totalAgencies: ugandaAgencies.length,
    highPriority: ugandaAgencies.filter(a => a.urgencyLevel === 'high').length,
    withAppointments: ugandaAgencies.filter(a => a.hasAppointmentBooking).length,
    avgResponseTime: '24 hours'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Uganda Government Agencies
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Direct access to all government agencies for your business needs. 
              Contact officials, book appointments, and get the support you need.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.totalAgencies}</div>
                <div className="text-sm text-blue-100">Total Agencies</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.highPriority}</div>
                <div className="text-sm text-blue-100">High Priority</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.withAppointments}</div>
                <div className="text-sm text-blue-100">Book Appointments</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                <div className="text-sm text-blue-100">Avg Response</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agencies, services, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || selectedUrgency !== 'all' || debouncedSearch) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Category: {categories.find(c => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedUrgency !== 'all' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Priority: {urgencyLevels.find(l => l.value === selectedUrgency)?.label}
                  <button
                    onClick={() => setSelectedUrgency('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: &ldquo;{debouncedSearch}&rdquo;
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredAgencies.length === ugandaAgencies.length 
              ? 'All Government Agencies' 
              : `${filteredAgencies.length} ${filteredAgencies.length === 1 ? 'Agency' : 'Agencies'} Found`
            }
          </h2>
          
          <div className="text-sm text-gray-600">
            Showing {filteredAgencies.length} of {ugandaAgencies.length} agencies
          </div>
        </div>

        {/* Emergency Contact Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <PhoneIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-900">Need Urgent Assistance?</h3>
                <p className="text-sm text-red-700">Contact UIA directly for immediate investment support</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href="tel:+256414301000"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Call Now
              </a>
              <a
                href="mailto:info@ugandainvestment.go.ug"
                className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Agencies Grid */}
        {filteredAgencies.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAgencies.map((agency, index) => (
              <motion.div
                key={agency.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AgencyCard agency={agency} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedUrgency('all');
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Additional Resources */}
        <div className="mt-12 bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/downloads"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-gray-900">Forms & Documents</h4>
              <p className="text-sm text-gray-600 mt-1">Download required forms and application documents</p>
            </a>
            <a
              href="/tools"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-gray-900">Business Tools</h4>
              <p className="text-sm text-gray-600 mt-1">Calculators and planning tools for your business</p>
            </a>
            <a
              href="/support"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-gray-900">Get Support</h4>
              <p className="text-sm text-gray-600 mt-1">Need help? Contact our support team</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}