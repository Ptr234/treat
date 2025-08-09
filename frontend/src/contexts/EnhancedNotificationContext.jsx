// Enhanced Professional Notification Context
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [isReducedNotifications, setIsReducedNotifications] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState([])
  const [settings, setSettings] = useState({
    soundEnabled: true,
    animationsEnabled: true,
    maxNotifications: 4,
    defaultDuration: 5000,
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left
    theme: 'auto' // light, dark, auto
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings))
  }, [settings])

  // Enhanced notification creation
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      duration: settings.defaultDuration,
      priority: 'normal', // low, normal, high, critical
      category: 'general', // general, system, user-action, error
      dismissible: true,
      persistent: false,
      actionButton: null,
      ...notification,
      timestamp: Date.now(),
      read: false
    }

    // Filter out warning notifications completely
    if (newNotification.type === 'warning') {
      return id
    }

    // If reduced notifications mode is on, only show critical notifications
    if (isReducedNotifications && newNotification.priority !== 'critical') {
      return id
    }

    // Add to history
    setNotificationHistory(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50

    // Limit active notifications based on settings
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, settings.maxNotifications)
      return updated
    })

    // Auto-remove notification (if not persistent)
    if (newNotification.duration > 0 && !newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound(newNotification.type, newNotification.priority)
    }

    return id
  }, [isReducedNotifications, settings])

  // Play notification sound
  const playNotificationSound = useCallback((type, priority) => {
    if (!settings.soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different types and priorities
      const baseFrequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500
      }
      
      const priorityMultiplier = {
        low: 0.8,
        normal: 1,
        high: 1.2,
        critical: 1.4
      }
      
      const frequency = (baseFrequencies[type] || 500) * (priorityMultiplier[priority] || 1)
      const duration = priority === 'critical' ? 0.6 : 0.3
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      // Fallback: no sound if audio context fails
      console.warn('Notification sound failed:', error)
    }
  }, [settings.soundEnabled])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setNotificationHistory(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const toggleReducedNotifications = useCallback(() => {
    setIsReducedNotifications(prev => !prev)
  }, [])

  // Enhanced notification methods with better defaults
  const showSuccess = useCallback((title, message, options = {}) => {
    return addNotification({ 
      type: 'success', 
      title, 
      message, 
      duration: 4000,
      priority: 'normal',
      ...options 
    })
  }, [addNotification])

  const showError = useCallback((title, message, options = {}) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000,
      priority: 'high',
      persistent: true,
      ...options 
    })
  }, [addNotification])

  const showWarning = useCallback((title, message, options = {}) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      message, 
      duration: 6000,
      priority: 'normal',
      ...options 
    })
  }, [addNotification])

  const showInfo = useCallback((title, message, options = {}) => {
    return addNotification({ 
      type: 'info', 
      title, 
      message, 
      duration: 5000,
      priority: 'normal',
      ...options 
    })
  }, [addNotification])

  // Critical notifications (persistent by default)
  const showCritical = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      priority: 'critical',
      persistent: true,
      duration: 0, // Don't auto-dismiss
      ...options
    })
  }, [addNotification])

  // Action notifications with buttons
  const showActionNotification = useCallback((title, message, actionButton, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      actionButton,
      duration: 10000, // Longer duration for action notifications
      ...options
    })
  }, [addNotification])

  // Batch notifications for related actions
  const showBatch = useCallback((notifications) => {
    const ids = []
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        const id = addNotification(notification)
        ids.push(id)
      }, index * 200) // Stagger notifications
    })
    return ids
  }, [addNotification])

  // Statistics
  const getNotificationStats = useCallback(() => {
    const total = notificationHistory.length
    const unread = notificationHistory.filter(n => !n.read).length
    const byType = notificationHistory.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {})
    
    return { total, unread, byType, active: notifications.length }
  }, [notificationHistory, notifications])

  const value = {
    // Core state
    notifications,
    notificationHistory,
    settings,
    isReducedNotifications,
    
    // Core methods
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    toggleReducedNotifications,
    updateSettings,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCritical,
    showActionNotification,
    showBatch,
    
    // Utilities
    getNotificationStats,
    playNotificationSound
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}