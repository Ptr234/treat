/**
 * Background Cache Management System
 * Handles cache operations without UI interference
 */

class BackgroundCacheManager {
  constructor() {
    this.cacheStatus = {
      supported: false,
      totalCaches: 0,
      totalSize: '0 Bytes',
      caches: [],
      serviceWorker: null,
      buildInfo: null,
      lastUpdate: null
    }
    
    this.init()
  }

  async init() {
    try {
      // Check cache support
      this.cacheStatus.supported = 'caches' in window
      
      // Initialize service worker monitoring
      if ('serviceWorker' in navigator) {
        await this.updateServiceWorkerStatus()
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.updateServiceWorkerStatus()
        })
      }

      // Set up periodic updates
      this.startPeriodicUpdates()

      // Add build info
      this.updateBuildInfo()

      // Initial cache status update
      await this.updateCacheStatus()

      console.log('Background Cache Manager initialized')
    } catch (error) {
      console.error('Background Cache Manager initialization failed:', error)
    }
  }

  async updateCacheStatus() {
    if (!this.cacheStatus.supported) return

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0
      const cacheDetails = []

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        let cacheSize = 0

        // Estimate cache size (approximate)
        for (const request of requests) {
          const response = await cache.match(request)
          if (response) {
            const responseClone = response.clone()
            const arrayBuffer = await responseClone.arrayBuffer()
            cacheSize += arrayBuffer.byteLength
          }
        }

        totalSize += cacheSize
        cacheDetails.push({
          name: cacheName,
          size: this.formatBytes(cacheSize),
          entries: requests.length
        })
      }

      this.cacheStatus.totalCaches = cacheNames.length
      this.cacheStatus.totalSize = this.formatBytes(totalSize)
      this.cacheStatus.caches = cacheNames
      this.cacheStatus.cacheDetails = cacheDetails
      this.cacheStatus.lastUpdate = new Date().toISOString()

      // Trigger cache optimization if needed
      await this.optimizeCaches()

    } catch (error) {
      console.error('Error updating cache status:', error)
      this.cacheStatus.error = error.message
    }
  }

  async updateServiceWorkerStatus() {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      this.cacheStatus.serviceWorker = {
        registered: !!registration,
        active: !!registration?.active,
        waiting: !!registration?.waiting,
        installing: !!registration?.installing,
        scope: registration?.scope || 'unknown'
      }
    } catch (error) {
      console.error('Error updating service worker status:', error)
    }
  }

  updateBuildInfo() {
    this.cacheStatus.buildInfo = {
      timestamp: window.BUILD_TIMESTAMP || Date.now(),
      version: window.BUILD_VERSION || '1.0.0',
      time: new Date(window.BUILD_TIMESTAMP || Date.now()).toLocaleString()
    }
  }

  async optimizeCaches() {
    // Auto-cleanup old caches if too many exist
    if (this.cacheStatus.totalCaches > 10) {
      console.log('Auto-optimizing caches: too many cache instances detected')
      await this.cleanupOldCaches()
    }

    // Clean up if cache size exceeds threshold (50MB)
    const maxSizeBytes = 50 * 1024 * 1024
    if (this.getTotalSizeBytes() > maxSizeBytes) {
      console.log('Auto-optimizing caches: size threshold exceeded')
      await this.cleanupLargeCaches()
    }
  }

  async cleanupOldCaches() {
    try {
      const cacheNames = await caches.keys()
      const sortedCaches = cacheNames.sort()
      
      // Keep only the 8 most recent caches
      const cachesToDelete = sortedCaches.slice(0, -8)
      
      for (const cacheName of cachesToDelete) {
        await caches.delete(cacheName)
        console.log(`Deleted old cache: ${cacheName}`)
      }

      await this.updateCacheStatus()
    } catch (error) {
      console.error('Error cleaning up old caches:', error)
    }
  }

  async cleanupLargeCaches() {
    try {
      // Remove caches that are not essential (keep precache and runtime)
      const cacheNames = await caches.keys()
      const nonEssentialCaches = cacheNames.filter(name => 
        !name.includes('precache') && !name.includes('runtime')
      )

      for (const cacheName of nonEssentialCaches) {
        await caches.delete(cacheName)
        console.log(`Deleted large cache: ${cacheName}`)
      }

      await this.updateCacheStatus()
    } catch (error) {
      console.error('Error cleaning up large caches:', error)
    }
  }

  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys()
      const deletePromises = cacheNames.map(name => caches.delete(name))
      await Promise.all(deletePromises)
      
      console.log('All caches cleared')
      await this.updateCacheStatus()
      return true
    } catch (error) {
      console.error('Error clearing all caches:', error)
      return false
    }
  }

  async hardRefresh() {
    try {
      // Clear all caches
      await this.clearAllCaches()
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }
      
      // Force reload
      window.location.reload(true)
    } catch (error) {
      console.error('Error performing hard refresh:', error)
    }
  }

  startPeriodicUpdates() {
    // Update cache status every 5 minutes
    setInterval(() => {
      this.updateCacheStatus()
    }, 5 * 60 * 1000)

    // Update service worker status every 30 seconds
    setInterval(() => {
      this.updateServiceWorkerStatus()
    }, 30 * 1000)
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  getTotalSizeBytes() {
    const sizeStr = this.cacheStatus.totalSize
    const parts = sizeStr.split(' ')
    const value = parseFloat(parts[0])
    const unit = parts[1]
    
    switch (unit) {
      case 'KB': return value * 1024
      case 'MB': return value * 1024 * 1024
      case 'GB': return value * 1024 * 1024 * 1024
      default: return value
    }
  }

  // Public API for accessing cache status
  getCacheStatus() {
    return { ...this.cacheStatus }
  }

  // Development mode utilities
  getDebugInfo() {
    if (process.env.NODE_ENV !== 'development') return null
    
    return {
      ...this.cacheStatus,
      debugMode: true,
      shortcuts: {
        'Ctrl+Shift+C': 'Toggle cache debug info (console)',
        'Ctrl+Shift+R': 'Hard refresh with cache clear'
      }
    }
  }
}

// Create singleton instance
const backgroundCacheManager = new BackgroundCacheManager()

// Global API for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.cacheManager = backgroundCacheManager
  window.clearAllCaches = () => backgroundCacheManager.clearAllCaches()
  window.hardRefresh = () => backgroundCacheManager.hardRefresh()
  
  // Add keyboard shortcuts for development
  document.addEventListener('keydown', (event) => {
    // Show cache debug info on Ctrl+Shift+C
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault()
      console.group('🗂️ Cache Debug Info')
      console.log('Cache Status:', backgroundCacheManager.getCacheStatus())
      console.log('Debug Info:', backgroundCacheManager.getDebugInfo())
      console.groupEnd()
    }
    
    // Hard refresh on Ctrl+Shift+R
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      event.preventDefault()
      console.log('🔄 Performing hard refresh...')
      backgroundCacheManager.hardRefresh()
    }
  })
}

export default backgroundCacheManager