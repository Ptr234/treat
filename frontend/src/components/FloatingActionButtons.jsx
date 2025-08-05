import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const FloatingActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { addNotification } = useNotification()

  const actions = [
    {
      label: 'Emergency Support',
      icon: '🚨',
      action: () => {
        // Direct phone call
        window.location.href = 'tel:+256775692335'
        setIsOpen(false)
      }
    },
    {
      label: 'Quick Chat',
      icon: '💬',
      action: () => {
        addNotification({
          type: 'info',
          title: 'Chat Support',
          message: 'Live chat is available Mon-Fri, 9AM-4PM',
          duration: 5000
        })
      }
    },
    {
      label: 'Feedback',
      icon: '📝',
      action: () => {
        setIsOpen(false)
        // Show feedback form
        window.openFeedbackForm?.()
      }
    }
  ]

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  action.action()
                  setIsOpen(false)
                }}
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="mr-2 text-lg">{action.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors ${
          isOpen ? 'rotate-45' : ''
        }`}
        style={{ transition: 'transform 0.2s ease' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </motion.button>
    </div>
  )
}

export default FloatingActionButtons