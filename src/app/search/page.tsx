'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Settings, Building2, FileText, HelpCircle, Search, Star, Phone, Mail, ExternalLink, Clock, Zap } from 'lucide-react';
import { ugandaAgencies } from '@/data/agencies';
import investmentOpportunities from '@/data/investment-opportunities.json';

// export const metadata: Metadata = {
//   title: 'Search',
//   description: 'Search for services, agencies, documents, and information across OneStopCentre Uganda.',
// };

type SearchResult = {
  id: string;
  title: string;
  type: 'Agency' | 'Service' | 'Investment' | 'Document' | 'Guide';
  description: string;
  url: string;
  relevance: number;
  category?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  metadata?: {
    roi?: string;
    investmentRange?: string;
    timeline?: string;
    priority?: string;
  };
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const recentSearches = [
    'business registration',
    'tax certificate',
    'investment license',
    'UIA contact',
    'company registration fees'
  ];

  const popularSearches = [
    'How to register a business',
    'Investment incentives Uganda',
    'Tax registration requirements',
    'Business license application',
    'Foreign investment rules',
    'Company name reservation',
    'VAT registration process',
    'Investment opportunities'
  ];

  const searchCategories = [
    {
      title: 'Services',
      description: 'Find government services and procedures',
      icon: <Settings className="w-8 h-8 text-blue-600" />,
      count: '150+ services'
    },
    {
      title: 'Agencies',
      description: 'Government agencies and departments',
      icon: <Building2 className="w-8 h-8 text-green-600" />,
      count: '25+ agencies'
    },
    {
      title: 'Documents',
      description: 'Forms, guides, and templates',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      count: '200+ documents'
    },
    {
      title: 'Help & Guides',
      description: 'Tutorials and step-by-step guides',
      icon: <HelpCircle className="w-8 h-8 text-orange-600" />,
      count: '50+ guides'
    }
  ];

  // Generate search suggestions based on available data
  const allSuggestions = useMemo(() => {
    const agencySuggestions = ugandaAgencies.flatMap(agency => [
      agency.name,
      agency.acronym,
      ...agency.services.slice(0, 2), // Limit services to avoid too many suggestions
      agency.category.replace('_', ' ')
    ]);
    
    const investmentSuggestions = investmentOpportunities.flatMap(opp => [
      opp.title,
      opp.category,
      opp.agency
    ]);
    
    const serviceSuggestions = [
      'business registration',
      'tax certificate',
      'investment license',
      'company registration',
      'work permit',
      'environmental permit',
      'import license',
      'export license'
    ];
    
    return [...new Set([...agencySuggestions, ...investmentSuggestions, ...serviceSuggestions])];
  }, []);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, allSuggestions]);

  // Perform search across all data sources
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search agencies
    ugandaAgencies.forEach(agency => {
      let relevance = 0;
      const titleMatch = agency.name.toLowerCase().includes(lowerQuery);
      const acronymMatch = agency.acronym.toLowerCase().includes(lowerQuery);
      const descMatch = agency.description.toLowerCase().includes(lowerQuery);
      const serviceMatch = agency.services.some(service => 
        service.toLowerCase().includes(lowerQuery)
      );

      if (titleMatch) relevance += 40;
      if (acronymMatch) relevance += 35;
      if (descMatch) relevance += 20;
      if (serviceMatch) relevance += 30;

      if (relevance > 0) {
        results.push({
          id: agency.id,
          title: `${agency.name} (${agency.acronym})`,
          type: 'Agency',
          description: agency.description,
          url: `/agencies#${agency.id}`,
          relevance,
          category: agency.category.replace('_', ' '),
          contact: {
            email: agency.contact.email,
            phone: agency.contact.phone,
            website: agency.contact.website
          }
        });
      }
    });

    // Search investment opportunities
    investmentOpportunities.forEach(opp => {
      let relevance = 0;
      const titleMatch = opp.title.toLowerCase().includes(lowerQuery);
      const categoryMatch = opp.category.toLowerCase().includes(lowerQuery);
      const descMatch = opp.description.toLowerCase().includes(lowerQuery);
      const agencyMatch = opp.agency.toLowerCase().includes(lowerQuery);

      if (titleMatch) relevance += 40;
      if (categoryMatch) relevance += 30;
      if (descMatch) relevance += 20;
      if (agencyMatch) relevance += 25;

      if (relevance > 0) {
        results.push({
          id: opp.id.toString(),
          title: opp.title,
          type: 'Investment',
          description: opp.description,
          url: `/investments/${opp.id}`,
          relevance,
          category: opp.category,
          contact: {
            email: opp.contact.email,
            phone: opp.contact.phone,
            website: opp.contact.website
          },
          metadata: {
            roi: opp.roi,
            investmentRange: opp.investmentRange,
            timeline: opp.timeline,
            priority: opp.priority
          }
        });
      }
    });

    // Add some mock service results
    const mockServices = [
      {
        id: 'business-reg',
        title: 'Business Registration Process',
        type: 'Service' as const,
        description: 'Complete guide to registering your business in Uganda, including required documents and fees.',
        url: '/business/registration',
        category: 'Registration'
      },
      {
        id: 'tax-cert',
        title: 'Tax Registration Certificate',
        type: 'Service' as const,
        description: 'Obtain your Tax Identification Number (TIN) and tax registration certificate from URA.',
        url: '/services/tax-registration',
        category: 'Taxation'
      },
      {
        id: 'work-permit',
        title: 'Work Permit Application',
        type: 'Service' as const,
        description: 'Apply for work permits and special passes for foreign employees in Uganda.',
        url: '/services/work-permit',
        category: 'Immigration'
      }
    ];

    mockServices.forEach(service => {
      const titleMatch = service.title.toLowerCase().includes(lowerQuery);
      const descMatch = service.description.toLowerCase().includes(lowerQuery);
      const categoryMatch = service.category.toLowerCase().includes(lowerQuery);

      let relevance = 0;
      if (titleMatch) relevance += 40;
      if (descMatch) relevance += 20;
      if (categoryMatch) relevance += 30;

      if (relevance > 0) {
        results.push({
          ...service,
          relevance
        });
      }
    });

    // Sort by relevance and filter by selected type
    let filteredResults = results.sort((a, b) => b.relevance - a.relevance);
    
    if (selectedFilter !== 'All') {
      filteredResults = filteredResults.filter(result => {
        if (selectedFilter === 'Services') return result.type === 'Service';
        if (selectedFilter === 'Agencies') return result.type === 'Agency';
        if (selectedFilter === 'Investments') return result.type === 'Investment';
        return true;
      });
    }

    setSearchResults(filteredResults);
  };

  const handleSearch = () => {
    performSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Search OneStopCentre
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find services, agencies, documents, and information to help with your business needs.
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
              placeholder="Search for services, agencies, investments..."
              aria-label="Search for services, agencies, and investment opportunities"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-controls="search-suggestions"
              role="combobox"
              autoComplete="off"
              className="w-full px-6 py-4 pr-14 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
            <button 
              onClick={handleSearch}
              aria-label="Search"
              className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                id="search-suggestions"
                role="listbox"
                aria-label="Search suggestions"
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    aria-selected="false"
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['All', 'Services', 'Agencies', 'Investments', 'Documents', 'Guides'].map((filter) => (
              <button 
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  if (searchQuery) performSearch(searchQuery);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Search Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {searchCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex justify-center mb-4">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {category.description}
              </p>
              <p className="text-primary-600 font-medium text-sm">
                {category.count}
              </p>
            </div>
          ))}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
              <p className="text-gray-600 text-sm">
                Showing {searchResults.length} results for &quot;{searchQuery}&quot;
                {selectedFilter !== 'All' && ` in ${selectedFilter}`}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Link href={result.url} className="text-xl font-semibold text-primary-600 hover:text-primary-700">
                            {result.title}
                          </Link>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                            result.type === 'Agency' ? 'bg-blue-100 text-blue-700' :
                            result.type === 'Investment' ? 'bg-green-100 text-green-700' :
                            result.type === 'Service' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {result.type}
                          </span>
                          {result.metadata?.priority && (
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                              result.metadata.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <Star className="w-3 h-3" />
                              {result.metadata.priority}
                            </span>
                          )}
                        </div>
                        
                        {result.category && (
                          <p className="text-sm text-gray-500 mb-1 capitalize">{result.category}</p>
                        )}
                        
                        <p className="text-gray-600 mb-3">{result.description}</p>
                        
                        {/* Investment metadata */}
                        {result.metadata && (
                          <div className="flex flex-wrap gap-4 mb-3">
                            {result.metadata.roi && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <Zap className="w-4 h-4" />
                                <span>ROI: {result.metadata.roi}</span>
                              </div>
                            )}
                            {result.metadata.investmentRange && (
                              <div className="flex items-center gap-1 text-sm text-blue-600">
                                <span>Investment: {result.metadata.investmentRange}</span>
                              </div>
                            )}
                            {result.metadata.timeline && (
                              <div className="flex items-center gap-1 text-sm text-purple-600">
                                <Clock className="w-4 h-4" />
                                <span>{result.metadata.timeline}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Contact information */}
                        {result.contact && (
                          <div className="flex flex-wrap gap-4 mb-3">
                            {result.contact.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{result.contact.phone}</span>
                              </div>
                            )}
                            {result.contact.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{result.contact.email}</span>
                              </div>
                            )}
                            {result.contact.website && (
                              <a 
                                href={result.contact.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="text-primary-600">{result.url}</span>
                          <span className="mx-2">•</span>
                          <span>{result.relevance}% relevant</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* No results message */}
        {searchQuery && searchResults.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center mb-8">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found for &quot;{searchQuery}&quot;
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse the categories below.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Searches</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      performSearch(search);
                    }}
                    className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Popular Searches</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      performSearch(search);
                    }}
                    className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4 text-gray-400 mr-3" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Tips */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Use specific keywords</h4>
              <p className="text-gray-600">Try &quot;business registration&quot; instead of &quot;register business&quot;</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Include location</h4>
              <p className="text-gray-600">Add &quot;Uganda&quot; or city names for location-specific results</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Use quotation marks</h4>
              <p className="text-gray-600">Search for exact phrases using &quot;quotation marks&quot;</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Filter by category</h4>
              <p className="text-gray-600">Use the filter buttons to narrow your search</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}