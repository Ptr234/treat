import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BriefcaseIcon,
  BuildingLibraryIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrophyIcon,
  BuildingOffice2Icon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { getAllServicesWithContacts, SERVICE_CATEGORIES } from '../data/optimizedServices'
import { useNotification } from '../contexts/NotificationContext'
import LazyImage from './LazyImage'

// ===================================================================
// ONESTOPCENTRE UGANDA - GOVERNMENT SERVICES PORTAL
// ===================================================================
// 
// COMPANY: OneStopCentre Uganda
// TAGLINE: Investing in Uganda Simplified
//
// This component serves as the main interface for Uganda's government
// services portal, providing users with access to official government
// services through an intuitive, searchable, and filterable interface.
//
// MAIN FEATURES:
// ✅ Advanced Search: Fuzzy matching, suggestions, search history
// ✅ Smart Filtering: Category-based filtering with visual indicators  
// ✅ Premium Services: Special highlighting for Investment Support
// ✅ Professional Animations: Smooth transitions and micro-interactions
// ✅ Responsive Design: Works perfectly on all device sizes
// ✅ Application Integration: Direct service application functionality
// ✅ User Experience: Persistent preferences and search history
//
// SERVICE CATEGORIES:
// Investment Support (8 premium services)
// Business Registration & Licensing (12 services)
// Tax & Revenue Services (8 services)
// Immigration & Work Permits (6 services)
// Land & Property Services (5 services)
// Export & Import Services (4 services)
// ==================================================================="

