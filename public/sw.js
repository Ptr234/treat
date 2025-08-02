// Advanced Cache Management Service Worker for OSC Uganda
// Security hardened and performance optimized
const CACHE_VERSION = `v${Date.now()}`
const APP_CACHE = `osc-uganda-app-${CACHE_VERSION}`
const STATIC_CACHE = `osc-uganda-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `osc-uganda-runtime-${CACHE_VERSION}`
const IMAGE_CACHE = `osc-uganda-images-${CACHE_VERSION}`

// Security headers for requests
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// URLs to cache immediately
const STATIC_URLS = [
  '/offline.html',
  '/manifest.json',
  '/images/oneStopCenter-logo.jpeg',
  '/images/uganda-flag.png',
  '/images/uganda-coat-of-arms.png'
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Never cache - always fetch fresh
  NETWORK_ONLY: [
    '/api/',
    'chrome-extension://',
    'moz-extension://',
    '.json'
  ],
  
  // Cache first, fallback to network
  CACHE_FIRST: [
    '/images/',
    '/assets/',
    '.woff2',
    '.woff',
    '.ttf',
    '.eot',
    '.jpg',
    '.jpeg',
    '.png',
    '.svg',
    '.ico'
  ],
  
  // Network first, fallback to cache (but don't cache HTML)
  NETWORK_FIRST: [],
  
  // Never cache these
  NO_CACHE: [
    '/index.html',
    '/',
    '.html'
  ]
}

// Utility functions
const log = (message, data = '') => {
  console.log(`[SW ${CACHE_VERSION}] ${message}`, data)
}

// Security validation for URLs
const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url)
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }
    // Block potential malicious URLs
    const suspiciousPatterns = [
      'javascript:', 'data:', 'blob:', 'file:',
      '<script', 'eval(', 'onclick=', 'onerror='
    ]
    return !suspiciousPatterns.some(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    )
  } catch {
    return false
  }
}

const matchesPattern = (url, patterns) => {
  return patterns.some(pattern => url.includes(pattern))
}

const getCacheStrategy = (url) => {
  if (!isValidUrl(url)) return 'NO_CACHE'
  
  if (matchesPattern(url, CACHE_STRATEGIES.NETWORK_ONLY)) return 'NETWORK_ONLY'
  if (matchesPattern(url, CACHE_STRATEGIES.CACHE_FIRST)) return 'CACHE_FIRST'
  if (matchesPattern(url, CACHE_STRATEGIES.NETWORK_FIRST)) return 'NETWORK_FIRST'
  if (matchesPattern(url, CACHE_STRATEGIES.NO_CACHE)) return 'NO_CACHE'
  return 'RUNTIME' // Default strategy
}

// Install event - aggressive cache cleanup and setup
self.addEventListener('install', (event) => {
  log('Installing service worker')
  
  event.waitUntil(
    (async () => {
      try {
        // Clear all old caches first
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name => 
          name.includes('osc-uganda') && !name.includes(CACHE_VERSION)
        )
        
        await Promise.all(oldCaches.map(cacheName => {
          log(`Deleting old cache: ${cacheName}`)
          return caches.delete(cacheName)
        }))
        
        // Cache static resources
        const staticCache = await caches.open(STATIC_CACHE)
        await staticCache.addAll(STATIC_URLS)
        
        log('Static resources cached successfully')
        
        // Skip waiting to activate immediately
        self.skipWaiting()
      } catch (error) {
        log('Install failed:', error)
      }
    })()
  )
})

// Activate event - claim clients and cleanup
self.addEventListener('activate', (event) => {
  log('Activating service worker')
  
  event.waitUntil(
    (async () => {
      try {
        // Clear old caches again (double check)
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name => 
          name.includes('osc-uganda') && !name.includes(CACHE_VERSION)
        )
        
        await Promise.all(oldCaches.map(cacheName => {
          log(`Cleaning up old cache: ${cacheName}`)
          return caches.delete(cacheName)
        }))
        
        // Claim all clients immediately
        await self.clients.claim()
        
        // Notify all clients of the update
        const clients = await self.clients.matchAll()
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION,
            timestamp: Date.now()
          })
        })
        
        log('Service worker activated and clients claimed')
      } catch (error) {
        log('Activation failed:', error)
      }
    })()
  )
})

// Fetch event - advanced request handling
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url
  const strategy = getCacheStrategy(url)
  
  // Skip non-HTTP requests
  if (!url.startsWith('http')) {
    return
  }
  
  log(`Fetch: ${url} [${strategy}]`)
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'NETWORK_ONLY':
            return await fetch(request)
            
          case 'NO_CACHE':
            // Always fetch fresh, never cache HTML
            return await fetch(request, {
              cache: 'no-cache',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            })
            
          case 'CACHE_FIRST':
            // Check cache first, fallback to network
            const cachedResponse = await caches.match(request)
            if (cachedResponse) {
              log(`Cache hit: ${url}`)
              return cachedResponse
            }
            
            // Fetch and cache
            const networkResponse = await fetch(request)
            if (networkResponse.ok) {
              const cache = await caches.open(
                url.includes('/images/') ? IMAGE_CACHE : STATIC_CACHE
              )
              cache.put(request, networkResponse.clone())
              log(`Cached: ${url}`)
            }
            return networkResponse
            
          case 'NETWORK_FIRST':
            // Try network first, fallback to cache
            try {
              const networkResponse = await fetch(request)
              if (networkResponse.ok) {
                const cache = await caches.open(RUNTIME_CACHE)
                cache.put(request, networkResponse.clone())
              }
              return networkResponse
            } catch (error) {
              const cachedResponse = await caches.match(request)
              if (cachedResponse) {
                log(`Network failed, using cache: ${url}`)
                return cachedResponse
              }
              throw error
            }
            
          default: // RUNTIME
            // For everything else, try network first with timeout
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 3000)
              
              const networkResponse = await fetch(request, {
                signal: controller.signal
              })
              
              clearTimeout(timeoutId)
              
              if (networkResponse.ok) {
                const cache = await caches.open(RUNTIME_CACHE)
                cache.put(request, networkResponse.clone())
              }
              
              return networkResponse
            } catch (error) {
              // Fallback to cache
              const cachedResponse = await caches.match(request)
              if (cachedResponse) {
                log(`Network timeout, using cache: ${url}`)
                return cachedResponse
              }
              
              // Final fallback for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/offline.html')
              }
              
              throw error
            }
        }
      } catch (error) {
        log(`Fetch failed for ${url}:`, error)
        
        // Final fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
        
        // Return a basic error response
        return new Response('Network error', {
          status: 408,
          statusText: 'Request Timeout'
        })
      }
    })()
  )
})

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
  const { data } = event
  log('Received message:', data)
  
  if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: true
        })
        
        log('All caches cleared via message')
      })()
    )
  }
  
  if (data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()
        
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          caches: cacheNames,
          version: CACHE_VERSION
        })
      })()
    )
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      (async () => {
        // Handle offline form submissions, etc.
        log('Processing background sync tasks')
      })()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/images/oneStopCenter-logo.jpeg',
      badge: '/images/uganda-flag.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: Date.now().toString()
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/images/uganda-coat-of-arms.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/images/uganda-flag.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'OSC Uganda', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  log('Notification click received:', event.action)
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      (async () => {
        log('Periodic cache cleanup')
        
        // Clean up runtime cache if it gets too large
        const cache = await caches.open(RUNTIME_CACHE)
        const requests = await cache.keys()
        
        if (requests.length > 100) {
          // Remove oldest 50% of entries
          const toRemove = requests.slice(0, Math.floor(requests.length / 2))
          await Promise.all(toRemove.map(request => cache.delete(request)))
          log(`Cleaned up ${toRemove.length} runtime cache entries`)
        }
      })()
    )
  }
})

log('Service worker script loaded')