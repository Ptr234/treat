// Production Monitoring and Health Check System for OSC Uganda
// Comprehensive system health, performance, and uptime monitoring

export class MonitoringManager {
  constructor() {
    this.metrics = new Map()
    this.healthChecks = new Map()
    this.alerts = new Map()
    this.performanceBaseline = new Map()
    this.systemStatus = 'unknown'
    this.monitoringInterval = null
    this.initialized = false
    
    this.init()
  }

  init() {
    if (typeof window === 'undefined') return
    
    this.setupDefaultHealthChecks()
    this.setupPerformanceMonitoring()
    this.setupResourceMonitoring()
    this.startMonitoring()
    
    this.initialized = true
    // eslint-disable-next-line no-console
    console.log('📊 Production monitoring system initialized')
  }

  // System Health Checks
  setupDefaultHealthChecks() {
    // Frontend application health
    this.addHealthCheck('app_status', {
      name: 'Application Status',
      check: () => {
        return {
          status: document.readyState === 'complete' ? 'healthy' : 'loading',
          details: {
            readyState: document.readyState,
            timestamp: Date.now()
          }
        }
      },
      interval: 30000, // 30 seconds
      critical: true
    })

    // Network connectivity
    this.addHealthCheck('network_status', {
      name: 'Network Connectivity',
      check: async () => {
        try {
          const response = await fetch('/manifest.json', { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          })
          
          return {
            status: response.ok ? 'healthy' : 'degraded',
            details: {
              status: response.status,
              responseTime: Date.now(),
              online: navigator.onLine
            }
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            details: {
              error: error.message,
              online: navigator.onLine
            }
          }
        }
      },
      interval: 60000, // 1 minute
      critical: true
    })

    // Service worker status
    this.addHealthCheck('service_worker_status', {
      name: 'Service Worker Status',
      check: async () => {
        if (!('serviceWorker' in navigator)) {
          return {
            status: 'unavailable',
            details: { reason: 'Service Worker not supported' }
          }
        }

        try {
          const registration = await navigator.serviceWorker.ready
          return {
            status: registration.active ? 'healthy' : 'degraded',
            details: {
              state: registration.active?.state,
              scope: registration.scope,
              updateViaCache: registration.updateViaCache
            }
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            details: { error: error.message }
          }
        }
      },
      interval: 120000, // 2 minutes
      critical: false
    })

    // Cache health
    this.addHealthCheck('cache_status', {
      name: 'Cache System Status',
      check: async () => {
        if (!('caches' in window)) {
          return {
            status: 'unavailable',
            details: { reason: 'Cache API not supported' }
          }
        }

        try {
          const cacheNames = await caches.keys()
          const totalCaches = cacheNames.length
          
          return {
            status: totalCaches > 0 ? 'healthy' : 'degraded',
            details: {
              totalCaches,
              cacheNames: cacheNames.slice(0, 5), // First 5 cache names
              timestamp: Date.now()
            }
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            details: { error: error.message }
          }
        }
      },
      interval: 300000, // 5 minutes
      critical: false
    })

    // Memory usage
    this.addHealthCheck('memory_status', {
      name: 'Memory Usage',
      check: () => {
        if (!performance.memory) {
          return {
            status: 'unavailable',
            details: { reason: 'Memory API not available' }
          }
        }

        const memory = performance.memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
        const usagePercent = Math.round((usedMB / limitMB) * 100)

        let status = 'healthy'
        if (usagePercent > 90) status = 'critical'
        else if (usagePercent > 75) status = 'warning'
        else if (usagePercent > 50) status = 'degraded'

        return {
          status,
          details: {
            usedMB,
            limitMB,
            usagePercent,
            totalMB: Math.round(memory.totalJSHeapSize / 1048576)
          }
        }
      },
      interval: 60000, // 1 minute
      critical: false
    })

    // Local storage availability
    this.addHealthCheck('storage_status', {
      name: 'Local Storage',
      check: () => {
        try {
          const testKey = '_monitoring_test_'
          localStorage.setItem(testKey, 'test')
          localStorage.removeItem(testKey)
          
          return {
            status: 'healthy',
            details: {
              available: true,
              usage: this.getStorageUsage()
            }
          }
        } catch (error) {
          return {
            status: 'unhealthy',
            details: {
              available: false,
              error: error.message
            }
          }
        }
      },
      interval: 300000, // 5 minutes
      critical: false
    })
  }

