import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  PlusIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Show hint for first-time users
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('quick_actions_hint')
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowHint(true)
        setTimeout(() => setShowHint(false), 4000)
        localStorage.setItem('quick_actions_hint', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Quick action items with contextual relevance
  const quickActions = [
    {
      id: 'investments',
      label: 'Browse Investments',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-emerald-600',
      action: () => { setIsOpen(false); navigate('/investments'); },
      description: 'Find high-ROI opportunities'
    },
    {
      id: 'services',
      label: 'Government Services',
      icon: BuildingLibraryIcon,
      color: 'from-blue-500 to-indigo-600',
      action: () => { setIsOpen(false); navigate('/services'); },
      description: 'Official business services'
    },
    {
      id: 'calculator',
      label: 'ROI Calculator',
      icon: CalculatorIcon,
      color: 'from-orange-500 to-red-600',
      action: () => { setIsOpen(false); navigate('/roi-calculator'); },
      description: 'Calculate returns'
    },
    {
      id: 'registration',
      label: 'Register Business',
      icon: DocumentTextIcon,
      color: 'from-purple-500 to-pink-600',
      action: () => { setIsOpen(false); navigate('/registration-wizard'); },
      description: 'Start business setup'
    },
    {
      id: 'support',
      label: 'Get Support',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-teal-500 to-cyan-600',
      action: () => { setIsOpen(false); navigate('/support'); },
      description: 'Help & assistance'
    },
    {
      id: 'contact',
      label: 'Call UIA',
      icon: PhoneIcon,
      color: 'from-red-500 to-pink-600',
      action: () => window.open('tel:+256414301000', '_self'),
      description: 'Direct phone support'
    }
  ]

  // Get contextual actions based on current page
  const getContextualActions = () => {
    const currentPath = location.pathname
    
    // Filter out current page action and show most relevant ones
    const filteredActions = quickActions.filter(action => 
      !currentPath.includes(action.id)
    )

    // Prioritize based on current context
    if (currentPath === '/') {
      return filteredActions.slice(0, 5) // Show top 5 for homepage
    } else if (currentPath.includes('investment')) {
      // For investment pages, prioritize calculator and registration
      const priority = ['calculator', 'services', 'registration', 'support']
      filteredActions.sort((a, b) => {
        const aIndex = priority.indexOf(a.id)
        const bIndex = priority.indexOf(b.id)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    } else if (currentPath.includes('service')) {
      // For services pages, prioritize registration and investment
      const priority = ['registration', 'investments', 'calculator', 'support']
      filteredActions.sort((a, b) => {
        const aIndex = priority.indexOf(a.id)
        const bIndex = priority.indexOf(b.id)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    }

    return filteredActions.slice(0, 5)
  }

  const contextualActions = getContextualActions()

  return (
    <>
      {/* Hint bubble */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-24 right-8 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
          >
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-yellow-300" />
              <p className="text-sm font-medium">Quick actions available here!</p>
            </div>
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-600"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-2 min-w-72"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200/50">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-600">Get things done faster</p>
              </div>

              {/* Action Items */}
              <div className="p-2 space-y-1">
                {contextualActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={(e) => {
                      e.preventDefault()
                      action.action()
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-all group text-left"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {action.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200/50 text-center">
                <p className="text-xs text-gray-500">
                  Need help? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/support')}>Contact Support</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-gray-600 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <ChevronUpIcon className="w-6 h-6" />
            ) : (
              <PlusIcon className="w-6 h-6" />
            )}
          </motion.div>
        </motion.button>

        {/* Action indicator dots */}
        {!isOpen && (
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{contextualActions.length}</span>
          </div>
        )}
      </div>
    </>
  )
}

export default QuickActions