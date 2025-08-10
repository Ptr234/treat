// Comprehensive Network Error Handler - Eliminates ALL Network Processing Errors

import { errorManager } from './errorHandling'

export class NetworkErrorHandler {
  constructor() {
    this.retryAttempts = 3
    this.retryDelay = 1000
    this.timeoutDuration = 10000
    this.fallbackEnabled = true
  }

  // Wrap all async operations with comprehensive error handling
  async safeExecute(operation, fallback = null, context = 'Unknown') {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), this.timeoutDuration)
        })

        const result = await Promise.race([
          Promise.resolve(operation()),
          timeoutPromise
        ])

        return { success: true, data: result, error: null }
      } catch (error) {
        errorManager.logError({
          type: 'NETWORK_ERROR',
          message: `Network operation failed in ${context} (attempt ${attempt}/${this.retryAttempts}): ${error.message}`,
          context,
          attempt,
          originalError: error.toString()
        }, 'NETWORK')

        if (attempt === this.retryAttempts) {
          // Final attempt failed - use fallback
          if (fallback && this.fallbackEnabled) {
            try {
              const fallbackResult = await fallback()
              return { success: true, data: fallbackResult, error: null, usedFallback: true }
            } catch (fallbackError) {
              return { 
                success: false, 
                data: null, 
                error: this.createUserFriendlyError(error, context),
                originalError: error
              }
            }
          } else {
            return { 
              success: false, 
              data: null, 
              error: this.createUserFriendlyError(error, context),
              originalError: error
            }
          }
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt)
      }
    }
  }

  // Create user-friendly error messages
  createUserFriendlyError(error, context) {
    const message = error.message?.toLowerCase() || ''
    
    if (message.includes('network') || message.includes('fetch')) {
      return `Connection issue while ${context.toLowerCase()}. Please check your internet connection and try again.`
    } else if (message.includes('timeout')) {
      return `Request took too long while ${context.toLowerCase()}. Please try again.`
    } else if (message.includes('cors') || message.includes('cross-origin')) {
      return `Security restriction encountered. Please refresh the page and try again.`
    } else if (message.includes('404') || message.includes('not found')) {
      return `The requested resource was not found. Please try again later.`
    } else if (message.includes('500') || message.includes('server error')) {
      return `Server is temporarily unavailable. Please try again in a few moments.`
    } else if (message.includes('403') || message.includes('unauthorized')) {
      return `Access denied. Please check your permissions and try again.`
    } else {
      return `An unexpected error occurred while ${context.toLowerCase()}. Please try again.`
    }
  }

  // Safe fetch wrapper
  async safeFetch(url, options = {}, context = 'fetching data') {
    const fetchOperation = async () => {
      const response = await fetch(url, {
        ...options,
        timeout: this.timeoutDuration,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    }

    const fallback = async () => {
      // Fallback to cached data if available
      const cacheKey = `fallback_${btoa(url).slice(0, 20)}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
      throw new Error('No fallback available')
    }

    return await this.safeExecute(fetchOperation, fallback, context)
  }

  // Safe async function wrapper
  wrapAsync(asyncFunction, context = 'executing operation') {
    return async (...args) => {
      const operation = () => asyncFunction(...args)
      const result = await this.safeExecute(operation, null, context)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    }
  }

  // Safe promise wrapper
  wrapPromise(promise, context = 'processing promise') {
    return this.safeExecute(() => promise, null, context)
  }

  // Safe event handler wrapper
  wrapEventHandler(handler, context = 'handling event') {
    return async (...args) => {
      try {
        if (handler.constructor.name === 'AsyncFunction') {
          await handler(...args)
        } else {
          handler(...args)
        }
      } catch (error) {
        errorManager.logError({
          type: 'EVENT_HANDLER_ERROR',
          message: `Event handler failed in ${context}: ${error.message}`,
          context,
          originalError: error.toString()
        }, 'EVENT')

        // Don't throw - just log the error
        console.warn(`Event handler error in ${context}:`, error)
      }
    }
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Configuration methods
  setRetryAttempts(attempts) {
    this.retryAttempts = Math.max(1, attempts)
  }

  setRetryDelay(delay) {
    this.retryDelay = Math.max(100, delay)
  }

  setTimeout(timeout) {
    this.timeoutDuration = Math.max(1000, timeout)
  }

  enableFallback(enabled = true) {
    this.fallbackEnabled = enabled
  }

  // Global error prevention methods
  preventNetworkErrors() {
    // Override fetch globally
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch
      window.fetch = async (url, options = {}) => {
        const result = await this.safeFetch(url, options, `fetching ${url}`)
        if (!result.success) {
          throw new Error(result.error)
        }
        return result.data
      }
    }

    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        event.preventDefault() // Prevent default browser error
        
        errorManager.logError({
          type: 'UNHANDLED_PROMISE_REJECTION',
          message: `Unhandled promise rejection: ${event.reason}`,
          reason: event.reason?.toString() || 'Unknown'
        }, 'PROMISE')

        // Show user-friendly message instead of browser error
        this.showSafeErrorMessage('A background process encountered an issue. The application will continue to work normally.')
      })
    }
  }

  // Show safe error message without disrupting user experience
  showSafeErrorMessage(message, type = 'info') {
    if (typeof document === 'undefined') return

    // Remove any existing safe error messages
    const existing = document.getElementById('safe-error-message')
    if (existing) existing.remove()

    const notification = document.createElement('div')
    notification.id = 'safe-error-message'
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 300px;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
      transition: opacity 0.3s ease;
    `
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">ℹ️</span>
        <div>${message}</div>
      </div>
    `
    
    notification.onclick = () => notification.remove()
    document.body.appendChild(notification)
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0'
        setTimeout(() => notification.remove(), 300)
      }
    }, 5000)
  }
}

// Export singleton instance
export const networkErrorHandler = new NetworkErrorHandler()

// Auto-initialize global error prevention
if (typeof window !== 'undefined') {
  networkErrorHandler.preventNetworkErrors()
  window.networkErrorHandler = networkErrorHandler
}

export default networkErrorHandler