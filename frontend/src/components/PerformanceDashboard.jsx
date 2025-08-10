import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    connectionType: 'unknown',
    isOnline: navigator.onLine
  })

  const [vitals, setVitals] = useState([])
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    collectPerformanceMetrics()
    
    // Monitor network status
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set up periodic monitoring
    const interval = setInterval(collectPerformanceMetrics, 30000) // Every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [collectPerformanceMetrics])

  const collectPerformanceMetrics = useCallback(() => {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0]
    const paintEntries = performance.getEntriesByType('paint')
    
    const newMetrics = {
      loadTime: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart) || 0,
      domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart) || 0,
      firstPaint: Math.round(paintEntries.find(entry => entry.name === 'first-paint')?.startTime) || 0,
      firstContentfulPaint: Math.round(paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime) || 0,
      memoryUsage: Math.round((performance.memory?.usedJSHeapSize / 1024 / 1024) * 100) / 100 || 0,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine
    }

    // Web Vitals simulation (in a real app, use web-vitals library)
    if (window.PerformanceObserver) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          newMetrics.largestContentfulPaint = Math.round(lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          newMetrics.cumulativeLayoutShift = Math.round(clsValue * 1000) / 1000
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            newMetrics.firstInputDelay = Math.round(entry.processingStart - entry.startTime)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        // Performance Observer support warning removed for production
      }
    }

    setMetrics(newMetrics)
    analyzeMetrics(newMetrics)
  }, [analyzeMetrics])

  const analyzeMetrics = useCallback((metrics) => {
    const newVitals = []
    const newWarnings = []

    // Core Web Vitals thresholds
    const thresholds = {
      largestContentfulPaint: { good: 2500, poor: 4000 },
      firstInputDelay: { good: 100, poor: 300 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      firstContentfulPaint: { good: 1800, poor: 3000 },
      loadTime: { good: 3000, poor: 5000 }
    }

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = metrics[metric]
      if (value > 0) {
        let status = 'good'
        if (value > threshold.poor) status = 'poor'
        else if (value > threshold.good) status = 'needs-improvement'

        newVitals.push({
          name: metric.replace(/([A-Z])/g, ' $1').toLowerCase(),
          value,
          status,
          threshold
        })

        if (status === 'poor') {
          newWarnings.push(`${metric} is above recommended threshold (${value}ms > ${threshold.poor}ms)`)
        }
      }
    })

    // Memory warnings
    if (metrics.memoryUsage > 100) {
      newWarnings.push(`High memory usage detected: ${metrics.memoryUsage}MB`)
    }

    // Connection warnings  
    if (metrics.connectionType === '2g' || metrics.connectionType === 'slow-2g') {
      newWarnings.push('Slow network connection detected')
    }

    setVitals(newVitals)
    setWarnings(newWarnings)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100' 
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatMetricName = (name) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
          Performance Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            metrics.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {metrics.isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="text-xs text-gray-500">
            {metrics.connectionType.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg"
        >
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Performance Warnings</h3>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<ClockIcon className="h-5 w-5" />}
          title="Load Time"
          value={`${metrics.loadTime}ms`}
          status={metrics.loadTime < 3000 ? 'good' : metrics.loadTime < 5000 ? 'warning' : 'poor'}
        />
        <MetricCard
          icon={<SignalIcon className="h-5 w-5" />}
          title="First Paint"
          value={`${metrics.firstPaint}ms`}
          status={metrics.firstPaint < 1800 ? 'good' : metrics.firstPaint < 3000 ? 'warning' : 'poor'}
        />
        <MetricCard
          icon={<CpuChipIcon className="h-5 w-5" />}
          title="Memory Usage"
          value={`${metrics.memoryUsage}MB`}
          status={metrics.memoryUsage < 50 ? 'good' : metrics.memoryUsage < 100 ? 'warning' : 'poor'}
        />
        <MetricCard
          icon={<CheckCircleIcon className="h-5 w-5" />}
          title="DOM Ready"
          value={`${metrics.domContentLoaded}ms`}
          status={metrics.domContentLoaded < 1500 ? 'good' : metrics.domContentLoaded < 2500 ? 'warning' : 'poor'}
        />
      </div>

      {/* Core Web Vitals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Web Vitals</h3>
        <div className="space-y-3">
          {vitals.map((vital, index) => (
            <motion.div
              key={vital.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {formatMetricName(vital.name)}
                </div>
                <div className="text-sm text-gray-600">
                  Good: &lt;{vital.threshold.good}ms, Poor: &gt;{vital.threshold.poor}ms
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-lg">{vital.value}ms</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vital.status)}`}>
                  {vital.status.replace('-', ' ')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Performance Tips</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Optimize images and use modern formats (WebP, AVIF)</li>
          <li>• Enable browser caching and compression</li>
          <li>• Minimize JavaScript and CSS bundle sizes</li>
          <li>• Use lazy loading for images and components</li>
          <li>• Consider using a CDN for static assets</li>
        </ul>
      </div>
    </motion.div>
  )
}

const MetricCard = ({ icon, title, value, status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'good': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'poor': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getIconColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'  
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-2 ${getStatusStyles(status)}`}
    >
      <div className={`flex items-center mb-2 ${getIconColor(status)}`}>
        {icon}
        <span className="ml-2 text-sm font-medium text-gray-800">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </motion.div>
  )
}

export default PerformanceDashboard