  addHealthCheck(id, config) {
    this.healthChecks.set(id, {
      ...config,
      lastCheck: null,
      lastResult: null,
      checkCount: 0,
      failureCount: 0
    })
  }

  // Performance Monitoring
  setupPerformanceMonitoring() {
    // Core Web Vitals monitoring
    this.setupCoreWebVitalsMonitoring()
    
    // Resource timing monitoring
    this.setupResourceTimingMonitoring()
    
    // Navigation timing monitoring
    this.setupNavigationTimingMonitoring()
    
    // Error rate monitoring
    this.setupErrorRateMonitoring()
  }

  setupCoreWebVitalsMonitoring() {
    // First Contentful Paint (FCP)
    this.observePerformance('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('core_web_vitals', 'FCP', entry.startTime, {
            rating: this.rateWebVital('FCP', entry.startTime),
            url: window.location.href
          })
        }
      })
    })

    // Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      this.recordMetric('core_web_vitals', 'LCP', lastEntry.startTime, {
        rating: this.rateWebVital('LCP', lastEntry.startTime),
        element: lastEntry.element?.tagName
      })
    })

    // First Input Delay (FID) - approximated with event timing
    this.observePerformance('first-input', (entries) => {
      entries.forEach(entry => {
        this.recordMetric('core_web_vitals', 'FID', entry.processingStart - entry.startTime, {
          rating: this.rateWebVital('FID', entry.processingStart - entry.startTime),
          eventType: entry.name
        })
      })
    })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    this.observePerformance('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      this.recordMetric('core_web_vitals', 'CLS', clsValue, {
        rating: this.rateWebVital('CLS', clsValue)
      })
    })
  }

  setupResourceTimingMonitoring() {
    this.observePerformance('resource', (entries) => {
      entries.forEach(entry => {
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
          this.recordMetric('api_performance', 'response_time', entry.duration, {
            url: entry.name,
            method: 'unknown',
            status: 'unknown'
          })
        }
      })
    })
  }

  setupNavigationTimingMonitoring() {
    this.observePerformance('navigation', (entries) => {
      entries.forEach(entry => {
        this.recordMetric('navigation', 'page_load_time', entry.duration, {
          type: entry.type,
          redirectCount: entry.redirectCount,
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          tcp: entry.connectEnd - entry.connectStart,
          request: entry.responseStart - entry.requestStart,
          response: entry.responseEnd - entry.responseStart,
          dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
        })
      })
    })
  }

  setupErrorRateMonitoring() {
    let errorCount = 0
    let totalRequests = 0
    let startTime = Date.now()

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      // Ignore development/build-related errors
      if (event.filename?.includes('node_modules') || 
          event.message?.includes('Importing a module from') ||
          event.message?.includes('dynamically imported module')) {
        return
      }
      
      errorCount++
      totalRequests = Math.max(totalRequests, 1) // Ensure we have at least 1 request
      this.recordMetric('errors', 'javascript_error_rate', (errorCount / totalRequests) * 100)
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Ignore development-related promise rejections
      if (event.reason?.message?.includes('dynamically imported module') ||
          event.reason?.message?.includes('Failed to fetch')) {
        return
      }
      
      errorCount++
      totalRequests = Math.max(totalRequests, 1)
      this.recordMetric('errors', 'promise_rejection_rate', (errorCount / totalRequests) * 100)
    })

    // Track successful requests and calculate error rate
    setInterval(() => {
      const runtimeMinutes = (Date.now() - startTime) / 60000
      
      // Only start tracking after 1 minute of runtime to avoid false positives
      if (runtimeMinutes > 1) {
        totalRequests++
        const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0
        
        // Only record if error rate is meaningful (more than 10 total interactions)
        if (totalRequests > 10) {
          this.recordMetric('errors', 'error_rate', errorRate)
        }
      }
    }, 15000) // Every 15 seconds
  }

  observePerformance(type, callback) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries())
        })
        observer.observe({ type, buffered: true })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Could not observe ${type} performance entries:`, e)
      }
    }
  }

  rateWebVital(metric, value) {
    const thresholds = {
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 }
    }
    
    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  // Resource Monitoring
  setupResourceMonitoring() {
    // Monitor network status
    window.addEventListener('online', () => {
      this.recordMetric('network', 'status_change', 1, { status: 'online' })
    })

    window.addEventListener('offline', () => {
      this.recordMetric('network', 'status_change', 0, { status: 'offline' })
      this.triggerAlert('network_offline', 'Network connection lost', 'critical')
    })

    // Monitor battery status (if available)
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBatteryInfo = () => {
          this.recordMetric('device', 'battery_level', battery.level * 100, {
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          })
        }

        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingchange', updateBatteryInfo)
        updateBatteryInfo() // Initial reading
      })
    }

    // Monitor connection quality
    if ('connection' in navigator) {
      const connection = navigator.connection
      const updateConnectionInfo = () => {
        this.recordMetric('network', 'connection_quality', this.getConnectionScore(connection), {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }

      connection.addEventListener('change', updateConnectionInfo)
      updateConnectionInfo() // Initial reading
    }
  }

  getConnectionScore(connection) {
    const typeScores = { '4g': 100, '3g': 75, '2g': 50, 'slow-2g': 25 }
    return typeScores[connection.effectiveType] || 0
  }

  // Metrics Recording
  recordMetric(category, name, value, metadata = {}) {
    const key = `${category}.${name}`
    const timestamp = Date.now()
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        name,
        category,
        values: [],
        metadata: [],
        min: value,
        max: value,
        avg: value,
        count: 0
      })
    }

    const metric = this.metrics.get(key)
    metric.values.push({ value, timestamp })
    metric.metadata.push({ ...metadata, timestamp })
    metric.count++
    
    // Update min/max/avg
    metric.min = Math.min(metric.min, value)
    metric.max = Math.max(metric.max, value)
    metric.avg = metric.values.reduce((sum, v) => sum + v.value, 0) / metric.count

    // Keep only recent values (last 100)
    if (metric.values.length > 100) {
      metric.values.splice(0, metric.values.length - 100)
      metric.metadata.splice(0, metric.metadata.length - 100)
    }

    // Check for alerts
    this.checkMetricAlerts(key, value, metadata)
  }

  // Alert System
  checkMetricAlerts(metricKey, value, _metadata) {
    // More lenient thresholds for development environment
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
    
    const alertRules = {
      'core_web_vitals.LCP': { threshold: 4000, condition: 'greater', severity: 'warning' },
      'core_web_vitals.FCP': { threshold: 3000, condition: 'greater', severity: 'warning' },
      'core_web_vitals.CLS': { threshold: 0.25, condition: 'greater', severity: 'warning' },
      'memory_status': { threshold: 85, condition: 'greater', severity: 'critical' },
      'errors.error_rate': { 
        threshold: isProduction ? 5 : 25, // More lenient for development
        condition: 'greater', 
        severity: isProduction ? 'critical' : 'warning' 
      }
    }

    const rule = alertRules[metricKey]
    if (!rule) return

    const shouldAlert = rule.condition === 'greater' ? value > rule.threshold : value < rule.threshold
    
    if (shouldAlert) {
      this.triggerAlert(metricKey, `${metricKey} exceeded threshold: ${value} > ${rule.threshold}`, rule.severity)
    }
  }

  triggerAlert(id, message, severity = 'warning', metadata = {}) {
    const alert = {
      id,
      message,
      severity,
      timestamp: Date.now(),
      metadata,
      acknowledged: false
    }

    this.alerts.set(id, alert)
    // eslint-disable-next-line no-console
    console.warn(`🚨 MONITORING ALERT [${severity.toUpperCase()}]:`, message)

    // Send to monitoring service (in production)
    this.sendAlertToService(alert)

    // Show user notification for critical alerts
    if (severity === 'critical') {
      this.showCriticalAlert(alert)
    }
  }

  sendAlertToService(alert) {
    // In production, send to monitoring service like DataDog, New Relic, etc.
    // eslint-disable-next-line no-console
    console.log('📡 Sending alert to monitoring service:', alert.id)
  }

  showCriticalAlert(alert) {
    if (typeof document === 'undefined') return
    
    // Skip showing UI alerts in development environment for non-critical issues
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
    if (!isProduction && alert.severity !== 'critical') {
      return
    }

    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      max-width: 400px;
      font-size: 14px;
      border-left: 4px solid #fbbf24;
    `
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">⚠️</span>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">System Alert</div>
          <div style="opacity: 0.9;">${alert.message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">
          ×
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  // Monitoring Loop
  startMonitoring() {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(async () => {
      await this.runHealthChecks()
      this.updateSystemStatus()
      this.cleanupOldData()
    }, 30000) // Every 30 seconds

    // eslint-disable-next-line no-console
    console.log('🔄 Monitoring loop started')
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      // eslint-disable-next-line no-console
      console.log('⏹️ Monitoring loop stopped')
    }
  }

  async runHealthChecks() {
    for (const [id, healthCheck] of this.healthChecks.entries()) {
      try {
        const result = await healthCheck.check()
        
        healthCheck.lastCheck = Date.now()
        healthCheck.lastResult = result
        healthCheck.checkCount++
        
        if (result.status === 'unhealthy' || result.status === 'critical') {
          healthCheck.failureCount++
          
          if (healthCheck.critical) {
            this.triggerAlert(`health_check_${id}`, `Health check failed: ${healthCheck.name}`, 'critical')
          }
        }
        
        this.recordMetric('health_checks', id, this.getHealthScore(result.status), {
          status: result.status,
          details: result.details
        })
        
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Health check ${id} failed:`, error)
        healthCheck.failureCount++
      }
    }
  }

  getHealthScore(status) {
    const scores = { healthy: 100, degraded: 75, warning: 50, unhealthy: 25, critical: 0 }
    return scores[status] || 0
  }

  updateSystemStatus() {
    const healthScores = Array.from(this.healthChecks.values())
      .filter(hc => hc.lastResult)
      .map(hc => this.getHealthScore(hc.lastResult.status))
    
    if (healthScores.length === 0) {
      this.systemStatus = 'unknown'
      return
    }

    const avgScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
    
    if (avgScore >= 90) this.systemStatus = 'healthy'
    else if (avgScore >= 75) this.systemStatus = 'degraded'
    else if (avgScore >= 50) this.systemStatus = 'warning'
    else this.systemStatus = 'critical'
  }

  cleanupOldData() {
    const oneDayAgo = Date.now() - 86400000 // 24 hours
    
    // Clean old alerts
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp < oneDayAgo) {
        this.alerts.delete(id)
      }
    }
  }

  // Utility Methods
  getStorageUsage() {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return { available: false }
    }

    return navigator.storage.estimate().then(estimate => ({
      available: true,
      quota: estimate.quota,
      usage: estimate.usage,
      usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
    })).catch(() => ({ available: false }))
  }

  // Reporting and Dashboard
  getSystemHealth() {
    const healthCheckResults = {}
    for (const [id, hc] of this.healthChecks.entries()) {
      healthCheckResults[id] = {
        name: hc.name,
        status: hc.lastResult?.status || 'unknown',
        lastCheck: hc.lastCheck,
        checkCount: hc.checkCount,
        failureCount: hc.failureCount,
        details: hc.lastResult?.details
      }
    }

    return {
      systemStatus: this.systemStatus,
      timestamp: Date.now(),
      healthChecks: healthCheckResults,
      activeAlerts: Array.from(this.alerts.values()).filter(alert => !alert.acknowledged),
      metrics: this.getMetricsSummary()
    }
  }

  getMetricsSummary() {
    const summary = {}
    for (const [key, metric] of this.metrics.entries()) {
      summary[key] = {
        name: metric.name,
        category: metric.category,
        current: metric.values[metric.values.length - 1]?.value,
        min: metric.min,
        max: metric.max,
        avg: Math.round(metric.avg * 100) / 100,
        count: metric.count
      }
    }
    return summary
  }

  exportMonitoringData() {
    const data = {
      systemHealth: this.getSystemHealth(),
      metrics: Object.fromEntries(this.metrics),
      alerts: Object.fromEntries(this.alerts),
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `osc_monitoring_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const monitoringManager = new MonitoringManager()

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.monitoringManager = monitoringManager
}

export default monitoringManager