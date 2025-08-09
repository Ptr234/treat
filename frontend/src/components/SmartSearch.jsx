import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  FireIcon
} from '@heroicons/react/24/outline'

const SmartSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [popularSearches, setPopularSearches] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Load search data
  useEffect(() => {
    // Load recent searches
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    setRecentSearches(recent.slice(0, 5))

    // Set popular searches (would normally come from analytics)
    setPopularSearches([
      { term: 'business registration', category: 'Services', trend: '+24%' },
      { term: 'investment opportunities', category: 'Investments', trend: '+18%' },
      { term: 'URA tax services', category: 'Services', trend: '+31%' },
      { term: 'tourism investment', category: 'Investments', trend: '+15%' },
      { term: 'URSB company registration', category: 'Services', trend: '+28%' },
      { term: 'agriculture investment', category: 'Investments', trend: '+22%' },
      { term: 'ROI calculator', category: 'Tools', trend: '+19%' },
      { term: 'trading license', category: 'Services', trend: '+33%' }
    ])
  }, [])

  // Smart search database
  const searchDatabase = useMemo(() => ([
    // Investments
    { title: 'Investment Opportunities', path: '/investments', category: 'Investments', keywords: ['investment', 'invest', 'opportunities', 'sector', 'roi', 'returns'] },
    { title: 'Agriculture Investments', path: '/investments?sector=agriculture', category: 'Investments', keywords: ['agriculture', 'farming', 'agribusiness', 'crops'] },
    { title: 'Tourism Investments', path: '/investments?sector=tourism', category: 'Investments', keywords: ['tourism', 'hotel', 'hospitality', 'travel'] },
    { title: 'Mining Investments', path: '/investments?sector=mining', category: 'Investments', keywords: ['mining', 'minerals', 'gold', 'copper'] },
    { title: 'ICT Investments', path: '/investments?sector=ict', category: 'Investments', keywords: ['ict', 'technology', 'software', 'digital'] },
    { title: 'Manufacturing Investments', path: '/investments?sector=manufacturing', category: 'Investments', keywords: ['manufacturing', 'industry', 'production', 'factory'] },
    
    // Services
    { title: 'Government Services', path: '/services', category: 'Services', keywords: ['services', 'government', 'official', 'application'] },
    { title: 'Business Registration', path: '/services?category=Business Registration & Licensing', category: 'Services', keywords: ['business registration', 'company registration', 'ursb', 'license'] },
    { title: 'Tax Services', path: '/services?category=Tax & Revenue Services', category: 'Services', keywords: ['tax', 'ura', 'tin', 'vat', 'revenue'] },
    { title: 'Investment Support Services', path: '/services?category=Investment Support', category: 'Services', keywords: ['investment support', 'investor services', 'uia'] },
    
    // Tools & Calculators
    { title: 'ROI Calculator', path: '/roi-calculator', category: 'Tools', keywords: ['roi', 'calculator', 'returns', 'investment calculator'] },
    { title: 'Tax Calculator', path: '/calculator', category: 'Tools', keywords: ['tax calculator', 'calculate tax', 'tax computation'] },
    { title: 'Business Tools', path: '/tools', category: 'Tools', keywords: ['tools', 'business tools', 'calculators'] },
    { title: 'Invoice Generator', path: '/invoice', category: 'Tools', keywords: ['invoice', 'billing', 'receipt'] },
    
    // Registration & Onboarding
    { title: 'Business Registration Wizard', path: '/registration-wizard', category: 'Registration', keywords: ['registration wizard', 'register business', 'setup business'] },
    { title: 'Investment Onboarding', path: '/investment-onboarding', category: 'Registration', keywords: ['investment onboarding', 'investor registration'] },
    
    // Information & Support
    { title: 'Government Agencies', path: '/agencies', category: 'Directory', keywords: ['agencies', 'contacts', 'directory', 'government contacts'] },
    { title: 'Downloads & Resources', path: '/downloads', category: 'Resources', keywords: ['downloads', 'resources', 'documents', 'forms'] },
    { title: 'Support Center', path: '/support', category: 'Support', keywords: ['support', 'help', 'assistance', 'faq'] },
    { title: 'About Uganda', path: '/about', category: 'Information', keywords: ['about', 'uganda', 'overview', 'information'] }
  ]), [])

  // Generate suggestions based on query
  useEffect(() => {
    if (query.trim().length > 0) {
      const queryLower = query.toLowerCase()
      const matches = searchDatabase.filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.keywords.some(keyword => keyword.includes(queryLower))
      ).slice(0, 8)
      
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }, [query, searchDatabase])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (searchTerm, path = null) => {
    if (path) {
      // Direct navigation
      navigate(path)
    } else {
      // General search - go to search page
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
    
    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    const newRecent = [searchTerm, ...recent.filter(term => term !== searchTerm)].slice(0, 10)
    localStorage.setItem('recent_searches', JSON.stringify(newRecent))
    
    // Track search
    if (window.trackHelp) {
      window.trackHelp('search', { query: searchTerm, timestamp: Date.now() })
    }
    
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      if (suggestions.length > 0) {
        handleSearch(suggestions[0].title, suggestions[0].path)
      } else {
        handleSearch(query)
      }
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search investments, services, tools..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all text-lg"
                />
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Suggestions
                </h3>
                <div className="space-y-1">
                  {suggestions.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(item.title, item.path)}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {query.length === 0 && popularSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                  <FireIcon className="w-4 h-4 mr-2 text-orange-500" />
                  Trending Searches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {popularSearches.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(item.term)}
                      className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition-colors text-left group"
                    >
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-orange-600 text-sm">
                          {item.term}
                        </p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">{item.trend}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-4 border-t border-gray-200/50">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && (
              <div className="p-8 text-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No results found for "{query}"</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search anyway
                </button>
              </div>
            )}
          </div>

          {/* Search Tips */}
          {query.length === 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200/50">
              <p className="text-xs text-gray-600 text-center">
                💡 <strong>Pro tip:</strong> Try searching for "business registration", "investment opportunities", or "tax calculator"
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartSearch