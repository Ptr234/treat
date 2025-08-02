import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { PageBackground } from '../utils/backgroundSystem.jsx'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Comprehensive and accurate search data with Uganda-specific services
  const searchData = useMemo(() => [
    // Tools
    { id: 1, title: 'Tax Calculator', description: 'Calculate PAYE, VAT, Corporate Tax, NSSF, and withholding tax obligations according to URA rates', category: 'tools', path: '/calculator', icon: '🧮' },
    { id: 2, title: 'ROI Calculator', description: 'Analyze investment returns, ATMS tax benefits, and financial projections for Uganda investments', category: 'tools', path: '/roi-calculator', icon: '📊' },
    { id: 3, title: 'Invoice Generator', description: 'Create professional VAT-compliant invoices with URA tax requirements', category: 'tools', path: '/invoice', icon: '📄' },
    { id: 4, title: 'Document Checklist', description: 'Complete checklist for business registration, licensing, and compliance requirements', category: 'tools', path: '/document-checklist', icon: '✅' },
    
    // Services  
    { id: 5, title: 'Business Registration Wizard', description: 'Step-by-step URSB company registration with all required documents and fees', category: 'services', path: '/registration-wizard', icon: '🏢' },
    { id: 6, title: 'URSB Services', description: 'Uganda Registration Services Bureau - company names, incorporation, and business licenses', category: 'services', path: '/services', icon: '🏛️' },
    { id: 7, title: 'URA Tax Services', description: 'Uganda Revenue Authority - tax registration, VAT, PAYE, corporate tax filing', category: 'services', path: '/services', icon: '💰' },
    { id: 8, title: 'UIA Investment Services', description: 'Uganda Investment Authority - investment licenses, ATMS incentives, and investor support', category: 'services', path: '/services', icon: '🎯' },
    { id: 9, title: 'Work Permits & Visas', description: 'Foreign employment permits, investor visas, and expatriate documentation', category: 'services', path: '/services', icon: '📋' },
    { id: 10, title: 'All Government Services', description: 'Complete directory of Uganda government services and agencies', category: 'services', path: '/services', icon: '🏛️' },
    
    // Investments by Sector
    { id: 11, title: 'Agriculture Investment', description: 'Farming, livestock, agro-processing opportunities with 10% ATMS tax credit', category: 'investments', path: '/investments?sector=agriculture', icon: '🌾' },
    { id: 12, title: 'Tourism Investment', description: 'Hotels, lodges, eco-tourism ventures with 15% ATMS tax credit', category: 'investments', path: '/investments?sector=tourism', icon: '🦒' },
    { id: 13, title: 'Manufacturing Investment', description: 'Industrial production, processing plants with 12% ATMS tax credit', category: 'investments', path: '/investments?sector=manufacturing', icon: '🏭' },
    { id: 14, title: 'ICT Investment', description: 'Software, fintech, telecommunications with 20% ATMS tax credit', category: 'investments', path: '/investments?sector=ict', icon: '💻' },
    { id: 15, title: 'Mining Investment', description: 'Gold, copper, mineral extraction with 8% ATMS tax credit', category: 'investments', path: '/investments?sector=mining', icon: '💎' },
    { id: 16, title: 'All Investment Sectors', description: 'Complete overview of Uganda investment opportunities and ATMS incentives', category: 'investments', path: '/investments', icon: '💰' },
    
    // Resources & Downloads
    { id: 17, title: 'Tax Guide 2024/2025', description: 'Official URA tax rates, PAYE bands, VAT regulations, and compliance requirements', category: 'resources', path: '/downloads', icon: '📚' },
    { id: 18, title: 'Business Registration Forms', description: 'URSB company registration forms, name reservation, and incorporation documents', category: 'resources', path: '/downloads', icon: '📝' },
    { id: 19, title: 'Investment Incentives Guide', description: 'ATMS tax credits, sector-specific benefits, and investment promotion schemes', category: 'resources', path: '/downloads', icon: '🎁' },
    { id: 20, title: 'Work Permit Application Forms', description: 'Foreign employment permit applications and expatriate documentation', category: 'resources', path: '/downloads', icon: '📋' },
    { id: 21, title: 'All Resources & Downloads', description: 'Complete library of Uganda business forms, guides, and official documents', category: 'resources', path: '/downloads', icon: '📁' },
    
    // Support & Help
    { id: 22, title: 'Government Agencies Directory', description: 'Complete directory of Uganda ministries, authorities, and government bodies', category: 'support', path: '/agencies', icon: '🏛️' },
    { id: 23, title: 'Business Support & Consultation', description: 'Connect with certified business consultants and legal experts', category: 'support', path: '/support', icon: '🤝' },
    { id: 24, title: 'FAQ & Common Questions', description: 'Frequently asked questions about Uganda business, taxes, and investments', category: 'support', path: '/support', icon: '❓' },
    { id: 25, title: 'Contact & Help Center', description: '24/7 support, query submission, and application tracking', category: 'support', path: '/support', icon: '💬' },
    
    // Specific Government Entities
    { id: 26, title: 'NSSF Services', description: 'National Social Security Fund registration and contributions', category: 'services', path: '/services', icon: '🛡️' },
    { id: 27, title: 'UCC Licensing', description: 'Uganda Communications Commission licenses for telecom and broadcasting', category: 'services', path: '/services', icon: '📡' },
    { id: 28, title: 'NEMA Environmental Impact', description: 'National Environment Management Authority permits and assessments', category: 'services', path: '/services', icon: '🌍' },
    { id: 29, title: 'UNBS Standards & Certification', description: 'Uganda National Bureau of Standards quality certification', category: 'services', path: '/services', icon: '🏅' },
    { id: 30, title: 'Bank of Uganda Licensing', description: 'Central bank licenses for financial institutions and forex bureaus', category: 'services', path: '/services', icon: '🏦' }
  ], [])

  const categories = [
    { id: 'all', name: 'All Results', icon: '🔍' },
    { id: 'tools', name: 'Tools', icon: '🛠️' },
    { id: 'services', name: 'Services', icon: '🏛️' },
    { id: 'investments', name: 'Investments', icon: '💰' },
    { id: 'resources', name: 'Resources', icon: '📁' },
    { id: 'support', name: 'Support', icon: '🤝' }
  ]

  // Enhanced search with comprehensive matching and synonyms
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0)
    
    // Comprehensive synonym mapping for Uganda-specific terms
    const synonymMap = {
      'calc': ['calculator', 'calculate', 'computation'],
      'calculator': ['calc', 'compute', 'calculation'],
      'tax': ['revenue', 'ura', 'taxation', 'duty', 'levy'],
      'business': ['company', 'enterprise', 'firm', 'corporation', 'startup'],
      'investment': ['invest', 'investor', 'capital', 'funding', 'finance'],
      'agriculture': ['farming', 'agro', 'crop', 'livestock', 'agribusiness'],
      'tourism': ['travel', 'hospitality', 'hotel', 'safari', 'eco-tourism'],
      'manufacturing': ['production', 'factory', 'industry', 'processing'],
      'ict': ['technology', 'software', 'digital', 'it', 'tech', 'telecom'],
      'mining': ['minerals', 'extraction', 'gold', 'copper'],
      'registration': ['register', 'licensing', 'permit', 'application'],
      'ursb': ['registration', 'business registration', 'company registration'],
      'ura': ['tax', 'revenue', 'taxation', 'customs'],
      'uia': ['investment', 'authority', 'investor'],
      'work permit': ['employment', 'foreign worker', 'expatriate'],
      'roi': ['return', 'profit', 'profitability', 'returns'],
      'invoice': ['bill', 'receipt', 'billing', 'invoicing'],
      'document': ['docs', 'papers', 'documentation', 'files'],
      'checklist': ['requirements', 'list', 'todo', 'steps'],
      'support': ['help', 'assistance', 'customer service', 'contact'],
      'agency': ['agencies', 'government', 'ministry', 'authority'],
      'atms': ['incentives', 'tax credit', 'benefits', 'agriculture tourism manufacturing services']
    }

    // Function to get all possible matches for a word
    const getWordMatches = (word) => {
      const matches = new Set([word])
      
      // Add direct synonyms
      if (synonymMap[word]) {
        synonymMap[word].forEach(synonym => matches.add(synonym))
      }
      
      // Add reverse synonyms (if word appears as synonym)
      Object.entries(synonymMap).forEach(([key, synonyms]) => {
        if (synonyms.includes(word)) {
          matches.add(key)
          synonyms.forEach(syn => matches.add(syn))
        }
      })
      
      return Array.from(matches)
    }

    return searchData.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
      
      const searchableText = `${item.title} ${item.description}`.toLowerCase()
      const keywords = `${item.title} ${item.description} ${item.category}`.toLowerCase()
      
      // Check if ALL search words have matches (AND logic for better precision)
      return searchWords.every(word => {
        const wordMatches = getWordMatches(word)
        
        return wordMatches.some(match => {
          // Exact word boundary matching for precision
          const wordBoundaryRegex = new RegExp(`\\b${match}\\b`, 'i')
          if (wordBoundaryRegex.test(keywords)) return true
          
          // Partial matching for compound words
          if (keywords.includes(match)) return true
          
          // Handle acronyms and abbreviations
          if (match.length <= 4 && keywords.includes(match)) return true
          
          return false
        })
      })
    }).sort((a, b) => {
      // Advanced relevance scoring
      const getRelevanceScore = (item) => {
        const title = item.title.toLowerCase()
        const description = item.description.toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        let score = 0
        
        // Exact title match gets highest score
        if (title === searchLower) score += 100
        
        // Title starts with search term
        if (title.startsWith(searchLower)) score += 80
        
        // Title contains exact search term
        if (title.includes(searchLower)) score += 60
        
        // Description contains exact search term
        if (description.includes(searchLower)) score += 40
        
        // Count matching words for multi-word searches
        const titleWords = title.split(' ')
        const searchWordsCount = searchWords.filter(word => 
          titleWords.some(titleWord => titleWord.includes(word))
        ).length
        score += searchWordsCount * 20
        
        // Boost popular/important items
        const importantItems = ['tax calculator', 'business registration', 'investment', 'work permit']
        if (importantItems.some(important => title.includes(important))) score += 10
        
        return score
      }
      
      const scoreA = getRelevanceScore(a)
      const scoreB = getRelevanceScore(b)
      
      return scoreB - scoreA // Higher score first
    })
  }, [searchTerm, selectedCategory, searchData])

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Trigger new search by updating URL
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm)}`)
  }

  return (
    <PageBackground page="search">
      <div className="relative min-h-screen pt-24 pb-20">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white text-center mb-8">
              Search Results
            </h1>
            
            {/* Enhanced Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search services, investments, tools..."
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-red-500 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Search Results */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-gray-300 text-center">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchTerm}"`
                  : `No results found for "${searchTerm}"`
                }
              </p>
            </motion.div>
          )}

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={result.path}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105 h-full">
                      <div className="text-4xl mb-4">{result.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                        {result.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">{result.description}</p>
                      <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                        {result.category}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No results found</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Try different keywords or browse our categories to find what you're looking for.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/services"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Browse Services
                </Link>
                <Link
                  to="/tools"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Tools
                </Link>
                <Link
                  to="/investments"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Explore Investments
                </Link>
              </div>
            </motion.div>
          )}

          {!searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">Start Your Search</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Enter keywords to search across our services, tools, investments, and resources.
              </p>
              <div className="text-sm text-gray-400">
                Try searching for: "tax calculator", "business registration", "agriculture investment", or "work permit"
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageBackground>
  )
}

export default SearchPage