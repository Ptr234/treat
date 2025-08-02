// Comprehensive Cache Management System
export class CacheManager {
  constructor() {
    this.CACHE_VERSION = `v${Date.now()}`
    this.APP_CACHE = `osc-uganda-${this.CACHE_VERSION}`
    this.STATIC_CACHE = `osc-static-${this.CACHE_VERSION}`
    this.RUNTIME_CACHE = `osc-runtime-${this.CACHE_VERSION}`
    
    // Initialize on load
    this.init()
  }

  init() {
    console.log(`🚀 CacheManager initialized with version: ${this.CACHE_VERSION}`)
    this.clearOldCaches()
    this.setupPerformanceObserver()
  }

  // Clear all old caches
  async clearOldCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name => 
          name.includes('osc-uganda') && !name.includes(this.CACHE_VERSION)
        )
        
        await Promise.all(
          oldCaches.map(cacheName => {
            console.log(`🗑️ Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          })
        )
        
        if (oldCaches.length > 0) {
          console.log(`✅ Cleared ${oldCaches.length} old caches`)
        }
      } catch (error) {
        console.error('Error clearing old caches:', error)
      }
    }
  }

  // Force clear all application caches
  async clearAllCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Force deleting cache: ${cacheName}`)
            return caches.delete(cacheName)
          })
        )
        console.log('✅ All caches cleared')
        
        // Also clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()
        console.log('✅ Local and session storage cleared')
        
        return true
      } catch (error) {
        console.error('Error clearing all caches:', error)
        return false
      }
    }
    return false
  }

  // Hard refresh - clear everything and reload
  async hardRefresh() {
    console.log('🔄 Performing hard refresh...')
    
    // Clear all caches
    await this.clearAllCaches()
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => registration.unregister())
      )
      console.log('✅ Service workers unregistered')
    }
    
    // Clear browser cache and reload
    if ('location' in window) {
      // Add timestamp to prevent cache
      const url = new URL(window.location)
      url.searchParams.set('_cache_bust', Date.now())
      window.location.replace(url.toString())
    }
  }

  // Check for updates
  async checkForUpdates() {
    try {
      const response = await fetch('/index.html', { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        
        const newTimestamp = doc.querySelector('meta[name="build-timestamp"]')?.content
        const currentTimestamp = document.querySelector('meta[name="build-timestamp"]')?.content
        
        if (newTimestamp && currentTimestamp && newTimestamp !== currentTimestamp) {
          console.log('🔄 New version detected!')
          return {
            hasUpdate: true,
            newVersion: newTimestamp,
            currentVersion: currentTimestamp
          }
        }
      }
      
      return { hasUpdate: false }
    } catch (error) {
      console.error('Error checking for updates:', error)
      return { hasUpdate: false, error }
    }
  }

  // Setup performance observer
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log(`📊 Navigation timing: ${entry.duration.toFixed(2)}ms`)
            
            // If page load is slow, suggest cache clearing
            if (entry.duration > 5000) {
              console.warn('⚠️ Slow page load detected. Consider clearing cache.')
              this.showCacheNotification('Slow loading detected. Clear cache?', 'warning')
            }
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
    }
  }

  // Show cache-related notifications
  showCacheNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `cache-notification cache-${type}`
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#f59e0b' : '#10b981'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: auto;">
            ×
          </button>
        </div>
        ${type === 'warning' ? `
          <button onclick="window.cacheManager.hardRefresh()" 
                  style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-top: 8px;
                  ">
            Clear Cache & Refresh
          </button>
        ` : ''}
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

  // Get cache status
  async getCacheStatus() {
    if (!('caches' in window)) {
      return { supported: false }
    }
    
    try {
      const cacheNames = await caches.keys()
      const totalSize = await this.calculateCacheSize(cacheNames)
      
      return {
        supported: true,
        caches: cacheNames,
        totalCaches: cacheNames.length,
        totalSize,
        currentVersion: this.CACHE_VERSION
      }
    } catch (error) {
      return { supported: true, error: error.message }
    }
  }

  // Calculate total cache size
  async calculateCacheSize(cacheNames) {
    let totalSize = 0
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        
        for (const request of requests) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      } catch (error) {
        console.warn(`Error calculating size for cache ${cacheName}:`, error)
      }
    }
    
    return this.formatBytes(totalSize)
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
  }

  // Monitor cache usage
  startCacheMonitoring() {
    // Check every 30 seconds
    this.monitorInterval = setInterval(async () => {
      const status = await this.getCacheStatus()
      if (status.supported && status.totalCaches > 10) {
        console.warn('⚠️ Too many caches detected, cleaning up...')
        await this.clearOldCaches()
      }
    }, 30000)
    
    console.log('📊 Cache monitoring started')
  }

  // Stop cache monitoring
  stopCacheMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      console.log('📊 Cache monitoring stopped')
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.cacheManager = cacheManager
}

export default cacheManager