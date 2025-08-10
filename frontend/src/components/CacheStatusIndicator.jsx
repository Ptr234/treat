import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CacheStatusIndicator = ({ showDetails = false }) => {
  const [cacheStatus, setCacheStatus] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const updateCacheStatus = async () => {
      try {
        const status = await window.cacheManager?.getCacheStatus() || { supported: false }
        
        // Add service worker info
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          status.serviceWorker = {
            registered: !!registration,
            active: !!registration?.active,
            waiting: !!registration?.waiting,
            installing: !!registration?.installing
          }
        }
        
        // Add build info
        status.buildInfo = {
          timestamp: window.BUILD_TIMESTAMP,
          version: window.BUILD_VERSION,
          time: new Date(window.BUILD_TIMESTAMP).toLocaleString()
        }
        
        setCacheStatus(status)
      } catch (error) {
        // Cache status error handling removed for production
        setCacheStatus({ error: error.message })
      }
    }

    updateCacheStatus()
    
    // Update every 5 seconds
    const interval = setInterval(updateCacheStatus, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Show/hide based on keyboard shortcut or dev mode
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Show on Ctrl+Shift+C
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault()
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    
    // Auto-show in development
    if (process.env.NODE_ENV === 'development' || showDetails) {
      setIsVisible(true)
    }

    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isVisible, showDetails])

  if (!isVisible || !cacheStatus) return null

  const getCacheStatusColor = () => {
    if (cacheStatus.error) return 'bg-red-500'
    if (!cacheStatus.supported) return 'bg-gray-500'
    if (cacheStatus.totalCaches > 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getServiceWorkerStatus = () => {
    const sw = cacheStatus.serviceWorker
    if (!sw) return '❌ Not Supported'
    if (sw.installing) return '🔄 Installing'
    if (sw.waiting) return '⏳ Waiting'
    if (sw.active) return '✅ Active'
    if (sw.registered) return '📝 Registered'
    return '❌ Not Registered'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-white/20">
            <div className={`w-3 h-3 rounded-full ${getCacheStatusColor()}`}></div>
            <span className="text-sm font-semibold">Cache Status</span>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-white/70 hover:text-white text-sm px-2 py-1 rounded"
              >
                {expanded ? '−' : '+'}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/70 hover:text-white text-sm px-2 py-1 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/70">Cache Support:</span>
              <span>{cacheStatus.supported ? '✅ Yes' : '❌ No'}</span>
            </div>
            
            {cacheStatus.supported && (
              <>
                <div className="flex justify-between">
                  <span className="text-white/70">Total Caches:</span>
                  <span>{cacheStatus.totalCaches || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/70">Total Size:</span>
                  <span>{cacheStatus.totalSize || '0 Bytes'}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="text-white/70">Service Worker:</span>
              <span>{getServiceWorkerStatus()}</span>
            </div>

            {cacheStatus.buildInfo && (
              <div className="flex justify-between">
                <span className="text-white/70">Build:</span>
                <span className="text-xs">{cacheStatus.buildInfo.version}</span>
              </div>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/20 overflow-hidden"
              >
                <div className="p-3 space-y-2 text-xs max-h-64 overflow-y-auto">
                  {/* Cache Names */}
                  {cacheStatus.caches && cacheStatus.caches.length > 0 && (
                    <div>
                      <div className="text-white/70 mb-1">Cache Names:</div>
                      {cacheStatus.caches.map((cacheName, index) => (
                        <div key={index} className="text-white/60 text-xs pl-2">
                          • {cacheName}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Build Info */}
                  {cacheStatus.buildInfo && (
                    <div>
                      <div className="text-white/70 mb-1">Build Info:</div>
                      <div className="text-white/60 text-xs pl-2">
                        Time: {cacheStatus.buildInfo.time}
                      </div>
                      <div className="text-white/60 text-xs pl-2">
                        Timestamp: {cacheStatus.buildInfo.timestamp}
                      </div>
                    </div>
                  )}

                  {/* Service Worker Details */}
                  {cacheStatus.serviceWorker && (
                    <div>
                      <div className="text-white/70 mb-1">Service Worker:</div>
                      <div className="text-white/60 text-xs pl-2">
                        Registered: {cacheStatus.serviceWorker.registered ? '✅' : '❌'}
                      </div>
                      <div className="text-white/60 text-xs pl-2">
                        Active: {cacheStatus.serviceWorker.active ? '✅' : '❌'}
                      </div>
                      <div className="text-white/60 text-xs pl-2">
                        Waiting: {cacheStatus.serviceWorker.waiting ? '⏳' : '❌'}
                      </div>
                      <div className="text-white/60 text-xs pl-2">
                        Installing: {cacheStatus.serviceWorker.installing ? '🔄' : '❌'}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.clearAllCaches?.()}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => window.hardRefresh?.()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Hard Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer with shortcuts */}
          <div className="p-2 border-t border-white/10 text-xs text-white/50 text-center">
            Ctrl+Shift+C to toggle • Ctrl+Shift+R for hard refresh
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CacheStatusIndicator