// Performance optimization utilities for zero-lag experience

export const optimizeForPerformance = {
  // Debounce function for smooth interactions
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function for high-frequency events
  throttle: (func, limit) => {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Optimized intersection observer for animations
  createOptimizedObserver: (callback, options = {}) => {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })
  },

  // Preload critical images
  preloadImage: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  },

  // Optimize animation performance
  reduceMotionPreference: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // GPU-accelerated animations
  enableGPUAcceleration: (element) => {
    if (element) {
      element.style.willChange = 'transform, opacity'
      element.style.transform = 'translateZ(0)'
    }
  },

  // Clean up GPU acceleration
  cleanupGPUAcceleration: (element) => {
    if (element) {
      element.style.willChange = 'auto'
      element.style.transform = ''
    }
  },

  // Virtual scrolling helper
  calculateVisibleItems: (scrollTop, itemHeight, containerHeight, totalItems) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    )
    return { startIndex, endIndex }
  },

  // Memory cleanup
  cleanupEventListeners: (listeners) => {
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
  }
}

// Animation presets for consistent performance
export const performantAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }
}

// React performance helpers
export const performanceHelpers = {
  // Memoize expensive calculations
  memoize: (fn) => {
    const cache = new Map()
    return (...args) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }
  },

  // Check if component should update
  shouldComponentUpdate: (prevProps, nextProps) => {
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps)
  }
}

export default optimizeForPerformance