// Production-Ready Error Handling and Logging System
// Comprehensive error tracking, reporting, and recovery

export class ErrorManager {
  constructor() {
    this.errorLog = new Map()
    this.performanceMetrics = new Map()
    this.userContext = null
    this.maxLogEntries = 1000
    this.initializeErrorHandling()
  }

  initializeErrorHandling() {
    // Global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
      
      // Performance monitoring
      this.setupPerformanceMonitoring()
    }

    // eslint-disable-next-line no-console
    console.log('🛡️ Error handling system initialized')
  }

  // Set user context for better error tracking
  setUserContext(context) {
    this.userContext = {
      ...context,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Handle global JavaScript errors
  handleGlobalError(event) {
    const errorInfo = {
      type: 'GLOBAL_ERROR',
      message: event.message,
      filename: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userContext: this.userContext
    }

    this.logError(errorInfo)
    this.showUserFriendlyError('An unexpected error occurred. Our team has been notified.')
    
    // Prevent default browser error handling
    return true
  }

  // Handle unhandled promise rejections
  handleUnhandledRejection(event) {
    const errorInfo = {
      type: 'UNHANDLED_REJECTION',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userContext: this.userContext
    }

    this.logError(errorInfo)
    this.showUserFriendlyError('A network or processing error occurred. Please try again.')
    
    // Prevent default browser handling
    event.preventDefault()
  }

  // Log errors with categorization
  logError(errorInfo, category = 'GENERAL') {
    const errorId = this.generateErrorId()
    const enhancedError = {
      id: errorId,
      category,
      severity: this.determineSeverity(errorInfo),
      ...errorInfo,
      browserInfo: this.getBrowserInfo(),
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo()
    }

    // Store in memory
    this.errorLog.set(errorId, enhancedError)
    
    // Cleanup old entries
    this.cleanupErrorLog()

    // Console logging with proper formatting
    this.formatConsoleError(enhancedError)

    // Send to monitoring service (in production)
    this.sendToMonitoringService(enhancedError)

    // Handle critical errors
    if (enhancedError.severity === 'CRITICAL') {
      this.handleCriticalError(enhancedError)
    }

    return errorId
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  determineSeverity(errorInfo) {
    const criticalPatterns = [
      /network error/i,
      /failed to fetch/i,
      /security error/i,
      /permission denied/i
    ]

    const warningPatterns = [
      /validation error/i,
      /timeout/i,
      /rate limit/i
    ]

    const message = errorInfo.message?.toLowerCase() || ''

    if (criticalPatterns.some(pattern => pattern.test(message))) {
      return 'CRITICAL'
    } else if (warningPatterns.some(pattern => pattern.test(message))) {
      return 'WARNING'
    } else if (errorInfo.type === 'UNHANDLED_REJECTION') {
      return 'HIGH'
    } else {
      return 'MEDIUM'
    }
  }

  formatConsoleError(errorInfo) {
    const colors = {
      CRITICAL: 'color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 3px;',
      HIGH: 'color: #ea580c; background: #fed7aa; padding: 2px 6px; border-radius: 3px;',
      WARNING: 'color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 3px;',
      MEDIUM: 'color: #2563eb; background: #dbeafe; padding: 2px 6px; border-radius: 3px;'
    }

    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `%c🚨 ${errorInfo.severity} ERROR: ${errorInfo.id}`,
      colors[errorInfo.severity] || colors.MEDIUM
    )
    
    // eslint-disable-next-line no-console
    console.error('Message:', errorInfo.message)
    // eslint-disable-next-line no-console
    console.error('Type:', errorInfo.type)
    // eslint-disable-next-line no-console
    console.error('Category:', errorInfo.category)
    // eslint-disable-next-line no-console
    console.error('Timestamp:', errorInfo.timestamp)
    
    if (errorInfo.stack) {
      // eslint-disable-next-line no-console
      console.error('Stack Trace:', errorInfo.stack)
    }
    
    if (errorInfo.userContext) {
      // eslint-disable-next-line no-console
      console.error('User Context:', errorInfo.userContext)
    }
    
    // eslint-disable-next-line no-console
    console.error('Browser Info:', errorInfo.browserInfo)
    // eslint-disable-next-line no-console
    console.error('Full Error Object:', errorInfo)
    // eslint-disable-next-line no-console
    console.groupEnd()
  }

  getBrowserInfo() {
    if (typeof navigator === 'undefined') return {}
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor
    }
  }

  getDeviceInfo() {
    if (typeof window === 'undefined') return {}
    
    return {
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  getNetworkInfo() {
    if (typeof navigator === 'undefined' || !navigator.connection) return {}
    
    const connection = navigator.connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }

  // Handle different error types
  handleAPIError(error, endpoint, requestData = null) {
    const errorInfo = {
      type: 'API_ERROR',
      message: error.message,
      endpoint,
      requestData,
      status: error.status,
      statusText: error.statusText,
      timestamp: new Date().toISOString()
    }

    return this.logError(errorInfo, 'API')
  }

  handleValidationError(field, value, rule) {
    const errorInfo = {
      type: 'VALIDATION_ERROR',
      message: `Validation failed for field '${field}' with value '${value}' against rule '${rule}'`,
      field,
      value,
      rule,
      timestamp: new Date().toISOString()
    }

    return this.logError(errorInfo, 'VALIDATION')
  }

  handleBusinessLogicError(operation, context, details) {
    const errorInfo = {
      type: 'BUSINESS_LOGIC_ERROR',
      message: `Business logic error in operation '${operation}'`,
      operation,
      context,
      details,
      timestamp: new Date().toISOString()
    }

    return this.logError(errorInfo, 'BUSINESS')
  }

  handleSecurityError(threat, details) {
    const errorInfo = {
      type: 'SECURITY_ERROR',
      message: `Security threat detected: ${threat}`,
      threat,
      details,
      timestamp: new Date().toISOString()
    }

    this.logError(errorInfo, 'SECURITY')
    this.alertSecurityTeam(errorInfo)
    return errorInfo.id
  }

  // Critical error handling
  handleCriticalError(errorInfo) {
    // eslint-disable-next-line no-console
    console.error('🚨 CRITICAL ERROR DETECTED:', errorInfo)
    
    // Show prominent user notification
    this.showCriticalErrorNotification(errorInfo)
    
    // Try to save user work if possible
    this.attemptDataRecovery()
    
    // Send immediate alert
    this.sendCriticalAlert(errorInfo)
  }

  showCriticalErrorNotification(errorInfo) {
    if (typeof document === 'undefined') return

    const notification = document.createElement('div')
    notification.id = 'critical-error-notification'
    notification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      padding: 16px;
      z-index: 10002;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border-bottom: 3px solid #fbbf24;
    `
    
    notification.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">🚨</span>
          <div style="text-align: left;">
            <div style="font-weight: bold; font-size: 16px;">Critical Error Detected</div>
            <div style="font-size: 14px; opacity: 0.9;">Error ID: ${errorInfo.id} | Our team has been automatically notified</div>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <button onclick="window.location.reload()" 
                  style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Reload Page
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px;">
            ×
          </button>
        </div>
      </div>
    `
    
    // Remove any existing critical error notifications
    const existing = document.getElementById('critical-error-notification')
    if (existing) existing.remove()
    
    document.body.appendChild(notification)
  }

  attemptDataRecovery() {
    try {
      // Get form data from page
      const forms = document.querySelectorAll('form')
      const formData = {}
      
      forms.forEach((form, index) => {
        const data = new FormData(form)
        formData[`form_${index}`] = Object.fromEntries(data.entries())
      })

      if (Object.keys(formData).length > 0) {
        localStorage.setItem(`emergency_backup_${Date.now()}`, JSON.stringify(formData))
        // eslint-disable-next-line no-console
        console.log('💾 Emergency data backup created')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create emergency backup:', error)
    }
  }

  // User-friendly error display
  showUserFriendlyError(message, type = 'error') {
    if (typeof document === 'undefined') return

    const colors = {
      error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
      warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
      info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' }
    }

    const color = colors[type] || colors.error
    const icons = { error: '❌', warning: '⚠️', info: 'ℹ️' }

    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${color.bg};
      border: 1px solid ${color.border};
      color: ${color.text};
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.5;
    `
    
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 18px; flex-shrink: 0;">${icons[type]}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <div>${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: ${color.text}; font-size: 18px; cursor: pointer; opacity: 0.7; hover:opacity: 1;">
          ×
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 8000)
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    if (typeof PerformanceObserver === 'undefined') return

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask' && entry.duration > 100) {
            this.logError({
              type: 'PERFORMANCE_WARNING',
              message: `Long task detected: ${entry.duration}ms`,
              duration: entry.duration,
              startTime: entry.startTime
            }, 'PERFORMANCE')
          }
        })
      })
      
      observer.observe({ entryTypes: ['longtask'] })
    }

    // Monitor memory usage
    this.monitorMemoryUsage()
  }

  monitorMemoryUsage() {
    if (!performance.memory) return

    setInterval(() => {
      const memory = performance.memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
      
      // Alert if memory usage is high
      if (usedMB > limitMB * 0.8) {
        this.logError({
          type: 'MEMORY_WARNING',
          message: `High memory usage: ${usedMB}MB / ${limitMB}MB`,
          usedMemory: usedMB,
          memoryLimit: limitMB,
          percentage: Math.round((usedMB / limitMB) * 100)
        }, 'PERFORMANCE')
      }
    }, 30000) // Check every 30 seconds
  }

  // Monitoring service integration (mock)
  sendToMonitoringService(errorInfo) {
    // In production, send to services like Sentry, LogRocket, etc.
    // eslint-disable-next-line no-console
    console.log('📡 Sending error to monitoring service:', errorInfo.id)
    
    // Store in localStorage for now
    const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
    storedErrors.push({
      id: errorInfo.id,
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: errorInfo.message,
      timestamp: errorInfo.timestamp
    })
    
    // Keep only last 100 errors
    if (storedErrors.length > 100) {
      storedErrors.splice(0, storedErrors.length - 100)
    }
    
    localStorage.setItem('error_reports', JSON.stringify(storedErrors))
  }

  sendCriticalAlert(errorInfo) {
    // eslint-disable-next-line no-console
    console.error('🚨 SENDING CRITICAL ALERT:', errorInfo.id)
    // In production, this would trigger immediate notifications to the dev team
  }

  alertSecurityTeam(errorInfo) {
    // eslint-disable-next-line no-console
    console.error('🔒 SECURITY ALERT:', errorInfo.id)
    // In production, this would alert the security team
  }

  // Cleanup methods
  cleanupErrorLog() {
    if (this.errorLog.size > this.maxLogEntries) {
      const entries = Array.from(this.errorLog.entries())
      const toRemove = entries.slice(0, entries.length - this.maxLogEntries)
      toRemove.forEach(([id]) => this.errorLog.delete(id))
    }
  }

  // Get error statistics
  getErrorStats() {
    const errors = Array.from(this.errorLog.values())
    const stats = {
      total: errors.length,
      bySeverity: {},
      byCategory: {},
      byType: {},
      recent: errors.filter(e => Date.now() - new Date(e.timestamp).getTime() < 3600000) // Last hour
    }

    errors.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })

    return stats
  }

  // Error recovery utilities
  createErrorBoundary() {
    return {
      componentDidCatch: (error, errorInfo) => {
        this.logError({
          type: 'REACT_ERROR_BOUNDARY',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }, 'REACT')
      }
    }
  }

  // Export error logs
  exportErrorLogs() {
    const errors = Array.from(this.errorLog.values())
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `error_logs_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const errorManager = new ErrorManager()

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.errorManager = errorManager
}

export default errorManager