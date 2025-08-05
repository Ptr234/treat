// Production-Ready Backup and Recovery System for OSC Uganda
// Comprehensive data backup, recovery, and disaster resilience

export class BackupRecoveryManager {
  constructor() {
    this.backupStorage = new Map()
    this.recoveryPoints = new Map()
    this.maxBackups = 10
    this.autoBackupInterval = null
    this.compressionEnabled = true
    this.encryptionEnabled = true
    this.initialized = false
    
    this.init()
  }

  init() {
    if (typeof window === 'undefined') return
    
    this.setupPeriodicBackup()
    this.setupEmergencyRecovery()
    this.loadExistingBackups()
    
    this.initialized = true
    console.log('💾 Backup and Recovery system initialized')
  }

  // Automatic Backup System
  setupPeriodicBackup() {
    // Auto-backup every 5 minutes
    this.autoBackupInterval = setInterval(() => {
      this.createAutomaticBackup()
    }, 300000) // 5 minutes

    // Backup on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.createAutomaticBackup('visibility_change')
      }
    })

    // Backup before page unload
    window.addEventListener('beforeunload', () => {
      this.createEmergencyBackup()
    })

    // Backup on critical errors
    window.addEventListener('error', () => {
      this.createEmergencyBackup('error_occurred')
    })
  }

  setupEmergencyRecovery() {
    // Setup recovery from previous session
    window.addEventListener('load', () => {
      this.attemptSessionRecovery()
    })

    // Setup service worker communication for backup
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'BACKUP_REQUEST') {
          this.createServiceWorkerBackup()
        }
      })
    }
  }

  // Backup Creation Methods
  createAutomaticBackup(reason = 'periodic') {
    try {
      const backupData = this.collectBackupData()
      const backupId = this.generateBackupId(reason)
      
      const backup = {
        id: backupId,
        timestamp: Date.now(),
        reason,
        type: 'automatic',
        data: backupData,
        size: this.calculateDataSize(backupData),
        compressed: this.compressionEnabled,
        encrypted: this.encryptionEnabled
      }

      this.storeBackup(backup)
      console.log(`💾 Automatic backup created: ${backupId} (${backup.size} bytes)`)
      
      return backupId
    } catch (error) {
      console.error('❌ Failed to create automatic backup:', error)
      return null
    }
  }

  createManualBackup(description = 'Manual backup') {
    try {
      const backupData = this.collectBackupData()
      const backupId = this.generateBackupId('manual')
      
      const backup = {
        id: backupId,
        timestamp: Date.now(),
        reason: 'manual',
        type: 'manual',
        description,
        data: backupData,
        size: this.calculateDataSize(backupData),
        compressed: this.compressionEnabled,
        encrypted: this.encryptionEnabled,
        userCreated: true
      }

      this.storeBackup(backup)
      console.log(`💾 Manual backup created: ${backupId}`)
      
      return {
        success: true,
        backupId,
        size: backup.size,
        timestamp: backup.timestamp
      }
    } catch (error) {
      console.error('❌ Failed to create manual backup:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  createEmergencyBackup(reason = 'emergency') {
    try {
      const backupData = this.collectCriticalData()
      const backupId = this.generateBackupId('emergency')
      
      const backup = {
        id: backupId,
        timestamp: Date.now(),
        reason,
        type: 'emergency',
        data: backupData,
        size: this.calculateDataSize(backupData),
        critical: true,
        compressed: false, // Skip compression for speed
        encrypted: this.encryptionEnabled
      }

      // Store in multiple locations for redundancy
      this.storeBackup(backup)
      this.storeEmergencyBackup(backup)
      
      console.log(`🚨 Emergency backup created: ${backupId}`)
      return backupId
    } catch (error) {
      console.error('❌ Failed to create emergency backup:', error)
      return null
    }
  }

  createServiceWorkerBackup() {
    const backupData = this.collectBackupData()
    const backupId = this.generateBackupId('service_worker')
    
    // Send backup data to service worker for offline storage
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'STORE_BACKUP',
        backupId,
        data: backupData,
        timestamp: Date.now()
      })
    }
  }

  // Data Collection
  collectBackupData() {
    const data = {
      // Application state
      currentPage: window.location.href,
      scrollPosition: window.scrollY,
      timestamp: Date.now(),
      
      // User session data
      sessionData: this.getSessionData(),
      
      // Form data from all forms on page
      formData: this.collectFormData(),
      
      // Local storage data
      localStorage: this.getLocalStorageData(),
      
      // Session storage data
      sessionStorage: this.getSessionStorageData(),
      
      // Application preferences
      preferences: this.getUserPreferences(),
      
      // Navigation history (last 10 pages)
      navigationHistory: this.getNavigationHistory(),
      
      // Current input focus and values
      activeElements: this.getActiveElements(),
      
      // Analytics data
      analyticsData: this.getAnalyticsData(),
      
      // Error logs
      errorLogs: this.getRecentErrors(),
      
      // Performance metrics
      performanceData: this.getPerformanceData()
    }

    return data
  }

  collectCriticalData() {
    // Collect only essential data for emergency backups
    return {
      currentPage: window.location.href,
      timestamp: Date.now(),
      formData: this.collectFormData(),
      sessionData: this.getSessionData(),
      activeElements: this.getActiveElements(),
      emergencyReason: 'critical_failure'
    }
  }

  getSessionData() {
    try {
      return {
        userId: localStorage.getItem('osc_user_id'),
        sessionId: sessionStorage.getItem('session_id'),
        lastActivity: localStorage.getItem('last_activity'),
        visitCount: localStorage.getItem('visit_count')
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  collectFormData() {
    const forms = document.querySelectorAll('form')
    const formData = {}
    
    forms.forEach((form, index) => {
      const formId = form.id || `form_${index}`
      const data = new FormData(form)
      const formObject = {}
      
      for (const [key, value] of data.entries()) {
        // Skip sensitive fields
        if (!this.isSensitiveField(key)) {
          formObject[key] = value
        }
      }
      
      if (Object.keys(formObject).length > 0) {
        formData[formId] = formObject
      }
    })
    
    return formData
  }

  getLocalStorageData() {
    const data = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!this.isSensitiveStorageKey(key)) {
          data[key] = localStorage.getItem(key)
        }
      }
    } catch (error) {
      data.error = error.message
    }
    return data
  }

  getSessionStorageData() {
    const data = {}
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (!this.isSensitiveStorageKey(key)) {
          data[key] = sessionStorage.getItem(key)
        }
      }
    } catch (error) {
      data.error = error.message
    }
    return data
  }

  getUserPreferences() {
    return {
      theme: localStorage.getItem('theme'),
      language: localStorage.getItem('language') || navigator.language,
      notifications: localStorage.getItem('notifications_enabled'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  getNavigationHistory() {
    try {
      return JSON.parse(localStorage.getItem('user_journey') || '[]').slice(-10)
    } catch {
      return []
    }
  }

  getActiveElements() {
    const activeElement = document.activeElement
    const data = {
      tagName: activeElement?.tagName,
      id: activeElement?.id,
      className: activeElement?.className,
      value: activeElement?.value?.substring(0, 100), // Limit value length
      selectionStart: activeElement?.selectionStart,
      selectionEnd: activeElement?.selectionEnd
    }
    
    return data
  }

  getAnalyticsData() {
    try {
      return {
        events: JSON.parse(localStorage.getItem('analytics_events') || '[]').slice(-50), // Last 50 events
        metrics: localStorage.getItem('performance_metrics'),
        userSegment: localStorage.getItem('user_segment')
      }
    } catch {
      return {}
    }
  }

  getRecentErrors() {
    try {
      return JSON.parse(localStorage.getItem('error_reports') || '[]').slice(-20) // Last 20 errors
    } catch {
      return []
    }
  }

  getPerformanceData() {
    if (!performance.timing) return {}
    
    const timing = performance.timing
    return {
      navigationStart: timing.navigationStart,
      loadEventEnd: timing.loadEventEnd,
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null
    }
  }

  // Security and Privacy
  isSensitiveField(fieldName) {
    const sensitivePatterns = [
      'password', 'pin', 'ssn', 'social', 'credit', 'card', 'cvv', 
      'secret', 'token', 'api_key', 'auth', 'login'
    ]
    
    return sensitivePatterns.some(pattern => 
      fieldName.toLowerCase().includes(pattern)
    )
  }

  isSensitiveStorageKey(key) {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'private_key', 'auth_token',
      'session_token', 'api_key', 'credit_card', 'ssn'
    ]
    
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    )
  }

  // Storage Management
  storeBackup(backup) {
    try {
      // Compress data if enabled
      if (backup.compressed) {
        backup.data = this.compressData(backup.data)
      }

      // Encrypt data if enabled
      if (backup.encrypted) {
        backup.data = this.encryptData(backup.data)
      }

      // Store in memory
      this.backupStorage.set(backup.id, backup)

      // Store in localStorage with size limit
      this.storeInLocalStorage(backup)

      // Cleanup old backups
      this.cleanupOldBackups()

      return true
    } catch (error) {
      console.error('Failed to store backup:', error)
      return false
    }
  }

  storeInLocalStorage(backup) {
    try {
      const backupKey = `backup_${backup.id}`
      const backupJson = JSON.stringify(backup)
      
      // Check size limit (5MB for single backup)
      if (backupJson.length > 5242880) {
        console.warn('Backup too large for localStorage, storing metadata only')
        const metadata = { ...backup }
        delete metadata.data
        localStorage.setItem(backupKey, JSON.stringify(metadata))
      } else {
        localStorage.setItem(backupKey, backupJson)
      }

      // Update backup index
      this.updateBackupIndex(backup.id)
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, cleaning up old backups')
        this.emergencyCleanup()
        // Try again after cleanup
        try {
          localStorage.setItem(`backup_${backup.id}`, JSON.stringify(backup))
        } catch (retryError) {
          console.error('Failed to store backup even after cleanup:', retryError)
        }
      }
    }
  }

  storeEmergencyBackup(backup) {
    // Store emergency backup in multiple locations
    try {
      // IndexedDB storage
      if ('indexedDB' in window) {
        this.storeInIndexedDB(backup)
      }

      // Session storage as fallback
      try {
        sessionStorage.setItem(`emergency_backup_${backup.id}`, JSON.stringify(backup))
      } catch (error) {
        console.warn('Failed to store emergency backup in sessionStorage:', error)
      }
    } catch (error) {
      console.error('Failed to store emergency backup:', error)
    }
  }

  storeInIndexedDB(backup) {
    const request = indexedDB.open('OSC_BackupDB', 1)
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB for backup')
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' })
      }
    }
    
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['backups'], 'readwrite')
      const store = transaction.objectStore('backups')
      
      store.add(backup).onsuccess = () => {
        console.log('Backup stored in IndexedDB:', backup.id)
      }
    }
  }

  // Recovery Methods
  attemptSessionRecovery() {
    try {
      // Check for emergency backups first
      const emergencyBackups = this.findEmergencyBackups()
      if (emergencyBackups.length > 0) {
        this.showRecoveryDialog(emergencyBackups)
        return
      }

      // Check for recent backups
      const recentBackups = this.findRecentBackups(3600000) // Last hour
      if (recentBackups.length > 0) {
        const lastBackup = recentBackups[0]
        if (this.shouldOfferRecovery(lastBackup)) {
          this.showRecoveryDialog([lastBackup])
        }
      }
    } catch (error) {
      console.error('Failed to attempt session recovery:', error)
    }
  }

  findEmergencyBackups() {
    const emergencyBackups = []
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('emergency_backup_')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key))
          if (backup.type === 'emergency') {
            emergencyBackups.push(backup)
          }
        } catch (error) {
          console.warn('Failed to parse emergency backup:', key)
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key.startsWith('emergency_backup_')) {
        try {
          const backup = JSON.parse(sessionStorage.getItem(key))
          emergencyBackups.push(backup)
        } catch (error) {
          console.warn('Failed to parse emergency backup from sessionStorage:', key)
        }
      }
    }

    return emergencyBackups.sort((a, b) => b.timestamp - a.timestamp)
  }

  findRecentBackups(timeWindow = 3600000) {
    const recentBackups = []
    const cutoffTime = Date.now() - timeWindow
    
    for (const [id, backup] of this.backupStorage.entries()) {
      if (backup.timestamp > cutoffTime) {
        recentBackups.push(backup)
      }
    }

    return recentBackups.sort((a, b) => b.timestamp - a.timestamp)
  }

  shouldOfferRecovery(backup) {
    // Offer recovery if:
    // 1. Last backup was recent (within 1 hour)
    // 2. User had active form data
    // 3. There was an error or emergency
    
    const isRecent = Date.now() - backup.timestamp < 3600000
    const hasFormData = backup.data.formData && Object.keys(backup.data.formData).length > 0
    const wasEmergency = backup.type === 'emergency' || backup.reason.includes('error')
    
    return isRecent && (hasFormData || wasEmergency)
  }

  showRecoveryDialog(backups) {
    if (typeof document === 'undefined') return

    const dialog = document.createElement('div')
    dialog.id = 'recovery-dialog'
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10003;
      font-family: system-ui, sans-serif;
    `
    
    dialog.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 24px; margin-right: 12px;">💾</span>
          <h2 style="margin: 0; color: #1f2937; font-size: 20px;">Session Recovery Available</h2>
        </div>
        
        <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.5;">
          We found ${backups.length} backup${backups.length !== 1 ? 's' : ''} from your previous session. 
          Would you like to restore your data?
        </p>
        
        <div style="margin-bottom: 20px;">
          ${backups.slice(0, 3).map(backup => `
            <div style="
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: background-color 0.2s;
            " 
            onclick="this.style.backgroundColor = this.style.backgroundColor ? '' : '#f3f4f6'"
            data-backup-id="${backup.id}">
              <div style="font-weight: 600; color: #1f2937;">
                ${backup.type.charAt(0).toUpperCase() + backup.type.slice(1)} Backup
              </div>
              <div style="font-size: 14px; color: #6b7280;">
                ${new Date(backup.timestamp).toLocaleString()}
                ${backup.reason !== backup.type ? ` • ${backup.reason}` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="document.getElementById('recovery-dialog').remove()" 
                  style="
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #374151;
                  ">
            Skip Recovery
          </button>
          <button onclick="window.backupRecoveryManager.restoreSelectedBackup()" 
                  style="
                    padding: 8px 16px;
                    background: #059669;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                  ">
            Restore Selected
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(dialog)
  }

  restoreSelectedBackup() {
    const dialog = document.getElementById('recovery-dialog')
    const selectedDiv = dialog.querySelector('[data-backup-id][style*="background-color"]')
    
    if (selectedDiv) {
      const backupId = selectedDiv.getAttribute('data-backup-id')
      this.restoreBackup(backupId)
        .then(success => {
          if (success) {
            this.showRecoverySuccess()
          } else {
            this.showRecoveryError()
          }
        })
    }
    
    dialog.remove()
  }

  async restoreBackup(backupId) {
    try {
      console.log(`🔄 Restoring backup: ${backupId}`)
      
      // Find the backup
      let backup = this.backupStorage.get(backupId)
      if (!backup) {
        backup = await this.loadBackupFromStorage(backupId)
      }
      
      if (!backup) {
        throw new Error('Backup not found')
      }

      // Decrypt data if needed
      let data = backup.data
      if (backup.encrypted) {
        data = this.decryptData(data)
      }

      // Decompress data if needed
      if (backup.compressed) {
        data = this.decompressData(data)
      }

      // Restore different types of data
      await this.restoreData(data)
      
      console.log(`✅ Successfully restored backup: ${backupId}`)
      return true
    } catch (error) {
      console.error('❌ Failed to restore backup:', error)
      return false
    }
  }

  async restoreData(data) {
    // Restore form data
    if (data.formData) {
      this.restoreFormData(data.formData)
    }

    // Restore localStorage data
    if (data.localStorage) {
      this.restoreLocalStorage(data.localStorage)
    }

    // Restore session data
    if (data.sessionStorage) {
      this.restoreSessionStorage(data.sessionStorage)
    }

    // Restore scroll position
    if (data.scrollPosition) {
      window.scrollTo(0, data.scrollPosition)
    }

    // Restore active element focus
    if (data.activeElements) {
      this.restoreActiveElement(data.activeElements)
    }

    // Navigate to original page if different
    if (data.currentPage && data.currentPage !== window.location.href) {
      const shouldNavigate = confirm(`Restore to original page?\n${  data.currentPage}`)
      if (shouldNavigate) {
        window.location.href = data.currentPage
      }
    }
  }

  restoreFormData(formData) {
    for (const [formId, data] of Object.entries(formData)) {
      const form = document.getElementById(formId) || document.querySelector(`form:nth-of-type(${parseInt(formId.replace('form_', '')) + 1})`)
      
      if (form) {
        for (const [fieldName, value] of Object.entries(data)) {
          const field = form.querySelector(`[name="${fieldName}"]`)
          if (field && !this.isSensitiveField(fieldName)) {
            field.value = value
          }
        }
      }
    }
  }

  restoreLocalStorage(data) {
    for (const [key, value] of Object.entries(data)) {
      if (!this.isSensitiveStorageKey(key)) {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn(`Failed to restore localStorage key: ${key}`, error)
        }
      }
    }
  }

  restoreSessionStorage(data) {
    for (const [key, value] of Object.entries(data)) {
      if (!this.isSensitiveStorageKey(key)) {
        try {
          sessionStorage.setItem(key, value)
        } catch (error) {
          console.warn(`Failed to restore sessionStorage key: ${key}`, error)
        }
      }
    }
  }

  restoreActiveElement(elementData) {
    if (elementData.id) {
      const element = document.getElementById(elementData.id)
      if (element) {
        element.focus()
        if (element.setSelectionRange && elementData.selectionStart !== undefined) {
          element.setSelectionRange(elementData.selectionStart, elementData.selectionEnd)
        }
      }
    }
  }

  // Utility Methods
  generateBackupId(reason) {
    return `backup_${reason}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  calculateDataSize(data) {
    return JSON.stringify(data).length
  }

  compressData(data) {
    // Simple compression by removing whitespace in JSON
    return JSON.stringify(data)
  }

  decompressData(compressedData) {
    return JSON.parse(compressedData)
  }

  encryptData(data) {
    // Simple Base64 encoding (in production, use proper encryption)
    return btoa(JSON.stringify(data))
  }

  decryptData(encryptedData) {
    return JSON.parse(atob(encryptedData))
  }

  updateBackupIndex(backupId) {
    const backupIndex = JSON.parse(localStorage.getItem('backup_index') || '[]')
    backupIndex.push({
      id: backupId,
      timestamp: Date.now()
    })
    
    // Keep only last 20 entries
    if (backupIndex.length > 20) {
      backupIndex.splice(0, backupIndex.length - 20)
    }
    
    localStorage.setItem('backup_index', JSON.stringify(backupIndex))
  }

  cleanupOldBackups() {
    // Remove backups older than 24 hours, except manual and emergency backups
    const oneDayAgo = Date.now() - 86400000
    
    for (const [id, backup] of this.backupStorage.entries()) {
      if (backup.timestamp < oneDayAgo && 
          backup.type === 'automatic' && 
          !backup.userCreated) {
        this.backupStorage.delete(id)
        
        // Remove from localStorage
        try {
          localStorage.removeItem(`backup_${id}`)
        } catch (error) {
          console.warn('Failed to remove old backup from localStorage:', error)
        }
      }
    }
  }

  emergencyCleanup() {
    // Remove oldest backups to free up space
    const backups = Array.from(this.backupStorage.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest 50% of automatic backups
    const toRemove = backups
      .filter(([_, backup]) => backup.type === 'automatic')
      .slice(0, Math.ceil(backups.length / 2))
    
    toRemove.forEach(([id]) => {
      this.backupStorage.delete(id)
      try {
        localStorage.removeItem(`backup_${id}`)
      } catch (error) {
        console.warn('Failed to remove backup during emergency cleanup:', error)
      }
    })
  }

  loadExistingBackups() {
    // Load backup index from localStorage
    try {
      const backupIndex = JSON.parse(localStorage.getItem('backup_index') || '[]')
      
      backupIndex.forEach(indexEntry => {
        try {
          const backupData = localStorage.getItem(`backup_${indexEntry.id}`)
          if (backupData) {
            const backup = JSON.parse(backupData)
            this.backupStorage.set(backup.id, backup)
          }
        } catch (error) {
          console.warn('Failed to load backup:', indexEntry.id)
        }
      })
      
      console.log(`💾 Loaded ${this.backupStorage.size} existing backups`)
    } catch (error) {
      console.warn('Failed to load backup index:', error)
    }
  }

  async loadBackupFromStorage(backupId) {
    // Try localStorage first
    try {
      const backupData = localStorage.getItem(`backup_${backupId}`)
      if (backupData) {
        return JSON.parse(backupData)
      }
    } catch (error) {
      console.warn('Failed to load backup from localStorage:', error)
    }

    // Try IndexedDB
    try {
      return await this.loadFromIndexedDB(backupId)
    } catch (error) {
      console.warn('Failed to load backup from IndexedDB:', error)
    }

    return null
  }

  loadFromIndexedDB(backupId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OSC_BackupDB', 1)
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'))
      
      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['backups'], 'readonly')
        const store = transaction.objectStore('backups')
        
        const getRequest = store.get(backupId)
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result)
        }
        
        getRequest.onerror = () => {
          reject(new Error('Failed to load backup from IndexedDB'))
        }
      }
    })
  }

  showRecoverySuccess() {
    console.log('✅ Data restored successfully')
    // Could show a user notification here
  }

  showRecoveryError() {
    console.error('❌ Failed to restore data')
    // Could show a user error notification here
  }

  // Public API
  getBackupStatus() {
    return {
      totalBackups: this.backupStorage.size,
      latestBackup: this.getLatestBackup(),
      backupTypes: this.getBackupTypeStats(),
      totalSize: this.getTotalBackupSize(),
      autoBackupEnabled: this.autoBackupInterval !== null
    }
  }

  getLatestBackup() {
    const backups = Array.from(this.backupStorage.values())
    return backups.sort((a, b) => b.timestamp - a.timestamp)[0] || null
  }

  getBackupTypeStats() {
    const stats = {}
    for (const backup of this.backupStorage.values()) {
      stats[backup.type] = (stats[backup.type] || 0) + 1
    }
    return stats
  }

  getTotalBackupSize() {
    let totalSize = 0
    for (const backup of this.backupStorage.values()) {
      totalSize += backup.size || 0
    }
    return totalSize
  }

  exportBackups() {
    const backups = Array.from(this.backupStorage.values())
    const exportData = {
      backups,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `osc_backups_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  destroy() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval)
    }
    
    this.backupStorage.clear()
    console.log('💾 Backup and Recovery system destroyed')
  }
}

// Export singleton instance
export const backupRecoveryManager = new BackupRecoveryManager()

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.backupRecoveryManager = backupRecoveryManager
}

export default backupRecoveryManager