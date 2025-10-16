import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for services, agencies, documents, and information across OneStopCentre Uganda.',
};

export default function SearchPage() {
  // Mock search results - will be replaced with real search functionality in Phase 3
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
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      ),
      count: '150+ services'
    },
    {
      title: 'Agencies',
      description: 'Government agencies and departments',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      count: '25+ agencies'
    },
    {
      title: 'Documents',
      description: 'Forms, guides, and templates',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: '200+ documents'
    },
    {
      title: 'Help & Guides',
      description: 'Tutorials and step-by-step guides',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: '50+ guides'
    }
  ];

  const mockResults = [
    {
      title: 'Business Registration Process',
      type: 'Service',
      description: 'Complete guide to registering your business in Uganda, including required documents and fees.',
      url: '/business/registration',
      relevance: 95
    },
    {
      title: 'Uganda Registration Services Bureau (URSB)',
      type: 'Agency',
      description: 'Official agency responsible for business registration and intellectual property.',
      url: '/agencies/ursb',
      relevance: 92
    },
    {
      title: 'Company Registration Form',
      type: 'Document',
      description: 'Official form for registering a new company in Uganda (PDF, 2.1 MB)',
      url: '/downloads/company-registration-form.pdf',
      relevance: 88
    },
    {
      title: 'How to Choose a Business Structure',
      type: 'Guide',
      description: 'Comprehensive guide on different business structures and their benefits.',
      url: '/guides/business-structures',
      relevance: 85
    }
  ];

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
              type="text"
              placeholder="Search for services, agencies, documents..."
              className="w-full px-6 py-4 pr-14 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Search Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium">
              All
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
              Services
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
              Agencies
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
              Documents
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
              Guides
            </button>
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

        {/* Mock Search Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
            <p className="text-gray-600 text-sm">Showing 4 results for &quot;business registration&quot;</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {mockResults.map((result, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Link href={result.url as never} className="text-xl font-semibold text-primary-600 hover:text-primary-700">
                          {result.title}
                        </Link>
                        <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{result.description}</p>
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
            
            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded text-gray-500 text-sm">
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

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
                    className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                    className="flex items-center w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
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