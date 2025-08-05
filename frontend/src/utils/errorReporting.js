/**
 * Enhanced Error Reporting System
 * Captures and reports application errors with context
 */

export class ErrorReporter {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.sessionId = this.generateSessionId()
    this.setupGlobalHandlers()
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setupGlobalHandlers() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    })

    // Capture network errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.reportError({
            type: 'network_error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            timestamp: new Date().toISOString()
          })
        }
        return response
      } catch (error) {
        this.reportError({
          type: 'network_error',
          message: error.message,
          url: args[0],
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
        throw error
      }
    }
  }

  reportError(errorData) {
    const errorReport = {
      id: this.generateErrorId(),
      sessionId: this.sessionId,
      ...errorData,
      context: this.getContext()
    }

    // Store error locally
    this.errors.push(errorReport)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift() // Remove oldest error
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Report: ${errorReport.id}`)
      console.error('Error Details:', errorReport)
      console.groupEnd()
    }

    // Send to error tracking service (if configured)
    this.sendToErrorService(errorReport)

    return errorReport.id
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getContext() {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null,
      localStorage: this.getStorageSummary(localStorage),
      sessionStorage: this.getStorageSummary(sessionStorage)
    }
  }

  getStorageSummary(storage) {
    try {
      const keys = Object.keys(storage)
      const totalSize = keys.reduce((total, key) => {
        return total + (storage.getItem(key) || '').length
      }, 0)
      return {
        keys: keys.length,
        totalSize
      }
    } catch (error) {
      return { error: 'Access denied' }
    }
  }

  async sendToErrorService(errorReport) {
    try {
      // This would typically send to your error tracking service
      // For now, we'll store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorReport)
      
      // Keep only last 50 errors in localStorage
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (error) {
      // Silent fail for storage errors
    }
  }

  getErrorHistory() {
    return this.errors
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]')
    } catch (error) {
      return []
    }
  }

  clearErrors() {
    this.errors = []
    localStorage.removeItem('app_errors')
  }

  exportErrors() {
    const allErrors = {
      session: this.errors,
      stored: this.getStoredErrors(),
      sessionId: this.sessionId,
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(allErrors, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-report-${this.sessionId}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Manual error reporting for custom errors
  logError(message, context = {}) {
    return this.reportError({
      type: 'manual_error',
      message,
      ...context,
      timestamp: new Date().toISOString()
    })
  }

  // Navigation error reporting
  logNavigationError(route, error) {
    return this.reportError({
      type: 'navigation_error',
      message: `Navigation failed to ${route}`,
      route,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }

  // Component error reporting
  logComponentError(componentName, error, errorInfo) {
    return this.reportError({
      type: 'component_error',
      message: `Component ${componentName} crashed`,
      componentName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter()

// Expose globally for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.errorReporter = errorReporter
}

export default errorReporter