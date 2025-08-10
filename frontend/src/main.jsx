import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './utils/consoleManager.js' // Initialize console management

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
// App initialization logging removed for production

// Set up error handling first
errorManager.setUserContext({
  userType: 'visitor',
  platform: 'web',
  version: '3.0.0'
})

// Initialize security manager
const securityCheck = securityManager.performSecurityCheck()
// Security status logging removed for production

// Initialize analytics with comprehensive tracking
analyticsManager.initialize({
  environment: 'production',
  userId: analyticsManager.getUserId(),
  sessionId: analyticsManager.userSession?.sessionId
})

// Start enhanced cache management
// Cache management logging removed for production
enhancedCacheManager.init().then(() => {
  // Cache monitoring logging removed for production
}).catch(error => {
  // Cache error logging removed for production
})

// Start monitoring system
// Monitoring initialization logging removed for production

// Set up periodic health checks
setInterval(async () => {
  // Check cache performance
  const cacheStatus = await enhancedCacheManager.getCacheStatus()
  if (cacheStatus.metrics && cacheStatus.metrics.totalRequests > 100) {
    const hitRate = (cacheStatus.metrics.hits / cacheStatus.metrics.totalRequests) * 100
    if (hitRate < 70) {
      // Cache performance warning removed for production
    }
  }

  // Security health check
  if (Math.random() < 0.1) { // 10% chance every minute
    const secStatus = securityManager.performSecurityCheck()
    if (secStatus.score < 75) {
      // Security warning removed for production
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
    // App mount logging removed for production
    // Add a marker to indicate React has taken over
    document.body.setAttribute('data-react-loaded', 'true')
  }
}

// Enforce 4-second minimum loading screen display
const startTime = Date.now()
const minLoadingTime = 4000 // 4 seconds

const removeLoadingScreenAfterDelay = () => {
  const elapsed = Date.now() - startTime
  const remainingTime = Math.max(0, minLoadingTime - elapsed)
  
  setTimeout(removeLoadingScreen, remainingTime)
}

// Remove loading screen only after 4 seconds minimum
setTimeout(removeLoadingScreenAfterDelay, 100)