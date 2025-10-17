import { useState, useMemo, useCallback } from 'react';
import { ugandaAgencies } from '@/data/agencies';
import investmentOpportunities from '@/data/investment-opportunities.json';

export type SearchResult = {
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

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Get filtered suggestions based on query
  const getSuggestions = (query: string): string[] => {
    if (query.length < 2) return [];
    
    return allSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  // Perform search across all data sources with performance optimization
  const performSearch = useCallback((query: string, filter: string = 'All'): SearchResult[] => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
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
      },
      {
        id: 'env-permit',
        title: 'Environmental Impact Assessment',
        type: 'Service' as const,
        description: 'Get your Environmental Impact Assessment certificate from NEMA for your project.',
        url: '/services/environmental-permit',
        category: 'Environment'
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
    
    if (filter !== 'All') {
      filteredResults = filteredResults.filter(result => {
        if (filter === 'Services') return result.type === 'Service';
        if (filter === 'Agencies') return result.type === 'Agency';
        if (filter === 'Investments') return result.type === 'Investment';
        if (filter === 'Documents') return result.type === 'Document';
        if (filter === 'Guides') return result.type === 'Guide';
        return true;
      });
    }

    setSearchResults(filteredResults);
    setIsSearching(false);
    return filteredResults;
  }, []);

  const clearSearch = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    performSearch,
    getSuggestions,
    clearSearch,
    allSuggestions
  };
};