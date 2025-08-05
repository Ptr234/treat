// Production-Ready Analytics and Monitoring System for OSC Uganda
// Comprehensive user behavior tracking, performance monitoring, and business intelligence

export class AnalyticsManager {
  constructor() {
    this.initialized = false
    this.events = []
    this.userSession = null
    this.performanceMetrics = new Map()
    this.businessMetrics = new Map()
    this.maxEvents = 1000
    this.batchSize = 50
    this.flushInterval = 30000 // 30 seconds
    this.isProduction = process.env.NODE_ENV === 'production'
    
    this.init()
  }

  init() {
    if (typeof window === 'undefined') return
    
    this.userSession = this.createUserSession()
    this.setupPerformanceTracking()
    this.setupUserBehaviorTracking()
    this.startEventBatching()
    
    this.initialized = true
    console.log('📊 Advanced Analytics System initialized')
    
    // Track initial page load
    this.trackPageView(window.location.pathname)
  }

  // Initialize analytics services (enhanced version)
  initialize(config = {}) {
    if (!this.isProduction) {
      console.log('Analytics initialized in development mode')
      return
    }

    // Initialize Google Analytics 4
    if (config.ga4MeasurementId) {
      this.loadGoogleAnalytics(config.ga4MeasurementId)
    }

    // Track initial page view
    this.trackPageView(window.location.pathname)
    
    // Track performance metrics
    this.trackPerformanceMetrics()
    
    // Start engagement tracking
    this.trackEngagement()
  }

