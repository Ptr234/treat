import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  // Scroll handler for header styling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled)
    }
  }, [isScrolled])

  // Click outside handler
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setActiveDropdown(null)
    }
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsSearchOpen(false)
    }
  }, [])

  useEffect(() => {
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', throttledScroll, { passive: true })
    document.addEventListener('mousedown', handleClickOutside)
    
    // Cleanup function to prevent memory leaks
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleScroll, handleClickOutside])

  // Navigation structure
  const navigationItems = useMemo(() => [
    { 
      name: 'Home', 
      href: '/', 
      icon: '🏠'
    },
    { 
      name: 'Investment Opportunities', 
      href: '/investments', 
      icon: '💰',
      dropdown: [
        { name: 'All Investment Sectors', href: '/investments', icon: '💼' },
        { name: 'Agriculture Investments', href: '/investments?sector=agriculture', icon: '🌾' },
        { name: 'Tourism Investments', href: '/investments?sector=tourism', icon: '🏖️' },
        { name: 'Mining Investments', href: '/investments?sector=mining', icon: '⛏️' },
        { name: 'ICT Investments', href: '/investments?sector=ict', icon: '💻' },
        { name: 'Manufacturing Investments', href: '/investments?sector=manufacturing', icon: '🏭' },
        { name: 'Investment ROI Calculator', href: '/roi-calculator', icon: '📊' },
        { name: 'Investment Support Services', href: '/services?category=Investment Support', icon: '🎯' }
      ]
    },
    { 
      name: 'Investment Services', 
      href: '/services', 
      icon: '🏛️',
      dropdown: [
        { name: 'Investment Support Services', href: '/services?category=Investment Support', icon: '📋' },
        { name: 'Business Registration', href: '/registration-wizard', icon: '🏢' },
        { name: 'Tax & Revenue Services', href: '/services?category=Tax & Revenue Services', icon: '🧮' },
        { name: 'Investment Documentation', href: '/document-checklist', icon: '📄' },
        { name: 'All Government Services', href: '/services', icon: '🏛️' }
      ]
    },
    { 
      name: 'Investment Tools', 
      href: '/tools', 
      icon: '🛠️',
      dropdown: [
        { name: 'Investment ROI Calculator', href: '/roi-calculator', icon: '📊' },
        { name: 'Tax Calculator', href: '/calculator', icon: '🧮' },
        { name: 'Business Invoice Generator', href: '/invoice', icon: '📄' },
        { name: 'Investment Document Checklist', href: '/document-checklist', icon: '✅' },
        { name: 'All Investment Tools', href: '/tools', icon: '🛠️' }
      ]
    },
    { 
      name: 'Investment Resources', 
      href: '/downloads', 
      icon: '📁'
    },
    { 
      name: 'Support', 
      href: '/support', 
      icon: '🤝' 
    }
  ], [])

  const isActiveRoute = useCallback((href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }, [location.pathname])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const trimmedSearch = searchTerm.trim()
    if (trimmedSearch) {
      try {
        navigate(`/search?q=${encodeURIComponent(trimmedSearch)}`)
        setIsSearchOpen(false)
        setSearchTerm('')
      } catch (error) {
        console.error('Navigation error:', error)
        // Fallback navigation
        window.location.href = `#/search?q=${encodeURIComponent(trimmedSearch)}`
      }
    }
  }, [searchTerm, navigate])

  // Enhanced search suggestions based on popular investment queries
  const searchSuggestions = useMemo(() => [
    'investment opportunities', 'agriculture investment', 'tourism investment',
    'mining investment', 'ict investment', 'manufacturing investment', 'roi calculator',
    'investment incentives', 'business registration', 'tax calculator', 'uia services',
    'investment support', 'atms incentives', 'investment documentation', 'forex investment'
  ], [])

  return (
    <>
      {/* Main Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            
            {/* Logo Section */}
            <motion.div 
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/" className="flex items-center group">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gradient-to-br from-red-600 to-red-800">
                  <img 
                    src="/images/oneStopCenter-logo.jpeg" 
                    alt="OneStopCentre Uganda" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-red-600 to-red-800 items-center justify-center text-white font-bold text-base">
                    OSC
                  </div>
                </div>
                <div className="ml-4 flex flex-col justify-center">
                  <div className="font-bold text-xl leading-tight transition-colors duration-300 text-gray-900">
                    OneStopCentre
                  </div>
                  <div className="text-sm font-semibold leading-tight transition-colors duration-300 text-blue-600 -mt-0.5">
                    Uganda
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <div key={item.name} className="relative" ref={item.dropdown ? dropdownRef : null}>
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      try {
                        if (item.dropdown) {
                          setActiveDropdown(activeDropdown === item.name ? null : item.name)
                        } else {
                          navigate(item.href)
                        }
                      } catch (error) {
                        console.error('Navigation error:', error)
                        // Fallback navigation for failed routes
                        window.location.href = `#${item.href}`
                      }
                    }}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 group ${
                      isActiveRoute(item.href)
                        ? `text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg` 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.name}</span>
                      {item.dropdown && (
                        <motion.svg
                          className="w-4 h-4 ml-1"
                          animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      )}
                    </span>
                    
                    {/* Active indicator */}
                    {isActiveRoute(item.href) && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        {item.dropdown.map((dropdownItem, dropdownIndex) => (
                          <motion.button
                            key={dropdownItem.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: dropdownIndex * 0.05 }}
                            onClick={() => {
                              navigate(dropdownItem.href)
                              setActiveDropdown(null)
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
                          >
                            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                              {dropdownItem.icon}
                            </span>
                            <span className="font-medium">{dropdownItem.name}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search & CTA Section */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {isSearchOpen ? (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSearch}
                      className="flex"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search investments, tools, services..."
                          className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          autoComplete="off"
                          autoFocus
                        />
                        
                        {/* Search Suggestions Dropdown */}
                        {searchTerm.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                            {searchSuggestions
                              .filter(suggestion => 
                                suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                suggestion.toLowerCase() !== searchTerm.toLowerCase()
                              )
                              .slice(0, 5)
                              .map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSearchTerm(suggestion)
                                    navigate(`/search?q=${encodeURIComponent(suggestion)}`)
                                    setIsSearchOpen(false)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {suggestion}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </motion.form>
                  ) : (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/investment-onboarding')}
                className="hidden sm:flex items-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="mr-2">💰</span>
                Start Investing
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl transition-colors duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        if (item.dropdown) {
                          setActiveDropdown(activeDropdown === item.name ? null : item.name)
                        } else {
                          navigate(item.href)
                          setIsMenuOpen(false)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActiveRoute(item.href)
                          ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center space-x-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      {item.dropdown && (
                        <motion.svg
                          className="w-5 h-5"
                          animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      )}
                    </button>

                    {/* Mobile Dropdown */}
                    <AnimatePresence>
                      {item.dropdown && activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-2 space-y-1"
                        >
                          {item.dropdown.map((dropdownItem, dropdownIndex) => (
                            <motion.button
                              key={dropdownItem.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: dropdownIndex * 0.05 }}
                              onClick={() => {
                                navigate(dropdownItem.href)
                                setIsMenuOpen(false)
                                setActiveDropdown(null)
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              <span className="text-base mr-3">{dropdownItem.icon}</span>
                              <span>{dropdownItem.name}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                
                {/* Mobile CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.1 }}
                  onClick={() => {
                    navigate('/investment-onboarding')
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center px-6 py-3 mt-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold rounded-xl shadow-lg"
                >
                  <span className="mr-2">💰</span>
                  Start Your Investment
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header