import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  InformationCircleIcon,
  ChevronRightIcon,
  XMarkIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const NavigationGuide = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentGuide, setCurrentGuide] = useState(null)
  const [hasSeenGuide, setHasSeenGuide] = useState({})
  const location = useLocation()
  const navigate = useNavigate()

  // Navigation guidance content for each page
  const navigationGuides = {
    '/': {
      title: 'Welcome to Uganda Investment Portal',
      description: 'Your gateway to investment opportunities in Uganda',
      steps: [
        { 
          text: 'Explore investment sectors with 15-35% ROI potential',
          action: () => navigate('/investments'),
          actionText: 'View Investments',
          icon: 'investment'
        },
        { 
          text: 'Access 50+ government services for business setup',
          action: () => navigate('/services'),
          actionText: 'Browse Services',
          icon: 'services'
        },
        { 
          text: 'Connect with government agencies and support',
          action: () => navigate('/agencies'),
          actionText: 'Find Agencies',
          icon: 'agencies'
        }
      ],
      nextBestAction: {
        text: 'Start with investment opportunities',
        path: '/investments'
      }
    },
    '/investments': {
      title: 'Investment Opportunities Guide',
      description: 'Find the perfect investment match for your goals',
      steps: [
        { 
          text: 'Use filters to find investments by sector, priority, or amount',
          highlight: 'filters',
          icon: 'filter'
        },
        { 
          text: 'Click on any investment card to view detailed information',
          highlight: 'cards',
          icon: 'view'
        },
        { 
          text: 'Use "Apply Now" to start your investment application',
          highlight: 'apply',
          icon: 'apply'
        },
        { 
          text: 'Calculate potential returns with our ROI calculator',
          action: () => navigate('/roi-calculator'),
          actionText: 'Calculate ROI',
          icon: 'calculator'
        }
      ],
      nextBestAction: {
        text: 'Calculate investment returns',
        path: '/roi-calculator'
      }
    },
    '/services': {
      title: 'Government Services Navigation',
      description: 'Access official Uganda government services efficiently',
      steps: [
        { 
          text: 'Search for specific services or browse by category',
          highlight: 'search',
          icon: 'search'
        },
        { 
          text: 'Investment Support services offer premium benefits',
          highlight: 'investment-services',
          icon: 'premium'
        },
        { 
          text: 'Click "Submit Application" to start official processes',
          highlight: 'submit',
          icon: 'submit'
        },
        { 
          text: 'Use contact buttons to reach agencies directly',
          highlight: 'contact',
          icon: 'contact'
        }
      ],
      nextBestAction: {
        text: 'Start business registration',
        path: '/registration-wizard'
      }
    },
    '/agencies': {
      title: 'Agency Directory Guide',
      description: 'Connect with the right government agencies',
      steps: [
        { 
          text: 'Browse agencies by sector or use search to find specific ones',
          icon: 'search'
        },
        { 
          text: 'View contact details, office hours, and services offered',
          icon: 'info'
        },
        { 
          text: 'Use direct contact buttons for immediate assistance',
          icon: 'contact'
        }
      ],
      nextBestAction: {
        text: 'Download business resources',
        path: '/downloads'
      }
    }
  }

  // Check if user should see guide for current page
  useEffect(() => {
    const currentPath = location.pathname
    const guide = navigationGuides[currentPath]
    
    if (guide && !hasSeenGuide[currentPath]) {
      // Show guide after a short delay
      const timer = setTimeout(() => {
        setCurrentGuide(guide)
        setIsVisible(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [location.pathname, hasSeenGuide])

  // Load seen guides from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('navigation_guides_seen')
    if (seen) {
      setHasSeenGuide(JSON.parse(seen))
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    const newSeen = { ...hasSeenGuide, [location.pathname]: true }
    setHasSeenGuide(newSeen)
    localStorage.setItem('navigation_guides_seen', JSON.stringify(newSeen))
  }

  const handleNextAction = () => {
    if (currentGuide?.nextBestAction) {
      navigate(currentGuide.nextBestAction.path)
      handleDismiss()
    }
  }

  const getStepIcon = (iconType) => {
    const iconProps = { className: "w-5 h-5" }
    switch (iconType) {
      case 'investment': return <ArrowRightIcon {...iconProps} className="w-5 h-5 text-green-500" />
      case 'services': return <CheckCircleIcon {...iconProps} className="w-5 h-5 text-blue-500" />
      case 'agencies': return <InformationCircleIcon {...iconProps} className="w-5 h-5 text-purple-500" />
      case 'filter': return <LightBulbIcon {...iconProps} className="w-5 h-5 text-yellow-500" />
      case 'calculator': return <ArrowRightIcon {...iconProps} className="w-5 h-5 text-orange-500" />
      default: return <ChevronRightIcon {...iconProps} className="w-5 h-5 text-gray-400" />
    }
  }

  if (!isVisible || !currentGuide) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            
            <div className="flex items-center mb-2">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-300" />
              <h3 className="font-bold text-lg">{currentGuide.title}</h3>
            </div>
            <p className="text-blue-100 text-sm">{currentGuide.description}</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {currentGuide.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">{step.text}</p>
                  {step.action && (
                    <button
                      onClick={step.action}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {step.actionText}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer with next action */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Recommended next:</span>
              <button
                onClick={handleNextAction}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                <span>{currentGuide.nextBestAction.text}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1">
            <motion.div
              className="h-full bg-white/50"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default NavigationGuide