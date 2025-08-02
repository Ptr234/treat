// Professional Notification System - Beautiful, Modern, Feature-Rich
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const ProfessionalNotificationSystem = () => {
  const { notifications, removeNotification, clearAllNotifications } = useNotification()
  const [hoveredId, setHoveredId] = useState(null)
  const [pausedTimers, setPausedTimers] = useState(new Set())
  const soundRef = useRef(null)

  // Progress bar timer management
  const [progressBars, setProgressBars] = useState({})

  useEffect(() => {
    // Initialize progress bars for new notifications
    notifications.forEach(notification => {
      if (!progressBars[notification.id] && notification.duration > 0) {
        setProgressBars(prev => ({
          ...prev,
          [notification.id]: { 
            progress: 100, 
            startTime: Date.now(),
            duration: notification.duration,
            paused: false
          }
        }))
      }
    })

    // Clean up removed notifications
    Object.keys(progressBars).forEach(id => {
      if (!notifications.find(n => n.id.toString() === id)) {
        setProgressBars(prev => {
          const newBars = { ...prev }
          delete newBars[id]
          return newBars
        })
      }
    })
  }, [notifications, progressBars])

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressBars(prev => {
        const newBars = { ...prev }
        Object.keys(newBars).forEach(id => {
          if (!newBars[id].paused) {
            const elapsed = Date.now() - newBars[id].startTime
            const progress = Math.max(0, 100 - (elapsed / newBars[id].duration) * 100)
            newBars[id].progress = progress
          }
        })
        return newBars
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Handle mouse enter/leave for pause functionality
  const handleMouseEnter = (id) => {
    setHoveredId(id)
    setProgressBars(prev => ({
      ...prev,
      [id]: { ...prev[id], paused: true }
    }))
  }

  const handleMouseLeave = (id) => {
    setHoveredId(null)
    setProgressBars(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        paused: false,
        startTime: Date.now() - ((100 - prev[id].progress) / 100) * prev[id].duration
      }
    }))
  }

  // Play notification sound
  const playNotificationSound = (type) => {
    // Different tones for different types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 500
    }
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Fallback: no sound if audio context fails
    }
  }

  // Enhanced icons with better styling
  const getIcon = (type) => {
    const iconProps = {
      className: "w-6 h-6",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      strokeWidth: 2.5
    }

    switch (type) {
      case 'success':
        return (
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg {...iconProps} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <svg {...iconProps} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <svg {...iconProps} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <svg {...iconProps} className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  // Professional styling based on type
  const getNotificationStyle = (type) => {
    const baseStyle = "backdrop-blur-lg border shadow-2xl"
    
    switch (type) {
      case 'success':
        return `${baseStyle} bg-gradient-to-r from-green-50/95 to-emerald-50/95 border-green-200/50 shadow-green-500/20`
      case 'error':
        return `${baseStyle} bg-gradient-to-r from-red-50/95 to-rose-50/95 border-red-200/50 shadow-red-500/20`
      case 'warning':
        return `${baseStyle} bg-gradient-to-r from-yellow-50/95 to-amber-50/95 border-yellow-200/50 shadow-yellow-500/20`
      default:
        return `${baseStyle} bg-gradient-to-r from-blue-50/95 to-indigo-50/95 border-blue-200/50 shadow-blue-500/20`
    }
  }

  // Progress bar color
  const getProgressColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-400 to-emerald-500'
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-rose-500'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500'
      default:
        return 'bg-gradient-to-r from-blue-400 to-indigo-500'
    }
  }

  // Text colors
  const getTextColors = (type) => {
    switch (type) {
      case 'success':
        return { title: 'text-green-900', message: 'text-green-800' }
      case 'error':
        return { title: 'text-red-900', message: 'text-red-800' }
      case 'warning':
        return { title: 'text-yellow-900', message: 'text-yellow-800' }
      default:
        return { title: 'text-blue-900', message: 'text-blue-800' }
    }
  }

  return (
    <>
      {/* Notification Container */}
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => {
            const textColors = getTextColors(notification.type)
            const progressData = progressBars[notification.id]
            
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ 
                  opacity: 0, 
                  x: 400, 
                  scale: 0.8,
                  rotateY: 90
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotateY: 0
                }}
                exit={{ 
                  opacity: 0, 
                  x: 400, 
                  scale: 0.8,
                  rotateY: -90,
                  transition: { duration: 0.3 }
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.1
                }}
                whileHover={{ 
                  scale: 1.02,
                  x: -5,
                  transition: { duration: 0.2 }
                }}
                className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer group ${getNotificationStyle(notification.type)}`}
                onMouseEnter={() => handleMouseEnter(notification.id)}
                onMouseLeave={() => handleMouseLeave(notification.id)}
                onClick={() => removeNotification(notification.id)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16">
                    <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full"></div>
                  </div>
                </div>

                {/* Progress Bar */}
                {notification.duration > 0 && progressData && (
                  <div className="absolute bottom-0 left-0 w-full h-1">
                    <div className="w-full h-full bg-white/20"></div>
                    <motion.div
                      className={`absolute top-0 left-0 h-full ${getProgressColor(notification.type)} shadow-lg`}
                      initial={{ width: "100%" }}
                      animate={{ 
                        width: `${progressData.progress}%`,
                        transition: { 
                          duration: progressData.paused ? 0 : 0.1,
                          ease: "linear"
                        }
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start space-x-4 relative z-10">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  >
                    {getIcon(notification.type)}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <motion.h4
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`text-sm font-bold ${textColors.title} mb-1`}
                      >
                        {notification.title}
                      </motion.h4>
                    )}
                    {notification.message && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`text-sm ${textColors.message} leading-relaxed`}
                      >
                        {notification.message}
                      </motion.p>
                    )}
                    
                    {/* Action Button */}
                    {notification.action && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-3"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            notification.action.callback()
                            removeNotification(notification.id)
                          }}
                          className="inline-flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 text-current rounded-lg text-xs font-medium transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          {notification.action.text}
                        </button>
                      </motion.div>
                    )}
                    
                    {/* Timestamp */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 flex items-center justify-between"
                    >
                      <span className="text-xs opacity-60">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                      
                      {hoveredId === notification.id && !notification.action && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs opacity-75 font-medium"
                        >
                          Click to dismiss
                        </motion.span>
                      )}
                    </motion.div>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(notification.id)
                    }}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors opacity-60 hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${
                      notification.type === 'success' ? '#10b981' :
                      notification.type === 'error' ? '#ef4444' :
                      notification.type === 'warning' ? '#f59e0b' : '#3b82f6'
                    }, transparent)`
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Clear All Button */}
      <AnimatePresence>
        {notifications.length > 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllNotifications}
            className="fixed top-16 right-4 z-40 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800/90 transition-colors shadow-lg"
          >
            Clear All ({notifications.length})
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProfessionalNotificationSystem