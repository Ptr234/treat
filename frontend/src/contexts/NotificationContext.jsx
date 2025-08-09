import React, { createContext, useContext, useState, useCallback } from 'react'

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

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      duration: 1000,
      ...notification,
      timestamp: Date.now()
    }

    // Filter out warning notifications completely
    if (newNotification.type === 'warning') {
      return
    }

    // If reduced notifications mode is on, only show errors and critical info
    if (isReducedNotifications && !['error'].includes(newNotification.type)) {
      return
    }

    // Limit to 3 notifications at once for better UX
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 3)
      return updated
    })

    // Auto-remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [isReducedNotifications])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const toggleReducedNotifications = useCallback(() => {
    setIsReducedNotifications(prev => !prev)
  }, [])

  // Convenience methods for different notification types
  const showSuccess = useCallback((title, message, duration) => {
    return addNotification({ type: 'success', title, message, duration })
  }, [addNotification])

  const showError = useCallback((title, message, duration) => {
    return addNotification({ type: 'error', title, message, duration })
  }, [addNotification])

  const showWarning = useCallback((title, message, duration) => {
    return addNotification({ type: 'warning', title, message, duration })
  }, [addNotification])

  const showInfo = useCallback((title, message, duration) => {
    return addNotification({ type: 'info', title, message, duration })
  }, [addNotification])

  const addErrorWithAction = useCallback((message, actionText = 'Go Back', actionCallback = null) => {
    return addNotification({
      type: 'error',
      title: 'Error',
      message,
      duration: 6000,
      action: {
        text: actionText,
        callback: actionCallback || (() => {
          if (window.history.length > 1) {
            window.history.back()
          } else {
            window.location.href = '/'
          }
        })
      }
    })
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    isReducedNotifications,
    toggleReducedNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addErrorWithAction
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}