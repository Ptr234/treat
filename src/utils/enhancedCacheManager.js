/**
 * Enhanced Cache Management System
 * High-performance caching with consistency guarantees
 */

export class EnhancedCacheManager {
  constructor() {
    this.CACHE_VERSION = `v${Date.now()}`
    this.APP_CACHE = `osc-uganda-app-${this.CACHE_VERSION}`
    this.STATIC_CACHE = `osc-uganda-static-${this.CACHE_VERSION}`
    this.RUNTIME_CACHE = `osc-uganda-runtime-${this.CACHE_VERSION}`
    this.API_CACHE = `osc-uganda-api-${this.CACHE_VERSION}`
    this.IMAGE_CACHE = `osc-uganda-images-${this.CACHE_VERSION}`
    
    // Cache strategies
    this.strategies = {
      CACHE_FIRST: 'cache-first',
      NETWORK_FIRST: 'network-first',
      STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
      NETWORK_ONLY: 'network-only',
      CACHE_ONLY: 'cache-only'
    }
    
    // Cache configurations
    this.cacheConfigs = {
      static: {
        name: this.STATIC_CACHE,
        strategy: this.strategies.CACHE_FIRST,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 100
      },
      runtime: {
        name: this.RUNTIME_CACHE,
        strategy: this.strategies.STALE_WHILE_REVALIDATE,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 50
      },
      api: {
        name: this.API_CACHE,
        strategy: this.strategies.NETWORK_FIRST,
        maxAge: 10 * 60 * 1000, // 10 minutes
        maxEntries: 30
      },
      images: {
        name: this.IMAGE_CACHE,
        strategy: this.strategies.CACHE_FIRST,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 200
      }
    }
    
    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      avgResponseTime: 0,
      cacheSize: 0
    }
    
