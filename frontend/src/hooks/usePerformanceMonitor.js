import { useEffect, useState } from 'react'

export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP for ${componentName}:`, entry.startTime)
          }
          if (entry.entryType === 'first-input') {
            console.log(`FID for ${componentName}:`, entry.processingStart - entry.startTime)
          }
          if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              console.log(`CLS for ${componentName}:`, entry.value)
            }
          }
        })
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      return () => observer.disconnect()
    }
  }, [componentName])
}

export const useImageOptimization = () => {
  const optimizeImage = (src, width = 400, quality = 75) => {
    if (!src) return src
    
    // For production, you might want to use a service like Cloudinary or similar
    // For now, we'll just add loading optimization
    return src
  }

  return { optimizeImage }
}

export const useThrottledCallback = (callback, delay) => {
  const [throttledCallback, setThrottledCallback] = useState(null)
  
  useEffect(() => {
    let timeoutId
    
    const throttled = (...args) => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          callback(...args)
          timeoutId = null
        }, delay)
      }
    }
    
    setThrottledCallback(() => throttled)
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [callback, delay])
  
  return throttledCallback
}