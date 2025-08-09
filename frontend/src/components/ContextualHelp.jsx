import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  LightBulbIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const ContextualHelp = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [helpContent, setHelpContent] = useState(null)
  const [userActions, setUserActions] = useState([])
  const location = useLocation()

  // Help content for different pages and situations
  const helpDatabase = {
    '/investments': {
      page: {
        title: 'Investment Opportunities Help',
        content: [
          { type: 'tip', text: 'Use the sector filter to narrow down investments by industry' },
          { type: 'tip', text: 'Sort by ROI to see the highest return opportunities first' },
          { type: 'info', text: 'Investment Support services offer premium benefits and faster processing' },
          { type: 'action', text: 'Click "Apply Now" to start your investment application process' }
        ]
      },
      noResults: {
        title: 'No Investment Matches Found',
        content: [
          { type: 'suggestion', text: 'Try broadening your search criteria or clearing filters' },
          { type: 'suggestion', text: 'Consider related sectors - many investments span multiple industries' },
          { type: 'action', text: 'Contact our investment advisors for personalized recommendations' }
        ]
      },
      firstVisit: {
        title: 'Welcome to Investment Opportunities',
        content: [
          { type: 'intro', text: 'Uganda offers investment opportunities with 15-35% ROI potential' },
          { type: 'tip', text: 'Start by exploring sectors that match your investment goals and experience' },
          { type: 'tip', text: 'Use our ROI calculator to project potential returns on your investment' }
        ]
      }
    },
    '/services': {
      page: {
        title: 'Government Services Help',
        content: [
          { type: 'tip', text: 'Search by service name, agency, or keywords for faster results' },
          { type: 'info', text: 'Investment Support services provide premium assistance for serious investors' },
          { type: 'tip', text: 'Use the category filter to browse services by business type' }
        ]
      },
      businessRegistration: {
        title: 'Business Registration Guide',
        content: [
          { type: 'step', text: '1. Choose your business structure (Company, Partnership, etc.)' },
          { type: 'step', text: '2. Reserve your company name with URSB' },
          { type: 'step', text: '3. Prepare required documents and complete application' },
          { type: 'step', text: '4. Pay registration fees and await certificate' }
        ]
      }
    },
    '/agencies': {
      page: {
        title: 'Government Agencies Directory',
        content: [
          { type: 'tip', text: 'Each agency specializes in different business aspects - choose the right one for your needs' },
          { type: 'info', text: 'Contact information includes direct phone numbers and email addresses' },
          { type: 'tip', text: 'Many agencies offer online services to save you time and travel' }
        ]
      }
    }
  }

  // Track user actions for contextual help
  const trackUserAction = useCallback((action, data = {}) => {
    setUserActions(prev => [...prev, { action, data, timestamp: Date.now() }].slice(-10))
  }, [])

  // Detect when help might be needed
  useEffect(() => {
    const currentPath = location.pathname
    const pageHelp = helpDatabase[currentPath]?.page
    
    if (pageHelp) {
      // Show help after user has been on page for a bit
      const timer = setTimeout(() => {
        const hasSeenPageHelp = localStorage.getItem(`help_seen_${currentPath}`)
        if (!hasSeenPageHelp) {
          setHelpContent(pageHelp)
          setIsVisible(true)
        }
      }, 8000) // Show after 8 seconds on page
      
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  // Detect specific scenarios that need help
  useEffect(() => {
    const recentActions = userActions.slice(-3)
    const currentPath = location.pathname
    
    // User seems stuck - multiple searches with no results
    const multipleSearches = recentActions.filter(a => a.action === 'search').length >= 2
    const noResults = recentActions.some(a => a.action === 'no_results')
    
    if (multipleSearches && noResults && helpDatabase[currentPath]?.noResults) {
      setHelpContent(helpDatabase[currentPath].noResults)
      setIsVisible(true)
    }
    
    // User is looking at business registration services
    const viewingBusinessServices = recentActions.some(a => 
      a.action === 'view_service' && a.data?.category?.includes('Business Registration')
    )
    
    if (viewingBusinessServices && helpDatabase[currentPath]?.businessRegistration) {
      setHelpContent(helpDatabase[currentPath].businessRegistration)
      setIsVisible(true)
    }
  }, [userActions, location.pathname])

  // Global help trigger for complex forms or errors
  useEffect(() => {
    const handleGlobalHelp = (event) => {
      if (event.detail?.type === 'form_error') {
        setHelpContent({
          title: 'Form Submission Help',
          content: [
            { type: 'tip', text: 'Check all required fields are filled correctly' },
            { type: 'tip', text: 'Ensure phone numbers are in correct format (+256...)' },
            { type: 'action', text: 'Contact support if the issue persists' }
          ]
        })
        setIsVisible(true)
      } else if (event.detail?.type === 'api_error') {
        setHelpContent({
          title: 'Connection Issue',
          content: [
            { type: 'info', text: 'There seems to be a connection issue' },
            { type: 'suggestion', text: 'Check your internet connection and try again' },
            { type: 'action', text: 'Refresh the page if the problem continues' }
          ]
        })
        setIsVisible(true)
      }
    }

    window.addEventListener('contextual-help', handleGlobalHelp)
    return () => window.removeEventListener('contextual-help', handleGlobalHelp)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    if (helpContent?.title) {
      localStorage.setItem(`help_seen_${location.pathname}`, 'true')
    }
  }

  const getContentIcon = (type) => {
    const iconProps = { className: "w-4 h-4 flex-shrink-0 mt-0.5" }
    switch (type) {
      case 'tip': return <LightBulbIcon {...iconProps} className="w-4 h-4 text-yellow-500 mt-0.5" />
      case 'info': return <InformationCircleIcon {...iconProps} className="w-4 h-4 text-blue-500 mt-0.5" />
      case 'action': return <ArrowRightIcon {...iconProps} className="w-4 h-4 text-green-500 mt-0.5" />
      case 'suggestion': return <ChatBubbleLeftRightIcon {...iconProps} className="w-4 h-4 text-purple-500 mt-0.5" />
      case 'step': return <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</div>
      case 'intro': return <InformationCircleIcon {...iconProps} className="w-4 h-4 text-green-500 mt-0.5" />
      default: return <QuestionMarkCircleIcon {...iconProps} className="w-4 h-4 text-gray-500 mt-0.5" />
    }
  }

  // Expose tracking function globally for other components
  useEffect(() => {
    window.trackHelp = trackUserAction
    return () => {
      delete window.trackHelp
    }
  }, [trackUserAction])

  if (!isVisible || !helpContent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        className="fixed top-1/2 right-6 transform -translate-y-1/2 z-50 max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            
            <div className="flex items-center mb-2">
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-blue-200" />
              <h3 className="font-bold text-lg">{helpContent.title}</h3>
            </div>
            <p className="text-blue-100 text-sm">Helpful tips for your current task</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {helpContent.content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {getContentIcon(item.type)}
                <p className="text-gray-800 text-sm leading-relaxed flex-1">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600 mb-2">Need more help?</p>
            <button
              onClick={() => {
                handleDismiss()
                // Navigate to support or open chat
                window.open('/support', '_blank')
              }}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ContextualHelp