const Services = ({ initialCategory = 'All', initialSearch = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviceSearchHistory') || '[]')
    } catch {
      return []
    }
  })
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [applications, setApplications] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const { addNotification } = useNotification()

  const allServices = useMemo(() => getAllServicesWithContacts(), [])

  // Update category when props change
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory)
    }
    if (initialSearch && initialSearch !== searchTerm) {
      setSearchTerm(initialSearch)
    }
  }, [initialCategory, initialSearch, selectedCategory, searchTerm])
  
  // Generate search suggestions based on available services
  const generateSearchSuggestions = useMemo(() => {
    const suggestions = new Set()
    
    allServices.forEach(service => {
      // Add service titles
      suggestions.add(service.title)
      // Add agency names
      suggestions.add(service.agency)
      // Add category
      suggestions.add(service.category)
      // Add common keywords
      const keywords = service.title.toLowerCase().split(' ')
      keywords.forEach(keyword => {
        if (keyword.length > 3) suggestions.add(keyword)
      })
    })
    
    // Add popular search terms
    const popularTerms = [
      'business registration', 'company registration', 'trading license',
      'tax registration', 'TIN registration', 'VAT registration',
      'URSB services', 'URA services', 'KCCA license',
      'patent registration', 'trademark registration',
      'import permit', 'export permit', 'environmental clearance'
    ]
    
    popularTerms.forEach(term => suggestions.add(term))
    
    return Array.from(suggestions).sort()
  }, [allServices])
  
  /**
   * Handle real-time search input changes with intelligent suggestions
   * - Updates search term state in real-time
   * - Filters suggestions based on current input
   * - Shows/hides suggestion dropdown based on input length
   * - Limits suggestions to 8 items for better UX
   */
  const handleSearchInputChange = useCallback((inputValue) => {
    // Update the search term state
    setSearchTerm(inputValue)
    
    const trimmedInput = inputValue.trim()
    
    if (trimmedInput.length > 0) {
      // Filter suggestions based on current input (case-insensitive)
      const relevantSuggestions = generateSearchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(trimmedInput.toLowerCase())
      ).slice(0, 8) // Limit to 8 suggestions for optimal UX
      
      setSearchSuggestions(relevantSuggestions)
      setShowSuggestions(true)
    } else {
      // Hide suggestions when input is empty
      setShowSuggestions(false)
    }
  }, [generateSearchSuggestions])
  
  // Helper function to calculate search relevance score
  const calculateRelevanceScore = useCallback((service, searchQuery, searchWords) => {
    let score = 0
    const title = service.title.toLowerCase()
    const description = service.description.toLowerCase()
    const agency = service.agency.toLowerCase()
    
    // Exact title match gets highest score
    if (title.includes(searchQuery)) score += 100
    
    // Title word matches
    searchWords.forEach(word => {
      if (title.includes(word)) score += 50
      if (title.startsWith(word)) score += 25
    })
    
    // Agency matches
    if (agency.includes(searchQuery)) score += 30
    searchWords.forEach(word => {
      if (agency.includes(word)) score += 15
    })
    
    // Description matches
    if (description.includes(searchQuery)) score += 20
    searchWords.forEach(word => {
      if (description.includes(word)) score += 10
    })
    
    // Priority boost for high-priority services
    if (service.priority === 'high') score += 5
    if (service.required) score += 3
    
    return score
  }, [])
  
  // Handle search submission
  const handleSearchSubmit = useCallback((searchValue) => {
    const trimmedValue = searchValue.trim()
    if (trimmedValue) {
      // Add to search history
      const newHistory = [trimmedValue, ...searchHistory.filter(term => term !== trimmedValue)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('serviceSearchHistory', JSON.stringify(newHistory))
      
      // Track search analytics
      addNotification({
        type: 'info',
        title: 'Search Applied',
        message: `Searching for "${trimmedValue}"`,
        duration: 2000
      })
    }
    setShowSuggestions(false)
  }, [searchHistory, addNotification])
  
  // Enhanced search with fuzzy matching, keyword scoring, and comprehensive field searching
  const filteredServices = useMemo(() => {
    let filtered = allServices

    // Category filtering
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    // Enhanced search functionality
    if (searchTerm && searchTerm.trim()) {
      const searchQuery = searchTerm.toLowerCase().trim()
      const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0)
      
      filtered = filtered.filter(service => {
        // Prepare searchable text fields
        const searchableFields = [
          service.title,
          service.description,
          service.agency,
          service.category,
          service.fees,
          service.timeline,
          ...(service.requirements || []),
          service.contact?.email || '',
          service.contact?.phone || '',
          service.priority
        ].join(' ').toLowerCase()
        
        // Check for exact phrase match (highest priority)
        if (searchableFields.includes(searchQuery)) {
          return true
        }
        
        // Check if all search words are present (partial matching)
        const allWordsFound = searchWords.every(word => {
          // Exact word match
          if (searchableFields.includes(word)) return true
          
          // Fuzzy matching for common typos and abbreviations
          const fuzzyMatches = {
            'buisness': 'business',
            'bussiness': 'business',
            'registeration': 'registration',
            'registraton': 'registration',
            'licencing': 'licensing',
            'lisence': 'license',
            'lisencing': 'licensing',
            'vatregistration': 'vat registration',
            'tinregistration': 'tin registration',
            'companyregistration': 'company registration',
            'tradingicense': 'trading license',
            'tradlic': 'trading license',
            'bizreg': 'business registration',
            'companyreg': 'company registration',
            'ursb': 'uganda registration services bureau',
            'ura': 'uganda revenue authority',
            'kcca': 'kampala capital city authority',
            'bou': 'bank of uganda',
            'nema': 'national environment management authority',
            'unbs': 'uganda national bureau of standards',
            'ucc': 'uganda communications commission',
            'cma': 'capital markets authority',
            'fia': 'financial intelligence authority',
            'nssf': 'national social security fund',
            'tax': 'tax revenue',
            'taxes': 'tax revenue',
            'trademark': 'patents trademarks',
            'patent': 'patents trademarks',
            'forex': 'foreign exchange',
            'environment': 'environmental impact',
            'trading': 'trading license',
            'import': 'import permit',
            'export': 'export permit'
          }
          
          // Check fuzzy matches
          const fuzzyWord = fuzzyMatches[word]
          if (fuzzyWord && searchableFields.includes(fuzzyWord)) {
            return true
          }
          
          // Partial word matching (for shorter words)
          if (word.length >= 3) {
            return searchableFields.split(' ').some(field => 
              field.includes(word) || word.includes(field)
            )
          }
          
          return false
        })
        
        return allWordsFound
      })
      
      // Sort results by relevance score
      filtered.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, searchQuery, searchWords)
        const scoreB = calculateRelevanceScore(b, searchQuery, searchWords)
        return scoreB - scoreA
      })
    }

    return filtered
  }, [allServices, selectedCategory, searchTerm, calculateRelevanceScore])

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service)
    addNotification({
      type: 'info',
      title: 'Service Details',
      message: `Viewing ${service.title} - Processing time: ${service.timeline}`,
      duration: 3000
    })
  }, [addNotification])

  const handleSubmitApplication = useCallback((e, service) => {
    e.stopPropagation()
    setSelectedService(service)
    setShowApplicationModal(true)
    addNotification({
      type: 'info',
      title: 'Application Started',
      message: `Starting application for ${service.title}`,
      duration: 3000
    })
  }, [addNotification])

  const handleApplicationSubmit = useCallback((applicationData) => {
    const newApplication = {
      id: Date.now(),
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      agency: selectedService.agency,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      ...applicationData
    }
    
    setApplications(prev => [...prev, newApplication])
    setShowApplicationModal(false)
    setSelectedService(null)
    
    addNotification({
      type: 'success',
      title: 'Application Submitted',
      message: `Your application for ${selectedService.title} has been submitted successfully`,
      duration: 5000
    })
  }, [selectedService, addNotification])

  const handleTrackApplication = useCallback((serviceId) => {
    const application = applications.find(app => app.serviceId === serviceId)
    if (application) {
      addNotification({
        type: 'info',
        title: 'Application Status',
        message: `Status: ${application.status} - Submitted: ${new Date(application.submittedAt).toLocaleDateString()}`,
        duration: 5000
      })
    } else {
      addNotification({
        type: 'warning',
        title: 'No Application Found',
        message: 'You have not submitted an application for this service yet',
        duration: 3000
      })
    }
  }, [applications, addNotification])

  const handleCall = useCallback((e, contact) => {
    e.stopPropagation()
    const phone = contact?.phone || '+256 414 233219'
    if (phone) {
      window.open(`tel:${phone}`, '_self')
      addNotification({
        type: 'info',
        title: 'Calling Agency',
        message: `Dialing ${phone}`,
        duration: 3000
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Phone Not Available',
        message: 'Phone number not available for this agency',
        duration: 3000
      })
    }
  }, [addNotification])

  const handleEmail = useCallback((e, contact) => {
    e.stopPropagation()
    const email = contact?.email || 'ursb@ursb.go.ug'
    if (email) {
      const subject = encodeURIComponent('Service Inquiry - Uganda Government Service')
      window.open(`mailto:${email}?subject=${subject}`, '_blank')
      addNotification({
        type: 'info',
        title: 'Opening Email',
        message: `Composing email to ${email}`,
        duration: 3000
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Email Not Available',
        message: 'Email address not available for this agency',
        duration: 3000
      })
    }
  }, [addNotification])

  const handleWebsite = useCallback((e, contact) => {
    e.stopPropagation()
    const website = contact?.website || 'https://ursb.go.ug'
    if (website) {
      window.open(website, '_blank')
      addNotification({
        type: 'info',
        title: 'Opening Website', 
        message: `Visiting agency website`,
        duration: 3000
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Website Not Available',
        message: 'Website not available for this agency',
        duration: 3000
      })
    }
  }, [addNotification])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
      rotateX: 15
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <motion.section 
      id="services" 
      className="py-20 px-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Uganda Government Building Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda government buildings and business centers" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/98 via-gray-900/95 to-gray-900/98"></div>
        
        {/* Uganda Flag Pattern Overlay */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-yellow-400 via-red-500 to-black opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-yellow-400 via-red-500 to-black opacity-30"></div>
        
        {/* National Symbols */}
        <div className="absolute top-10 left-10 opacity-15">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <div className="absolute top-10 right-10 opacity-20">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-20 h-14 object-cover rounded shadow-md"
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-4 border border-blue-500/30 backdrop-blur-sm">
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            <span>Premium Investment Services - UIA & Government Partners</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Investment Services 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Professional Grade
            </span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-200 mb-6">
              Comprehensive investment facilitation through Uganda Investment Authority (UIA) and strategic government partners. 
              85-97% success rates on qualified projects. Access exclusive incentives, fast-track approvals, and dedicated support 
              for serious investors with comprehensive aftercare services.
            </p>
            
            {/* Investment Support Highlight */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {[
                { IconComponent: TrophyIcon, title: 'Investment Support', desc: '8 Premium Services', color: 'from-green-500 to-emerald-600' },
                { IconComponent: BuildingLibraryIcon, title: 'Government Services', desc: '50+ Official Services', color: 'from-blue-500 to-indigo-600' },
                { IconComponent: BoltIcon, title: 'Fast-Track Processing', desc: '15-30 Day Approvals', color: 'from-orange-500 to-red-600' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`bg-gradient-to-r ${item.color} p-4 rounded-2xl text-center backdrop-blur-sm border border-white/20`}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.9 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="mb-2">
                    <item.IconComponent className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <div className="text-lg font-bold mb-1">{item.title}</div>
                  <div className="text-sm opacity-90">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Uganda Government Service Stats with Flag Colors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { IconComponent: BuildingLibraryIcon, value: 'URSB', label: 'Business Registration', color: 'bg-gradient-to-br from-black to-gray-800 text-white border-gray-600' },
            { IconComponent: BriefcaseIcon, value: 'URA', label: 'Tax Services', color: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black border-yellow-300' },
            { IconComponent: BuildingOffice2Icon, value: '50,893', label: 'New Businesses 2023', color: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400' },
            { IconComponent: BoltIcon, value: '7 Days', label: 'Registration Timeline', color: 'bg-gradient-to-br from-green-600 to-green-700 text-white border-green-400' }
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-2xl p-6 shadow-lg border-2 text-center relative overflow-hidden`}>
              {index === 0 && (
                <div className="absolute top-2 right-2 opacity-20">
                  <img 
                    src="/images/uganda-coat-of-arms.png" 
                    alt="Uganda Coat of Arms" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              )}
              {index === 1 && (
                <div className="absolute top-2 right-2 opacity-30">
                  <img 
                    src="/images/uganda-flag.png" 
                    alt="Uganda flag" 
                    className="w-8 h-6 object-cover rounded shadow-sm"
                  />
                </div>
              )}
              <div className="mb-3 flex justify-center">
                <stat.IconComponent className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Browse Services</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                  searching: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  category: {selectedCategory}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search services, agencies, or keywords... (try 'business', 'URSB', 'tax', etc.)"
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchTerm)
                  }
                  if (e.key === 'Escape') {
                    setShowSuggestions(false)
                  }
                }}
                onFocus={() => {
                  if (searchTerm.trim() && searchSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 transition-all"
                autoComplete="off"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setShowSuggestions(false)
                  }}
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                  {searchSuggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Suggestions</div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`suggestion-${index}`}
                          onClick={() => {
                            setSearchTerm(suggestion)
                            handleSearchSubmit(suggestion)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-yellow-50 rounded transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchHistory.length > 0 && searchSuggestions.length === 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Recent Searches</div>
                      {searchHistory.slice(0, 5).map((term, index) => (
                        <button
                          key={`history-${index}`}
                          onClick={() => {
                            setSearchTerm(term)
                            handleSearchSubmit(term)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50"
            >
              <option value="All">All Categories</option>
              {SERVICE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-400 hover:shadow-xl transition-all cursor-pointer group ${
                viewMode === 'list' ? 'flex items-start p-6' : 'p-6'
              }`}
              onClick={() => handleServiceClick(service)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      service.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : service.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {service.category}
                    </div>
                    <LazyImage
                      src={service.logo}
                      alt={service.agency}
                      className="w-10 h-10 object-contain bg-white rounded p-1"
                      fallbackSrc="/images/uganda-coat-of-arms.png"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-2">{service.agency}</p>
                  
                  {/* Investment-specific badges for Investment Support category */}
                  {service.category === 'Investment Support' && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.successRate && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          {service.successRate}
                        </span>
                      )}
                      {service.minInvestment && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center">
                          <BriefcaseIcon className="w-3 h-3 mr-1" />
                          {service.minInvestment}
                        </span>
                      )}
                      {service.investorType && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                          {service.investorType}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  
                  {/* Investment benefits for Investment Support services */}
                  {service.category === 'Investment Support' && service.benefits && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center">
                        <TrophyIcon className="w-3 h-3 mr-1" />
                        Key Benefits:
                      </h4>
                      <div className="space-y-1">
                        {service.benefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx} className="flex items-start text-xs text-green-700">
                            <span className="text-green-500 mr-1 mt-0.5">✓</span>
                            <span className="flex-1">{benefit}</span>
                          </div>
                        ))}
                        {service.benefits.length > 2 && (
                          <div className="text-xs text-green-600 font-medium">
                            +{service.benefits.length - 2} more benefits
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {service.category === 'Investment Support' ? 'Investment Fee' : 'Processing Fee'}
                      </span>
                      <span className="text-sm font-semibold text-green-600">{service.fees}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Timeline</span>
                      <span className="text-sm font-semibold text-blue-600">{service.timeline}</span>
                    </div>
                    {service.savingsRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Tax Savings</span>
                        <span className="text-sm font-semibold text-yellow-600">{service.savingsRate}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button 
                        onClick={(e) => handleSubmitApplication(e, service)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        title="Submit Application"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Submit Application
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTrackApplication(service.id) }}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Track Application"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Track
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={(e) => handleCall(e, service.contact)}
                        className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Call Agency"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call
                      </button>
                      <button 
                        onClick={(e) => handleEmail(e, service.contact)}
                        className="flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-medium rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </button>
                      <button 
                        onClick={(e) => handleWebsite(e, service.contact)}
                        className="flex items-center px-3 py-2 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Visit Website"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                        </svg>
                        Website
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-start space-x-6">
                  <LazyImage
                    src={service.logo}
                    alt={service.agency}
                    className="w-16 h-16 object-contain bg-white rounded p-2 flex-shrink-0"
                    fallbackSrc="/images/uganda-coat-of-arms.png"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-500">{service.agency} • {service.category}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        service.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : service.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {service.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    <div className="flex items-center space-x-6 text-sm mb-3">
                      <span className="text-green-600 font-semibold">{service.fees}</span>
                      <span className="text-blue-600 font-semibold">{service.timeline}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={(e) => handleSubmitApplication(e, service)}
                        className="flex items-center px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black text-xs font-semibold rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Apply
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTrackApplication(service.id) }}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Track
                      </button>
                      <button 
                        onClick={(e) => handleCall(e, service.contact)}
                        className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
          >
            <div className="mb-6 flex justify-center">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No services found</h3>
            <p className="text-gray-300 mb-6">
              {searchTerm 
                ? `No results for "${searchTerm}" in ${selectedCategory === 'All' ? 'all categories' : selectedCategory}`
                : 'Try adjusting your search terms or category filter'
              }
            </p>
            
            {searchTerm && (
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-4">Search suggestions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['business registration', 'company registration', 'URSB', 'URA', 'trading license', 'tax registration'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchTerm(suggestion)
                        handleSearchSubmit(suggestion)
                      }}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs hover:bg-yellow-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('All')
                    addNotification({
                      type: 'info',
                      title: 'Filters Cleared',
                      message: 'All search filters have been reset',
                      duration: 3000
                    })
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Service Application</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">{selectedService.title}</h4>
                <p className="text-sm text-yellow-700 mb-2">{selectedService.description}</p>
                <p className="text-sm text-yellow-600">{selectedService.agency}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600 font-semibold">{selectedService.fees}</span>
                  <span className="text-blue-600 font-semibold">{selectedService.timeline}</span>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const applicationData = Object.fromEntries(formData.entries())
                handleApplicationSubmit(applicationData)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID/Passport *</label>
                    <input
                      type="text"
                      name="identification"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                  <select
                    name="businessCategory"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Select business category</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="tourism">Tourism</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Services</option>
                    <option value="ict">ICT</option>
                    <option value="mining">Mining</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose/Details *</label>
                  <textarea
                    name="purpose"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your application purpose, business activities, or specific requirements..."
                  ></textarea>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">Required Documents</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Valid identification (National ID or Passport)</li>
                    <li>• Business plan or proposal (if applicable)</li>
                    <li>• Proof of address</li>
                    <li>• Bank statement or financial records</li>
                    <li>• Tax clearance certificate (for business applications)</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    Documents can be submitted during your agency visit or uploaded through our portal after application submission.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Services