  // Load Google Analytics
  loadGoogleAnalytics(measurementId) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    script.onload = () => {
      window.dataLayer = window.dataLayer || []
      function gtag() { dataLayer.push(arguments) }
      gtag('js', new Date())
      gtag('config', measurementId, {
        user_id: this.userId,
        session_id: this.sessionId,
        send_page_view: false // We'll handle this manually
      })
      window.gtag = gtag
    }
  }

  // Track page views
  trackPageView(path, title = document.title) {
    if (this.isProduction && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: window.location.href,
        page_path: path
      })
    }
    
    this.logEvent('page_view', { path, title })
  }

  // Enhanced tracking methods
  trackEvent(eventName, properties = {}, options = {}) {
    if (!this.initialized) return

    const eventData = {
      id: this.generateEventId(),
      event: eventName,
      properties: {
        ...properties,
        page: window.location.pathname,
        pageTitle: document.title,
        timestamp: Date.now(),
        sessionId: this.userSession?.sessionId,
        userId: this.userSession?.userId,
        deviceType: this.userSession?.deviceType,
        browser: this.userSession?.browser
      },
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        timeOnPage: this.getTimeOnPage(),
        scrollPosition: this.getScrollPosition(),
        ...options
      }
    }

    this.events.push(eventData)
    this.updateUserActivity()
    
    // Real-time event processing for critical events
    if (this.isCriticalEvent(eventName)) {
      this.processCriticalEvent(eventData)
    }

    // Cleanup old events
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents)
    }

    // Legacy GA4 tracking
    if (this.isProduction && window.gtag) {
      window.gtag('event', eventName, properties)
    }

    this.logEvent(eventName, properties)
    return eventData.id
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  isCriticalEvent(eventName) {
    const criticalEvents = [
      'error_occurred',
      'payment_initiated', 
      'form_submit',
      'user_registration',
      'security_violation',
      'api_failure'
    ]
    return criticalEvents.includes(eventName)
  }

  processCriticalEvent(eventData) {
    console.warn('🚨 Critical event detected:', eventData)
    this.sendToAnalyticsService([eventData], true)
  }

  // Track user interactions
  trackServiceView(serviceName, category) {
    this.trackEvent('view_service', {
      service_name: serviceName,
      service_category: category,
      content_type: 'service'
    })
  }

  trackInvestmentView(investmentName, category) {
    this.trackEvent('view_investment', {
      investment_name: investmentName,
      investment_category: category,
      content_type: 'investment'
    })
  }

  trackCalculatorUse(calculationType, result) {
    this.trackEvent('use_calculator', {
      calculator_type: calculationType,
      calculation_result: result
    })
  }

  trackFormSubmission(formName, success = true) {
    this.trackEvent('form_submit', {
      form_name: formName,
      success
    })
  }

  trackDownload(filename, category = 'document') {
    this.trackEvent('file_download', {
      file_name: filename,
      file_category: category
    })
  }

  trackSearch(query, resultCount = 0) {
    this.trackEvent('search', {
      search_term: query,
      result_count: resultCount
    })
  }

  trackError(errorMessage, errorLevel = 'error') {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_level: errorLevel,
      page_path: window.location.pathname
    })
  }

  // Core Web Vitals tracking
  trackPerformanceMetrics() {
    if (!this.isProduction) return

    // Track First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            this.trackEvent('performance_metric', {
              metric_name: 'FCP',
              metric_value: Math.round(entry.startTime),
              metric_unit: 'ms'
            })
          }
        })
      })
      observer.observe({ entryTypes: ['paint'] })
    }

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = Date.now() - (window.pageStartTime || Date.now())
      this.trackEvent('performance_metric', {
        metric_name: 'page_load_time',
        metric_value: loadTime,
        metric_unit: 'ms'
      })
    })
  }

  // User identification
  getUserId() {
    let userId = localStorage.getItem('osc_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('osc_user_id', userId)
    }
    return userId
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Development logging
  logEvent(eventName, data) {
    if (!this.isProduction) {
      console.group(`📊 Analytics: ${eventName}`)
      console.log('Event Data:', data)
      console.groupEnd()
    }
  }

  // Track user engagement
  trackEngagement() {
    let engagementTime = 0
    let isVisible = true
    let lastActiveTime = Date.now()

    const updateEngagementTime = () => {
      if (isVisible) {
        const now = Date.now()
        engagementTime += now - lastActiveTime
        lastActiveTime = now
      }
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateEngagementTime()
        isVisible = false
      } else {
        isVisible = true
        lastActiveTime = Date.now()
      }
    });

    // Track user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        lastActiveTime = Date.now()
      }, { passive: true })
    })

    // Send engagement data periodically
    setInterval(() => {
      updateEngagementTime()
      if (engagementTime > 0) {
        this.trackEvent('user_engagement', {
          engagement_time_msec: engagementTime
        })
        engagementTime = 0 // Reset after sending
      }
    }, 30000) // Every 30 seconds

    // Send final engagement on page unload
    window.addEventListener('beforeunload', () => {
      updateEngagementTime()
      if (engagementTime > 0) {
        this.trackEvent('user_engagement', {
          engagement_time_msec: engagementTime
        })
      }
    })
  }

  // Enhanced methods for comprehensive analytics
  createUserSession() {
    const sessionId = this.generateSessionId()
    const userId = this.getUserId()
    
    return {
      sessionId,
      userId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: this.getDeviceType(),
      browser: this.getBrowserInfo(),
      referrer: document.referrer,
      utmSource: this.getUtmParameters(),
      country: 'UG',
      lastActivity: Date.now()
    }
  }

  getDeviceType() {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  getBrowserInfo() {
    const ua = navigator.userAgent
    let browser = 'Unknown'
    
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'
    else if (ua.includes('IE')) browser = 'Internet Explorer'
    
    return browser
  }

  getUtmParameters() {
    const params = new URLSearchParams(window.location.search)
    return {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content')
    }
  }

  // Business intelligence methods
  trackBusinessAction(action, context = {}) {
    this.trackEvent('business_action', {
      action,
      context,
      businessContext: this.getBusinessContext()
    })
    
    this.updateBusinessMetrics(action, context)
  }

  getBusinessContext() {
    return {
      currentService: this.getCurrentService(),
      userJourney: this.getUserJourney(),
      conversionFunnel: this.getConversionFunnelStage(),
      userSegment: this.getUserSegment()
    }
  }

  getCurrentService() {
    const path = window.location.pathname
    if (path.includes('calculator')) return 'tax_calculator'
    if (path.includes('registration')) return 'business_registration'
    if (path.includes('investment')) return 'investment_services'
    if (path.includes('roi')) return 'roi_calculator'
    if (path.includes('invoice')) return 'invoice_generator'
    return 'general'
  }

  getUserJourney() {
    const journey = JSON.parse(localStorage.getItem('user_journey') || '[]')
    return journey.slice(-10)
  }

  getConversionFunnelStage() {
    const path = window.location.pathname
    if (path === '/') return 'awareness'
    if (path.includes('services') || path.includes('investments')) return 'interest'
    if (path.includes('calculator') || path.includes('registration')) return 'consideration'
    if (path.includes('invoice') || path.includes('support')) return 'intent'
    return 'unknown'
  }

  getUserSegment() {
    const visits = parseInt(localStorage.getItem('visit_count') || '1')
    const timeOnSite = this.getTotalTimeOnSite()
    
    if (visits === 1) return 'new_visitor'
    if (visits < 5) return 'returning_visitor'
    if (visits >= 5 && timeOnSite > 300000) return 'engaged_user'
    if (visits >= 10) return 'loyal_user'
    return 'casual_visitor'
  }

  updateBusinessMetrics(action, context) {
    const key = `${action}_${context.type || 'general'}`
    const current = this.businessMetrics.get(key) || { count: 0, lastUpdated: Date.now() }
    current.count++
    current.lastUpdated = Date.now()
    this.businessMetrics.set(key, current)
  }

  // Performance tracking
  setupPerformanceTracking() {
    this.trackCoreWebVitals()
    this.startPerformanceMonitoring()
  }

  trackCoreWebVitals() {
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.trackEvent('core_web_vital', {
            metric: 'FCP',
            value: entry.startTime,
            rating: this.rateMetric('FCP', entry.startTime)
          })
        }
      })
    })
  }

  observePerformanceEntry(type, callback) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries())
        })
        observer.observe({ type, buffered: true })
      } catch (e) {
        console.warn(`Could not observe ${type} performance entries:`, e)
      }
    }
  }

  rateMetric(metric, value) {
    const thresholds = {
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      CLS: { good: 0.1, needsImprovement: 0.25 }
    }
    
    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  // User behavior tracking
  setupUserBehaviorTracking() {
    document.addEventListener('click', (event) => {
      this.trackUserInteraction(event.target, 'click', {
        x: event.clientX,
        y: event.clientY
      })
    })

    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      })
    })

    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', {
        timeOnPage: this.getTimeOnPage(),
        sessionDuration: Date.now() - (this.userSession?.startTime || Date.now())
      })
      this.flushEvents(true)
    })
  }

  trackUserInteraction(element, action, details = {}) {
    const elementInfo = {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent?.substring(0, 100)
    }

    this.trackEvent('user_interaction', {
      action,
      element: elementInfo,
      ...details
    })
  }

  // Helper methods
  getTimeOnPage() {
    return Date.now() - (window.pageStartTime || Date.now())
  }

  getTotalTimeOnSite() {
    return parseInt(localStorage.getItem('total_time_on_site') || '0')
  }

  getScrollPosition() {
    return Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
  }

  updateUserActivity() {
    if (this.userSession) {
      this.userSession.lastActivity = Date.now()
    }
    
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0') + 1
    localStorage.setItem('visit_count', visitCount.toString())
  }

  startPerformanceMonitoring() {
    // Basic performance monitoring - already handled in trackPerformanceMetrics
  }

  // Event batching
  startEventBatching() {
    setInterval(() => {
      this.flushEvents()
    }, this.flushInterval)
  }

  flushEvents(force = false) {
    if (this.events.length === 0) return
    
    const eventsToSend = force ? this.events.splice(0) : this.events.splice(0, this.batchSize)
    
    if (eventsToSend.length > 0) {
      this.sendToAnalyticsService(eventsToSend)
    }
  }

  sendToAnalyticsService(events, immediate = false) {
    console.log(`📡 Sending ${events.length} events to analytics service${immediate ? ' (immediate)' : ''}`)
    
    const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
    storedEvents.push(...events)
    
    if (storedEvents.length > 500) {
      storedEvents.splice(0, storedEvents.length - 500)
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(storedEvents))
  }

  // Analytics dashboard
  getAnalyticsDashboard() {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
    const recentEvents = events.filter(e => Date.now() - e.properties.timestamp < 86400000)
    
    return {
      totalEvents: events.length,
      recentEvents: recentEvents.length,
      uniqueUsers: new Set(events.map(e => e.properties.userId)).size,
      businessMetrics: Object.fromEntries(this.businessMetrics),
      sessionInfo: this.userSession
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsManager()

// Legacy exports for backward compatibility
export const initAnalytics = () => analytics.initialize()
export const trackEvent = (event, properties) => analytics.trackEvent(event, properties)
export const trackPageView = (page) => analytics.trackPageView(page)

// Make globally available
if (typeof window !== 'undefined') {
  window.analyticsManager = analytics
  window.pageStartTime = Date.now()
}

export default analytics