    // Initialize
    this.init()
  }

  async init() {
    try {
      console.log(`🚀 Enhanced Cache Manager initialized - Version: ${this.CACHE_VERSION}`)
      
      // Clear old caches
      await this.clearOldCaches()
      
      // Initialize cache storage
      await this.initializeCaches()
      
      // Set up performance monitoring
      this.setupPerformanceMonitoring()
      
      // Preload critical resources
      await this.preloadCriticalResources()
      
      // Start background cache warming
      this.startBackgroundCacheWarming()
      
      // Set up cache optimization interval
      this.startCacheOptimization()
      
      console.log('✅ Enhanced Cache Manager ready')
      return this
    } catch (error) {
      console.error('❌ Enhanced Cache Manager initialization failed:', error)
      throw error
    }
  }

  async clearOldCaches() {
    if (!('caches' in window)) return
    
    try {
      const cacheNames = await caches.keys()
      const oldCaches = cacheNames.filter(name => 
        name.includes('osc-uganda') && !name.includes(this.CACHE_VERSION)
      )
      
      const deletePromises = oldCaches.map(cacheName => {
        console.log(`🗑️ Deleting old cache: ${cacheName}`)
        return caches.delete(cacheName)
      })
      
      await Promise.all(deletePromises)
      
      if (oldCaches.length > 0) {
        console.log(`✅ Cleared ${oldCaches.length} old caches`)
      }
    } catch (error) {
      console.error('Error clearing old caches:', error)
    }
  }

  async initializeCaches() {
    if (!('caches' in window)) return
    
    try {
      // Initialize all cache stores
      await Promise.all([
        caches.open(this.APP_CACHE),
        caches.open(this.STATIC_CACHE),
        caches.open(this.RUNTIME_CACHE),
        caches.open(this.API_CACHE),
        caches.open(this.IMAGE_CACHE)
      ])
      
      console.log('✅ All cache stores initialized')
    } catch (error) {
      console.error('Error initializing caches:', error)
    }
  }

  async preloadCriticalResources() {
    const criticalResources = [
      // Critical CSS and JS
      '/assets/index.css',
      '/assets/index.js',
      
      // Critical images
      '/images/oneStopCenter-logo.jpeg',
      '/images/uganda-kampala-city-view.webp',
      
      // Fonts
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      
      // Critical data
      '/manifest.json'
    ]
    
    try {
      const cache = await caches.open(this.STATIC_CACHE)
      const preloadPromises = criticalResources.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response.clone())
            console.log(`✅ Preloaded: ${url}`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to preload: ${url}`, error)
        }
      })
      
      await Promise.allSettled(preloadPromises)
      console.log('✅ Critical resources preloaded')
    } catch (error) {
      console.error('Error preloading resources:', error)
    }
  }

  setupPerformanceMonitoring() {
    // Monitor cache performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            // Cache hit
            this.metrics.hits++
          } else {
            // Cache miss or network request
            this.metrics.misses++
          }
          
          this.metrics.totalRequests++
          this.updateMetrics()
        }
      })
      
      observer.observe({ entryTypes: ['resource'] })
    }
  }

  updateMetrics() {
    if (this.metrics.totalRequests > 0) {
      const hitRate = (this.metrics.hits / this.metrics.totalRequests) * 100
      console.log(`📊 Cache Hit Rate: ${hitRate.toFixed(2)}%`)
    }
  }

  async startBackgroundCacheWarming() {
    // Warm cache with investment and service data in background
    setTimeout(async () => {
      try {
        const warmupUrls = [
          '/investments',
          '/services',
          '/tools',
          '/support'
        ]
        
        const cache = await caches.open(this.RUNTIME_CACHE)
        
        for (const url of warmupUrls) {
          try {
            const response = await fetch(url, { 
              method: 'GET',
              mode: 'same-origin',
              credentials: 'same-origin'
            })
            
            if (response.ok) {
              await cache.put(url, response.clone())
              console.log(`🔥 Cache warmed: ${url}`)
            }
          } catch (error) {
            console.warn(`⚠️ Failed to warm cache for: ${url}`)
          }
        }
      } catch (error) {
        console.error('Cache warming error:', error)
      }
    }, 2000) // Start after 2 seconds
  }

  startCacheOptimization() {
    // Run cache optimization every 10 minutes
    setInterval(async () => {
      try {
        console.log('🔧 Running cache optimization...')
        
        // Clean up expired entries
        await Promise.all([
          this.cleanupCache(this.cacheConfigs.static),
          this.cleanupCache(this.cacheConfigs.runtime),
          this.cleanupCache(this.cacheConfigs.api),
          this.cleanupCache(this.cacheConfigs.images)
        ])
        
        // Update performance metrics
        this.updateMetrics()
        
        console.log('✅ Cache optimization complete')
      } catch (error) {
        console.error('❌ Cache optimization failed:', error)
      }
    }, 10 * 60 * 1000) // Every 10 minutes
  }

  async cacheRequest(request, response, cacheType = 'runtime') {
    if (!('caches' in window) || !response || !response.ok) return
    
    try {
      const config = this.cacheConfigs[cacheType]
      const cache = await caches.open(config.name)
      
      // Clone response before caching
      const responseClone = response.clone()
      
      // Add metadata headers
      const headers = new Headers(responseClone.headers)
      headers.set('x-cache-timestamp', Date.now().toString())
      headers.set('x-cache-type', cacheType)
      headers.set('x-cache-version', this.CACHE_VERSION)
      
      const responseWithMetadata = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers
      })
      
      await cache.put(request, responseWithMetadata)
      
      // Cleanup old entries if needed
      await this.cleanupCache(config)
      
    } catch (error) {
      console.error('Error caching request:', error)
    }
  }

  async getCachedResponse(request, cacheType = 'runtime') {
    if (!('caches' in window)) return null
    
    try {
      const config = this.cacheConfigs[cacheType]
      const cache = await caches.open(config.name)
      const cachedResponse = await cache.match(request)
      
      if (!cachedResponse) return null
      
      // Check if cached response is still valid
      const cacheTimestamp = cachedResponse.headers.get('x-cache-timestamp')
      if (cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp)
        if (age > config.maxAge) {
          // Cache expired, remove it
          await cache.delete(request)
          return null
        }
      }
      
      this.metrics.hits++
      return cachedResponse
      
    } catch (error) {
      console.error('Error getting cached response:', error)
      return null
    }
  }

  async cleanupCache(config) {
    try {
      const cache = await caches.open(config.name)
      const requests = await cache.keys()
      
      if (requests.length > config.maxEntries) {
        // Remove oldest entries
        const entriesToRemove = requests.length - config.maxEntries
        const oldestRequests = requests.slice(0, entriesToRemove)
        
        await Promise.all(
          oldestRequests.map(request => cache.delete(request))
        )
        
        console.log(`🧹 Cleaned ${entriesToRemove} old entries from ${config.name}`)
      }
    } catch (error) {
      console.error('Error cleaning cache:', error)
    }
  }

  async handleRequest(request, strategy = 'stale-while-revalidate') {
    const startTime = performance.now()
    
    try {
      switch (strategy) {
        case this.strategies.CACHE_FIRST:
          return await this.cacheFirstStrategy(request)
          
        case this.strategies.NETWORK_FIRST:
          return await this.networkFirstStrategy(request)
          
        case this.strategies.STALE_WHILE_REVALIDATE:
          return await this.staleWhileRevalidateStrategy(request)
          
        case this.strategies.NETWORK_ONLY:
          return await fetch(request)
          
        case this.strategies.CACHE_ONLY:
          return await this.getCachedResponse(request)
          
        default:
          return await this.staleWhileRevalidateStrategy(request)
      }
    } finally {
      const endTime = performance.now()
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime + (endTime - startTime)) / 2
    }
  }

  async cacheFirstStrategy(request) {
    const cachedResponse = await this.getCachedResponse(request)
    if (cachedResponse) return cachedResponse
    
    const networkResponse = await fetch(request)
    await this.cacheRequest(request, networkResponse.clone())
    return networkResponse
  }

  async networkFirstStrategy(request) {
    try {
      const networkResponse = await fetch(request)
      await this.cacheRequest(request, networkResponse.clone())
      return networkResponse
    } catch (error) {
      const cachedResponse = await this.getCachedResponse(request)
      if (cachedResponse) return cachedResponse
      throw error
    }
  }

  async staleWhileRevalidateStrategy(request) {
    const cachedResponse = await this.getCachedResponse(request)
    
    const networkPromise = fetch(request).then(async (networkResponse) => {
      await this.cacheRequest(request, networkResponse.clone())
      return networkResponse
    })
    
    if (cachedResponse) {
      // Return cached response immediately, update in background
      networkPromise.catch(() => {}) // Ignore network errors
      return cachedResponse
    }
    
    // No cached response, wait for network
    return networkPromise
  }

  async getCacheStatus() {
    if (!('caches' in window)) return { supported: false }
    
    try {
      const cacheNames = await caches.keys()
      const osc_caches = cacheNames.filter(name => name.includes('osc-uganda'))
      
      const totalSize = 0
      const cacheDetails = []
      
      for (const cacheName of osc_caches) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        
        cacheDetails.push({
          name: cacheName,
          entries: requests.length,
          type: this.getCacheType(cacheName)
        })
      }
      
      return {
        supported: true,
        version: this.CACHE_VERSION,
        totalCaches: osc_caches.length,
        caches: cacheDetails,
        metrics: this.metrics,
        lastUpdate: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting cache status:', error)
      return { supported: false, error: error.message }
    }
  }

  getCacheType(cacheName) {
    if (cacheName.includes('static')) return 'Static Assets'
    if (cacheName.includes('runtime')) return 'Runtime Data'
    if (cacheName.includes('api')) return 'API Responses'
    if (cacheName.includes('images')) return 'Images'
    return 'Application'
  }

  async invalidateCache(pattern) {
    if (!('caches' in window)) return
    
    try {
      const cacheNames = await caches.keys()
      
      for (const cacheName of cacheNames) {
        if (cacheName.includes('osc-uganda')) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()
          
          for (const request of requests) {
            if (request.url.includes(pattern)) {
              await cache.delete(request)
              console.log(`🗑️ Invalidated: ${request.url}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error invalidating cache:', error)
    }
  }

  async clearAllCaches() {
    if (!('caches' in window)) return
    
    try {
      const cacheNames = await caches.keys()
      const oscCaches = cacheNames.filter(name => name.includes('osc-uganda'))
      
      await Promise.all(
        oscCaches.map(cacheName => caches.delete(cacheName))
      )
      
      // Reset metrics
      this.metrics = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        avgResponseTime: 0,
        cacheSize: 0
      }
      
      console.log(`✅ Cleared all ${oscCaches.length} OSC caches`)
      
      // Show user notification
      this.showCacheNotification('All caches cleared. Page will refresh for optimal performance.', 'success')
      
      // Refresh page after clearing
      setTimeout(() => window.location.reload(), 1000)
      
    } catch (error) {
      console.error('Error clearing all caches:', error)
      this.showCacheNotification('Error clearing caches. Please try again.', 'error')
    }
  }

  showCacheNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full opacity-0`
    
    const colors = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      info: 'bg-blue-600 text-white'
    }
    
    notification.className += ` ${colors[type] || colors.info}`
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0')
    }, 100)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full', 'opacity-0')
      setTimeout(() => notification.remove(), 300)
    }, 5000)
  }
}

// Create singleton instance
export const enhancedCacheManager = new EnhancedCacheManager()

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.enhancedCacheManager = enhancedCacheManager
}

export default enhancedCacheManager