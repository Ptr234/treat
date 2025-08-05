// Advanced Background Sync Manager for Offline Form Submissions
import { Workbox } from 'workbox-window'

export class BackgroundSyncManager {
  constructor() {
    this.syncQueue = []
    this.isOnline = navigator.onLine
    this.workbox = null
    this.syncTags = {
      FORM_SUBMISSION: 'form-submission',
      DATA_UPLOAD: 'data-upload',
      FEEDBACK: 'feedback-submission'
    }
    
    this.initializeBackgroundSync()
    this.setupNetworkListeners()
  }

  // Initialize background sync with service worker
  async initializeBackgroundSync() {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        this.workbox = new Workbox('/sw.js')
        
        // Listen for service worker messages
        this.workbox.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event)
        })

        // Register service worker
        await this.workbox.register()
        
        // Check for background sync support
        const registration = await navigator.serviceWorker.ready
        if (registration.sync) {
          console.log('✅ Background Sync supported')
          this.setupSyncEventHandlers()
        } else {
          console.warn('⚠️ Background Sync not supported, using fallback')
          this.setupFallbackSync()
        }
      } else {
        console.warn('⚠️ Service Worker or Background Sync not supported')
        this.setupFallbackSync()
      }
    } catch (error) {
      console.error('❌ Failed to initialize background sync:', error)
      this.setupFallbackSync()
    }
  }

  // Setup network status listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored')
      this.isOnline = true
      this.processPendingSync()
    })

    window.addEventListener('offline', () => {
      console.log('📡 Network connection lost')
      this.isOnline = false
    })
  }

  // Setup sync event handlers
  setupSyncEventHandlers() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        this.handleSyncCompleted(event.data)
      }
    })
  }

  // Fallback sync for unsupported browsers
  setupFallbackSync() {
    // Check for pending sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processPendingSync()
      }
    }, 30000)
  }

  // Queue form submission for background sync
  async queueFormSubmission(formData, endpoint, options = {}) {
    const submissionId = this.generateSubmissionId()
    const submission = {
      id: submissionId,
      type: 'form',
      data: formData,
      endpoint,
      method: options.method || 'POST',
      headers: options.headers || {},
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      tag: this.syncTags.FORM_SUBMISSION,
      metadata: {
        formName: options.formName || 'unknown',
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    // Store in IndexedDB for persistence
    await this.storeSubmission(submission)

    // Add to sync queue
    this.syncQueue.push(submission)

    // Try immediate submission if online
    if (this.isOnline) {
      try {
        await this.processSubmission(submission)
        await this.removeSubmission(submissionId)
        return { success: true, submissionId }
      } catch (error) {
        console.log('📡 Immediate submission failed, queued for background sync')
      }
    }

    // Register background sync
    await this.registerBackgroundSync(submission.tag)

    return { 
      success: false, 
      submissionId, 
      message: 'Queued for background sync when connection is restored' 
    }
  }

  // Queue file upload for background sync
  async queueFileUpload(files, endpoint, options = {}) {
    const uploadId = this.generateSubmissionId()
    
    // Convert files to base64 for storage
    const fileData = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: await this.fileToBase64(file)
      }))
    )

    const upload = {
      id: uploadId,
      type: 'upload',
      files: fileData,
      endpoint,
      method: options.method || 'POST',
      headers: options.headers || {},
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      tag: this.syncTags.DATA_UPLOAD,
      metadata: {
        fileCount: files.length,
        totalSize: fileData.reduce((sum, file) => sum + file.size, 0),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    await this.storeSubmission(upload)
    this.syncQueue.push(upload)

    if (this.isOnline) {
      try {
        await this.processUpload(upload)
        await this.removeSubmission(uploadId)
        return { success: true, uploadId }
      } catch (error) {
        console.log('📡 Immediate upload failed, queued for background sync')
      }
    }

    await this.registerBackgroundSync(upload.tag)

    return { 
      success: false, 
      uploadId, 
      message: 'Upload queued for background sync when connection is restored' 
    }
  }

  // Process individual submission
  async processSubmission(submission) {
    try {
      const response = await fetch(submission.endpoint, {
        method: submission.method,
        headers: {
          'Content-Type': 'application/json',
          ...submission.headers
        },
        body: JSON.stringify(submission.data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Notify success
      this.notifySubmissionSuccess(submission, result)
      
      return result
    } catch (error) {
      submission.retryCount++
      if (submission.retryCount >= submission.maxRetries) {
        this.notifySubmissionFailure(submission, error)
        throw error
      }
      
      // Exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, submission.retryCount), 30000)
      setTimeout(() => {
        this.processSubmission(submission)
      }, delay)
      
      throw error
    }
  }

  // Process file upload
  async processUpload(upload) {
    try {
      const formData = new FormData()
      
      // Convert base64 back to files
      upload.files.forEach((fileData, index) => {
        const byteCharacters = atob(fileData.data.split(',')[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const file = new File([byteArray], fileData.name, { type: fileData.type })
        formData.append(`file_${index}`, file)
      })

      const response = await fetch(upload.endpoint, {
        method: upload.method,
        headers: upload.headers,
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      this.notifyUploadSuccess(upload, result)
      
      return result
    } catch (error) {
      upload.retryCount++
      if (upload.retryCount >= upload.maxRetries) {
        this.notifyUploadFailure(upload, error)
        throw error
      }
      
      const delay = Math.min(1000 * Math.pow(2, upload.retryCount), 30000)
      setTimeout(() => {
        this.processUpload(upload)
      }, delay)
      
      throw error
    }
  }

  // Register background sync with service worker
  async registerBackgroundSync(tag) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration.sync) {
        await registration.sync.register(tag)
        console.log(`🔄 Background sync registered: ${tag}`)
      }
    } catch (error) {
      console.error('❌ Failed to register background sync:', error)
    }
  }

  // Process all pending sync items
  async processPendingSync() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    console.log(`🔄 Processing ${this.syncQueue.length} pending sync items`)

    const promises = this.syncQueue.map(async (item) => {
      try {
        if (item.type === 'form') {
          await this.processSubmission(item)
        } else if (item.type === 'upload') {
          await this.processUpload(item)
        }
        
        await this.removeSubmission(item.id)
        return { success: true, id: item.id }
      } catch (error) {
        console.error(`❌ Failed to process sync item ${item.id}:`, error)
        return { success: false, id: item.id, error }
      }
    })

    const results = await Promise.allSettled(promises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
    
    // Remove successful items from queue
    this.syncQueue = this.syncQueue.filter(item => 
      !successful.some(s => s.value.id === item.id)
    )

    console.log(`✅ Successfully processed ${successful.length} sync items`)
  }

  // Handle service worker messages
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data

    switch (type) {
      case 'SYNC_EVENT':
        this.handleSyncEvent(data)
        break
      case 'SYNC_COMPLETED':
        this.handleSyncCompleted(data)
        break
      case 'SYNC_FAILED':
        this.handleSyncFailed(data)
        break
    }
  }

  // Handle sync event from service worker
  async handleSyncEvent(data) {
    console.log('🔄 Background sync event received:', data.tag)
    await this.processPendingSync()
  }

  // Handle successful sync completion
  handleSyncCompleted(data) {
    console.log('✅ Background sync completed:', data)
    this.notifyUser('Offline data has been successfully synchronized')
  }

  // Handle sync failure
  handleSyncFailed(data) {
    console.error('❌ Background sync failed:', data)
    this.notifyUser('Some offline data could not be synchronized. Please check your connection.')
  }

  // Notification methods
  notifySubmissionSuccess(submission, result) {
    this.dispatchEvent('submission-success', { submission, result })
    if (submission.metadata.formName) {
      this.notifyUser(`${submission.metadata.formName} submitted successfully`)
    }
  }

  notifySubmissionFailure(submission, error) {
    this.dispatchEvent('submission-failure', { submission, error })
    this.notifyUser('Form submission failed. Please try again.')
  }

  notifyUploadSuccess(upload, result) {
    this.dispatchEvent('upload-success', { upload, result })
    this.notifyUser(`${upload.files.length} file(s) uploaded successfully`)
  }

  notifyUploadFailure(upload, error) {
    this.dispatchEvent('upload-failure', { upload, error })
    this.notifyUser('File upload failed. Please try again.')
  }

  notifyUser(message) {
    // Dispatch custom event for UI notifications
    window.dispatchEvent(new CustomEvent('background-sync-notification', {
      detail: { message, timestamp: Date.now() }
    }))
  }

  // Storage methods using IndexedDB
  async storeSubmission(submission) {
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(['submissions'], 'readwrite')
      const store = transaction.objectStore('submissions')
      await store.add(submission)
    } catch (error) {
      console.error('❌ Failed to store submission:', error)
      // Fallback to localStorage
      this.storeSubmissionFallback(submission)
    }
  }

  async removeSubmission(id) {
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(['submissions'], 'readwrite')
      const store = transaction.objectStore('submissions')
      await store.delete(id)
    } catch (error) {
      console.error('❌ Failed to remove submission:', error)
      this.removeSubmissionFallback(id)
    }
  }

  // IndexedDB database management
  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BackgroundSyncDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('submissions')) {
          const store = db.createObjectStore('submissions', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('tag', 'tag')
        }
      }
    })
  }

  // Fallback storage methods
  storeSubmissionFallback(submission) {
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]')
    stored.push(submission)
    localStorage.setItem('pendingSubmissions', JSON.stringify(stored))
  }

  removeSubmissionFallback(id) {
    const stored = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]')
    const filtered = stored.filter(s => s.id !== id)
    localStorage.setItem('pendingSubmissions', JSON.stringify(filtered))
  }

  // Utility methods
  generateSubmissionId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  dispatchEvent(type, detail) {
    window.dispatchEvent(new CustomEvent(`background-sync-${type}`, { detail }))
  }

  // Get sync status and statistics
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      pendingSubmissions: this.syncQueue.filter(item => item.type === 'form').length,
      pendingUploads: this.syncQueue.filter(item => item.type === 'upload').length,
      oldestPending: this.syncQueue.length > 0 ? 
        Math.min(...this.syncQueue.map(item => item.timestamp)) : null
    }
  }

  // Clear all pending sync data
  async clearSyncQueue() {
    this.syncQueue = []
    
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(['submissions'], 'readwrite')
      const store = transaction.objectStore('submissions')
      await store.clear()
    } catch (error) {
      localStorage.removeItem('pendingSubmissions')
    }
    
    console.log('🗑️ Sync queue cleared')
  }
}

// Export singleton instance
export const backgroundSyncManager = new BackgroundSyncManager()

export default BackgroundSyncManager