import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Production-ready backend systems
import { enhancedCacheManager } from './utils/enhancedCacheManager.js'
import backgroundCacheManager from './utils/backgroundCacheManager.js'
import { securityManager } from './utils/security.js'
import { errorManager } from './utils/errorHandling.js'
import { errorReporter } from './utils/errorReporting.js'
import analyticsManager from './utils/analytics.js'
import { dataValidator } from './utils/dataValidation.js'
import { monitoringManager } from './utils/monitoring.js'

// Initialize production-ready backend
console.log('🚀 OSC Uganda - Production-Ready Investment Portal v3.1')
console.log('🛡️ Initializing comprehensive backend systems...')
console.log('🔗 Backend API:', import.meta.env.VITE_API_URL || 'https://treat-eu1e.onrender.com/api')

// Set up error handling first
errorManager.setUserContext({
  userType: 'visitor',
  platform: 'web',
  version: '3.0.0'
})

// Initialize security manager
const securityCheck = securityManager.performSecurityCheck()
console.log(`🔒 Security Status: ${securityCheck.status} (Score: ${securityCheck.score}/100)`)

// Initialize analytics with comprehensive tracking
analyticsManager.initialize({
  environment: 'production',
  userId: analyticsManager.getUserId(),
  sessionId: analyticsManager.userSession?.sessionId
})

// Start enhanced cache management
console.log('🚀 Starting enhanced cache management...')
enhancedCacheManager.init().then(() => {
  console.log('📊 Background cache monitoring active')
}).catch(error => {
  console.error('Cache manager initialization failed:', error)
})

// Start monitoring system
console.log('📊 Starting comprehensive monitoring...')

// Set up periodic health checks
setInterval(async () => {
  // Check cache performance
  const cacheStatus = await enhancedCacheManager.getCacheStatus()
  if (cacheStatus.metrics && cacheStatus.metrics.totalRequests > 100) {
    const hitRate = (cacheStatus.metrics.hits / cacheStatus.metrics.totalRequests) * 100
    if (hitRate < 70) {
      console.warn('⚠️ Cache hit rate below optimal:', `${hitRate.toFixed(2)  }%`)
    }
  }

  // Security health check
  if (Math.random() < 0.1) { // 10% chance every minute
    const secStatus = securityManager.performSecurityCheck()
    if (secStatus.score < 75) {
      console.warn('⚠️ Security score below threshold:', secStatus.score)
    }
  }
}, 60000) // Check every minute

// Global error handlers for unhandled errors
window.addEventListener('error', (event) => {
  errorManager.handleGlobalError(event)
  analyticsManager.trackEvent('javascript_error', {
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  errorManager.handleUnhandledRejection(event)
  analyticsManager.trackEvent('promise_rejection', {
    reason: event.reason?.message || String(event.reason)
  })
})

// Track application initialization
analyticsManager.trackEvent('app_initialization', {
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth}x${window.innerHeight}`
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Signal that React has mounted successfully
const removeLoadingScreen = () => {
  const loadingFallback = document.getElementById('loading-fallback')
  if (loadingFallback) {
    loadingFallback.style.display = 'none'
    console.log('✅ React app mounted and loading screen removed')
    // Add a marker to indicate React has taken over
    document.body.setAttribute('data-react-loaded', 'true')
  }
}

// Try multiple approaches to ensure loading screen is removed
setTimeout(removeLoadingScreen, 100)
setTimeout(removeLoadingScreen, 500) // Backup timeout
setTimeout(removeLoadingScreen, 1000) // Final backup

// Also remove on first React component render
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(removeLoadingScreen, 50)
})