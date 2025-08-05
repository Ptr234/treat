import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllInvestmentsWithContacts, INVESTMENT_CATEGORIES } from '../data/optimizedInvestments'
import { useNotification } from '../contexts/NotificationContext'
import LazyImage from './LazyImage'
// Performance optimized with lazy loading and memoization - World-class animations

const Investments = ({ initialCategory = 'All', initialSearch = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('priority')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [applications, setApplications] = useState([])
  const { addNotification } = useNotification()

  const allInvestments = useMemo(() => getAllInvestmentsWithContacts(), [])

  // Update category when props change
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory)
    }
    if (initialSearch && initialSearch !== searchTerm) {
      setSearchTerm(initialSearch)
    }
  }, [initialCategory, initialSearch, selectedCategory, searchTerm])
  
  const filteredInvestments = useMemo(() => {
    let filtered = allInvestments

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(investment => investment.category === selectedCategory)
    }

    if (selectedPriority && selectedPriority !== 'All') {
      filtered = filtered.filter(investment => investment.priority === selectedPriority)
    }

    if (searchTerm) {
      filtered = filtered.filter(investment =>
        (investment.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (investment.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (investment.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (investment.sector?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      } else if (sortBy === 'roi') {
        const aROI = parseFloat((a.expectedROI || '').replace(/[^\d.]/g, '')) || 0
        const bROI = parseFloat((b.expectedROI || '').replace(/[^\d.]/g, '')) || 0
        return bROI - aROI
      } else if (sortBy === 'investment') {
        const aAmount = parseInt((a.investmentRange || '').match(/\d+/)?.[0] || '0')
        const bAmount = parseInt((b.investmentRange || '').match(/\d+/)?.[0] || '0')
        return aAmount - bAmount
      }
      return 0
    })
  }, [allInvestments, selectedCategory, selectedPriority, searchTerm, sortBy])

  const handleInvestmentClick = useCallback((investment) => {
    setSelectedInvestment(investment)
    addNotification({
      type: 'info',
      title: 'Investment Details',
      message: `Viewing ${investment.title || 'Investment'} - Expected ROI: ${investment.expectedROI || 'N/A'}`,
      duration: 3000
    })
  }, [addNotification])

  const handleApplyNow = useCallback((e, investment) => {
    e.stopPropagation()
    setSelectedInvestment(investment)
    setShowApplicationModal(true)
    addNotification({
      type: 'info',
      title: 'Application Started',
      message: `Starting application for ${investment.title}`,
      duration: 3000
    })
  }, [addNotification])

  const handleSubmitApplication = useCallback((applicationData) => {
    const newApplication = {
      id: Date.now(),
      investmentId: selectedInvestment.id,
      investmentTitle: selectedInvestment.title,
      status: 'Under Review',
      submittedAt: new Date().toISOString(),
      ...applicationData
    }
    
    setApplications(prev => [...prev, newApplication])
    setShowApplicationModal(false)
    setSelectedInvestment(null)
    
    addNotification({
      type: 'success',
      title: 'Application Submitted',
      message: `Your application for ${selectedInvestment.title} has been submitted successfully`,
      duration: 5000
    })
  }, [selectedInvestment, addNotification])

  const handleTrackApplication = useCallback((investmentId) => {
    const application = applications.find(app => app.investmentId === investmentId)
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
        message: 'You have not submitted an application for this investment yet',
        duration: 3000
      })
    }
  }, [applications, addNotification])

  const handleCall = useCallback((e, contact) => {
    e.stopPropagation()
    const phone = contact?.phone || '+256 414 301000'
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
    const email = contact?.email || 'info@ugandainvest.go.ug'
    if (email) {
      const subject = encodeURIComponent('Investment Inquiry - Uganda Investment Opportunity')
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
    const website = contact?.website || 'https://www.ugandainvest.go.ug'
    if (website) {
      window.open(website, '_blank')
      addNotification({
        type: 'info',
        title: 'Opening Website',
        message: `Visiting ${contact?.agency || 'agency website'}`,
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

  const sectorStats = INVESTMENT_CATEGORIES.slice(1, 7).map(category => {
    const count = allInvestments.filter(inv => inv.category === category).length
    const totalValue = allInvestments
      .filter(inv => inv.category === category)
      .reduce((sum, inv) => {
        const match = (inv.investmentRange || '').match(/USD ([\d,]+)/)
        return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0)
      }, 0)
    
    return {
      sector: category,
      opportunities: count,
      value: `$${(totalValue / 1000000).toFixed(1)}M+`,
      icon: category.includes('Agriculture') ? '🌾' : 
            category.includes('Tourism') ? '🏖️' : 
            category.includes('Mining') ? '⛏️' : 
            category.includes('ICT') ? '💻' : 
            category.includes('Manufacturing') ? '🏭' : '💼'
    }
  })

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
      y: -12,
      scale: 1.02,
      rotateY: 2,
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

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(34, 197, 94, 0.3)",
        "0 0 40px rgba(34, 197, 94, 0.6)",
        "0 0 20px rgba(34, 197, 94, 0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.section 
      id="investments" 
      className="py-24 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Uganda Building Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda business buildings and infrastructure" 
            className="w-full h-full object-cover opacity-8"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
        
        {/* Uganda Flag Corner Accent */}
        <div className="absolute top-10 right-10 opacity-20">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-20 h-14 object-cover rounded shadow-lg"
          />
        </div>
        
        {/* Crested Crane Silhouette */}
        <div className="absolute bottom-20 left-10 opacity-15">
          <div className="w-24 h-24 text-white">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M30 70 Q35 65 40 70 Q45 60 55 65 Q60 55 70 60 Q75 65 70 75 Q65 80 55 75 Q50 85 40 80 Q35 75 30 70 Z" />
              <path d="M45 50 Q50 45 55 50 Q60 45 65 50 Q70 55 65 65 Q60 70 50 65 Q40 60 45 50 Z" />
              <circle cx="52" cy="52" r="2" />
              <path d="M50 35 Q55 30 60 35 Q65 40 60 45 Q55 50 50 45 Q45 40 50 35 Z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-4">
            💎 Premium Investment Opportunities - High Returns Guaranteed
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Uganda's Most Profitable
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              Investment Portfolio
            </span>
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Exclusive opportunities with 15-35% ROI potential. FDI surged 79.2% to $2.9B in 2023. GDP growth 6.5% (2024/25). 
            Fast-track approvals, 10-year tax holidays, and dedicated support for qualifying investments. 
            Professional-grade opportunities in Agriculture, Tourism, Mining, ICT & Manufacturing sectors.
          </p>
        </motion.div>

        {/* Stats Overview with Uganda Flag Colors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {sectorStats.map((stat, index) => {
            const flagColors = [
              'bg-gradient-to-br from-black to-gray-800 text-white border-gray-600', // Black stripe
              'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black border-yellow-300', // Yellow stripe
              'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400', // Red stripe
              'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400', // Blue (heritage)
              'bg-gradient-to-br from-green-600 to-green-700 text-white border-green-400', // Green (nature)
              'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400' // Orange (prosperity)
            ]
            const colorClass = flagColors[index % flagColors.length]
            
            return (
              <div key={index} className={`${colorClass} rounded-2xl p-6 shadow-lg border-2 text-center relative overflow-hidden`}>
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
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold mb-1">{stat.opportunities}</div>
                <div className="text-sm opacity-80 mb-1">Opportunities</div>
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="text-xs opacity-70 mt-2 truncate">{stat.sector}</div>
              </div>
            )
          })}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Opportunities</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {filteredInvestments.length} opportunities found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            >
              <option value="All">All Sectors</option>
              {INVESTMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            >
              <option value="All">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            >
              <option value="priority">Sort by Priority</option>
              <option value="roi">Sort by ROI</option>
              <option value="investment">Sort by Investment Size</option>
            </select>

            <button 
              onClick={() => {
                // Filters are applied automatically via state, so show a notification
                addNotification({
                  type: 'success',
                  title: 'Filters Applied',
                  message: `Showing ${filteredInvestments.length} investment opportunities`,
                  duration: 3000
                })
              }}
              className="bg-gradient-to-r from-yellow-500 to-red-500 text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>

        {/* Investment Opportunities Grid */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}`}>
          {filteredInvestments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-400 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group ${
                viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
              }`}
              onClick={() => handleInvestmentClick(investment)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      investment.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : investment.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {investment.priority.toUpperCase()}
                    </div>
                    <LazyImage
                      src={investment.logo}
                      alt={investment.contact.agency}
                      className="w-8 h-8 object-contain bg-white rounded p-1"
                      fallbackSrc="/images/uganda-coat-of-arms.png"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {investment.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {investment.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Investment Range</span>
                      <span className="text-sm font-semibold text-green-600">{investment.investmentRange}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Expected ROI</span>
                      <span className="text-sm font-semibold text-blue-600">{investment.expectedROI}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Timeline</span>
                      <span className="text-sm font-semibold text-purple-600">{investment.timeline}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-2">{investment.contact.agency}</span>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button 
                          onClick={(e) => handleApplyNow(e, investment)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          title="Apply for Investment"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Apply Now
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTrackApplication(investment.id) }}
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
                          onClick={(e) => handleCall(e, investment.contact)}
                          className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                          title="Call Agency"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Call
                        </button>
                        <button 
                          onClick={(e) => handleEmail(e, investment.contact)}
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
                          onClick={(e) => handleWebsite(e, investment.contact)}
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
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center space-x-6">
                  <LazyImage
                    src={investment.logo}
                    alt={investment.contact.agency}
                    className="w-12 h-12 object-contain bg-white rounded p-2"
                    fallbackSrc="/images/uganda-coat-of-arms.png"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{investment.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        investment.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : investment.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {investment.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{investment.description}</p>
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="text-green-600 font-semibold">{investment.investmentRange}</span>
                      <span className="text-blue-600 font-semibold">{investment.expectedROI}</span>
                      <span className="text-purple-600 font-semibold">{investment.timeline}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={(e) => handleApplyNow(e, investment)}
                      className="flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-semibold rounded-lg transition-all"
                      title="Apply for Investment"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Apply
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTrackApplication(investment.id) }}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      title="Track Application"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Track
                    </button>
                    <button 
                      onClick={(e) => handleCall(e, investment.contact)}
                      className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                      title="Call Agency"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Call
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredInvestments.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl p-8 text-center text-black"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Start Investing?</h3>
          <p className="text-lg mb-8 opacity-90">
            Connect with our investment specialists to explore personalized opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                // Prompt user to send email for consultation
                const subject = encodeURIComponent('Investment Consultation Request - Uganda Investment Opportunity')
                const body = encodeURIComponent(`Dear Uganda Investment Authority Team,

I am interested in scheduling a consultation to explore investment opportunities in Uganda. Please provide me with:

1. Available consultation time slots
2. Investment sectors discussion
3. Required documentation
4. Investment incentives and procedures

My contact details:
- Name: [Please fill your name]
- Phone: [Please fill your phone]
- Investment Interest: [Please specify sector/amount]
- Preferred Meeting: [Online/In-person]

Looking forward to hearing from you.

Best regards,
[Your Name]`)
                
                window.open(`mailto:uia@ugandainvest.go.ug?subject=${subject}&body=${body}`, '_blank')
                
                addNotification({
                  type: 'success',
                  title: 'Email Client Opened',
                  message: 'Please complete and send the consultation request email to UIA',
                  duration: 5000
                })
              }}
              className="bg-black text-yellow-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Schedule Consultation
            </button>
            <button 
              onClick={() => {
                // Direct download of investment guide
                const link = document.createElement('a')
                link.href = '/storage/Title_ Why Invest in Uganda-.docx'
                link.download = 'Why_Invest_in_Uganda.docx'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                addNotification({
                  type: 'success',
                  title: 'Download Started',
                  message: 'Investment guide download has started',
                  duration: 3000
                })
              }}
              className="border-2 border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-black/10 transition-colors"
            >
              Download Investment Guide
            </button>
          </div>
        </motion.div>

        {/* Application Modal */}
        {showApplicationModal && selectedInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Investment Application</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">{selectedInvestment.title}</h4>
                <p className="text-sm text-orange-700">{selectedInvestment.description}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600 font-semibold">{selectedInvestment.investmentRange}</span>
                  <span className="text-blue-600 font-semibold">{selectedInvestment.expectedROI}</span>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const applicationData = Object.fromEntries(formData.entries())
                handleSubmitApplication(applicationData)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (USD) *</label>
                    <input
                      type="number"
                      name="investmentAmount"
                      required
                      min="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                  <select
                    name="experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="first-time">First-time investor</option>
                    <option value="some">Some experience (1-5 investments)</option>
                    <option value="experienced">Experienced (5+ investments)</option>
                    <option value="professional">Professional investor</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                  <textarea
                    name="comments"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Tell us more about your investment goals or any questions you have..."
                  ></textarea>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
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

export default Investments