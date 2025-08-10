import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { navigateToSection } from '../utils/preciseNavigation'
import AuthModal from './AuthModal'
import {
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  HandRaisedIcon,
  BriefcaseIcon,
  BeakerIcon,
  GlobeAltIcon,
  CubeIcon,
  ComputerDesktopIcon,
  CogIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  MapPinIcon,
  BookOpenIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  // Icon mapping for professional icons
  const iconMap = {
    HomeIcon,
    CurrencyDollarIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon,
    FolderIcon,
    HandRaisedIcon,
    BriefcaseIcon,
    BeakerIcon,
    GlobeAltIcon,
    CubeIcon,
    ComputerDesktopIcon,
    CogIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    BuildingOffice2Icon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    ArchiveBoxIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    MapPinIcon,
    BookOpenIcon,
    ScaleIcon,
    ExclamationTriangleIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    TargetIcon: PresentationChartLineIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    InformationCircleIcon,
    SparklesIcon,
    FireIcon
  }

  const renderIcon = (iconName, className = "w-5 h-5") => {
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className={className} /> : null
  }

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

  // Navigation structure - Investment-focused with enhanced UX
  const navigationItems = useMemo(() => [
    { 
      name: 'Home', 
      href: '/', 
      icon: 'HomeIcon'
    },
    { 
      name: 'Investment Opportunities', 
      href: '/investments', 
      icon: 'CurrencyDollarIcon',
      dropdown: [
        { name: 'All Investment Sectors', href: '/investments', icon: 'BriefcaseIcon' },
        { name: 'Agriculture Investments', href: '/investments#agriculture', icon: 'BeakerIcon' },
        { name: 'Tourism Investments', href: '/investments#tourism', icon: 'GlobeAltIcon' },
        { name: 'Mining Investments', href: '/investments#mining', icon: 'CubeIcon' },
        { name: 'ICT Investments', href: '/investments#ict', icon: 'ComputerDesktopIcon' },
        { name: 'Manufacturing Investments', href: '/investments#manufacturing', icon: 'CogIcon' },
        { name: 'Investment ROI Calculator', href: '/roi-calculator', icon: 'ChartBarIcon' },
        { name: 'Investment Onboarding', href: '/investment-onboarding', icon: 'RocketLaunchIcon' }
      ]
    },
    { 
      name: 'Investment Services', 
      href: '/services', 
      icon: 'BuildingOfficeIcon',
      dropdown: [
        { name: 'Investment Support Services', href: '/services#investment-support', icon: 'TargetIcon' },
        { name: 'Business Registration & Licensing', href: '/registration-wizard', icon: 'BuildingOffice2Icon' },
        { name: 'Tax & Revenue Services', href: '/services#tax-revenue', icon: 'CalculatorIcon' },
        { name: 'Immigration & Work Permits', href: '/services#immigration-permits', icon: 'ClipboardDocumentListIcon' },
        { name: 'Export & Import Services', href: '/services#export-import', icon: 'ArchiveBoxIcon' },
        { name: 'All Government Services', href: '/services', icon: 'BuildingOfficeIcon' }
      ]
    },
    { 
      name: 'Investment Tools', 
      href: '/tools', 
      icon: 'WrenchScrewdriverIcon',
      dropdown: [
        { name: 'Investment ROI Calculator', href: '/roi-calculator', icon: 'ChartBarIcon' },
        { name: 'Tax Calculator', href: '/calculator', icon: 'CalculatorIcon' },
        { name: 'Business Invoice Generator', href: '/invoice', icon: 'DocumentTextIcon' },
        { name: 'Document Checklist', href: '/document-checklist', icon: 'CheckCircleIcon' },
        { name: 'Investment Status Tracker', href: '/tools#status-tracker', icon: 'MapPinIcon' },
        { name: 'All Investment Tools', href: '/tools', icon: 'WrenchScrewdriverIcon' }
      ]
    },
    { 
      name: 'Investor Resources', 
      href: '/downloads', 
      icon: 'FolderIcon',
      dropdown: [
        { name: 'Investment Guides', href: '/downloads#investment-guides', icon: 'BookOpenIcon' },
        { name: 'Legal Documents', href: '/downloads#legal-documents', icon: 'ScaleIcon' },
        { name: 'Tax Information', href: '/downloads#tax-information', icon: 'CurrencyDollarIcon' },
        { name: 'Sector Reports', href: '/downloads#sector-reports', icon: 'ChartBarIcon' },
        { name: 'All Resources', href: '/downloads', icon: 'FolderIcon' }
      ]
    },
    { 
      name: 'Investor Support', 
      href: '/support', 
      icon: 'HandRaisedIcon',
      dropdown: [
        { name: 'Investment Consultation', href: '/support#investment-consultation', icon: 'BriefcaseIcon' },
        { name: 'Agency Directory', href: '/agencies', icon: 'BuildingOffice2Icon' },
        { name: 'Emergency Support', href: '/support#emergency', icon: 'ExclamationTriangleIcon' },
        { name: 'Investor FAQ', href: '/support#faq', icon: 'QuestionMarkCircleIcon' }
      ]
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
        // Navigation error handling removed for production
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
            ? 'bg-red-600/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-b border-red-700/50' 
            : 'bg-red-600/90 backdrop-blur-md shadow-xl shadow-black/5'
        }`}
        style={{
          boxShadow: isScrolled 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="w-full">
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
                  <div className="font-bold text-xl leading-tight transition-colors duration-300 text-white">
                    OneStopCentre
                  </div>
                  <div className="text-sm font-semibold leading-tight transition-colors duration-300 text-yellow-300 -mt-0.5">
                    Uganda
                  </div>
                  <div className="text-xs font-medium text-white/90 italic -mt-0.5">
                    Investing in Uganda simplified
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
                    onClick={(e) => {
                      e.preventDefault()
                      if (item.dropdown) {
                        setActiveDropdown(activeDropdown === item.name ? null : item.name)
                      } else {
                        // Use immediate navigation for better performance
                        navigate(item.href, { replace: false })
                        setActiveDropdown(null) // Close any open dropdowns
                      }
                    }}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 group ${
                      isActiveRoute(item.href)
                        ? `text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/25` 
                        : 'text-white hover:text-yellow-200 hover:bg-red-700/50 hover:shadow-md'
                    }`}
                    style={{
                      ...(isActiveRoute(item.href) && {
                        boxShadow: '0 10px 20px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(147, 51, 234, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      })
                    }}
                  >
                    <span className="flex items-center space-x-2">
                      {renderIcon(item.icon, "w-4 h-4")}
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
                              // Parse href for precise navigation
                              const [path, hash] = dropdownItem.href.split('#')
                              if (hash) {
                                navigateToSection(navigate, path, hash)
                              } else {
                                navigate(dropdownItem.href)
                              }
                              setActiveDropdown(null)
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
                          >
                            <span className="mr-3 group-hover:scale-110 transition-transform duration-200">
                              {renderIcon(dropdownItem.icon, "w-5 h-5")}
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

            {/* Search & Auth Section */}
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
                      className="p-2 rounded-xl transition-all duration-300 text-white hover:text-yellow-200 hover:bg-red-700/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Authentication Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden md:block font-medium text-gray-700">
                        {user?.firstName || 'User'}
                      </span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            {user?.role && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {user.role}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              navigate('/profile')
                              setActiveDropdown(null)
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {renderIcon('UserIcon', 'w-4 h-4 mr-3')}
                            My Profile
                          </button>

                          {user?.role === 'admin' && (
                            <button
                              onClick={() => {
                                navigate('/admin')
                                setActiveDropdown(null)
                              }}
                              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {renderIcon('CogIcon', 'w-4 h-4 mr-3')}
                              Admin Panel
                            </button>
                          )}

                          <button
                            onClick={() => {
                              logout()
                              setActiveDropdown(null)
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {renderIcon('ArrowRightOnRectangleIcon', 'w-4 h-4 mr-3')}
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CTA Button for authenticated users */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/investment-onboarding')}
                    className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      boxShadow: '0 8px 16px rgba(220, 38, 38, 0.2), 0 4px 8px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {renderIcon('CurrencyDollarIcon', 'w-4 h-4 mr-2')}
                    Invest Now
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center">
                  {/* Get Started Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuthModal(true)}
                    className="hidden sm:flex items-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      boxShadow: '0 8px 16px rgba(220, 38, 38, 0.2), 0 4px 8px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {renderIcon('RocketLaunchIcon', 'w-4 h-4 mr-2')}
                    Get Started
                  </motion.button>
                  
                  {/* Mobile CTA */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuthModal(true)}
                    className="sm:hidden p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    {renderIcon('RocketLaunchIcon', 'w-5 h-5')}
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl transition-colors duration-300 text-white hover:text-yellow-200 hover:bg-red-700/50"
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
            className="fixed top-16 left-0 right-0 z-40 lg:hidden bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (item.dropdown) {
                          setActiveDropdown(activeDropdown === item.name ? null : item.name)
                        } else {
                          navigate(item.href, { replace: false })
                          setIsMenuOpen(false)
                          setActiveDropdown(null)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActiveRoute(item.href)
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        {renderIcon(item.icon, "w-4 h-4")}
                        <span>{item.name}</span>
                      </span>
                      {item.dropdown && (
                        <motion.svg
                          className="w-4 h-4"
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
                          className="ml-6 mt-1 space-y-1"
                        >
                          {item.dropdown.map((dropdownItem, dropdownIndex) => (
                            <motion.button
                              key={dropdownItem.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: dropdownIndex * 0.05 }}
                              onClick={() => {
                                // Parse href for precise navigation
                                const [path, hash] = dropdownItem.href.split('#')
                                if (hash) {
                                  navigateToSection(navigate, path, hash)
                                } else {
                                  navigate(dropdownItem.href)
                                }
                                setIsMenuOpen(false)
                                setActiveDropdown(null)
                              }}
                              className="w-full flex items-center px-3 py-2 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                            >
                              <span className="mr-2">{renderIcon(dropdownItem.icon, "w-3 h-3")}</span>
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
                  {renderIcon('CurrencyDollarIcon', 'w-5 h-5 mr-2')}
                  Start Your Investment
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

export default Header