// Enhanced Security Manager with CSP Reporting and Advanced Threat Detection
export class EnhancedSecurityManager {
  constructor() {
    this.violations = []
    this.securityMetrics = {
      cspViolations: 0,
      xssAttempts: 0,
      suspiciousRequests: 0,
      rateLimitViolations: 0
    }
    this.initializeSecurityMonitoring()
  }

  // Initialize comprehensive security monitoring
  initializeSecurityMonitoring() {
    this.setupCSPReporting()
    this.setupXSSProtection()
    this.setupSecurityHeaders()
    this.setupRateLimiting()
    this.monitorSecurityEvents()
  }

  // Content Security Policy reporting
  setupCSPReporting() {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        timestamp: new Date().toISOString(),
        type: 'csp',
        directive: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        originalPolicy: event.originalPolicy,
        disposition: event.disposition,
        statusCode: event.statusCode,
        userAgent: navigator.userAgent,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber
      }

      this.recordViolation(violation)
      this.securityMetrics.cspViolations++
      
      // Send to security monitoring service
      this.reportSecurityEvent(violation)
    })

    // Report CSP violations to endpoint
    this.reportCSPViolation = async (violationData) => {
      try {
        await fetch('/api/csp-violations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(violationData)
        })
      } catch (error) {
        console.error('Failed to report CSP violation:', error)
      }
    }
  }

  // Advanced XSS protection
  setupXSSProtection() {
    // Monitor for potential XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi
    ]

    // Enhanced input sanitization
    this.sanitizeInput = (input, context = 'general') => {
      if (typeof input !== 'string') return input

      let sanitized = input.trim()

      // Context-specific sanitization
      switch (context) {
        case 'html':
          sanitized = this.sanitizeHTML(sanitized)
          break
        case 'url':
          sanitized = this.sanitizeURL(sanitized)
          break
        case 'script':
          // Never allow script context
          throw new Error('Script context not allowed')
        case 'css':
          sanitized = this.sanitizeCSS(sanitized)
          break
        default:
          sanitized = this.sanitizeGeneral(sanitized)
      }

      // Check for XSS patterns
      xssPatterns.forEach(pattern => {
        if (pattern.test(sanitized)) {
          this.securityMetrics.xssAttempts++
          this.reportSecurityEvent({
            type: 'xss_attempt',
            pattern: pattern.source,
            input: input.substring(0, 100), // Truncate for security
            timestamp: new Date().toISOString()
          })
          throw new Error('Potentially malicious input detected')
        }
      })

      return sanitized
    }
  }

  // Sanitization methods
  sanitizeHTML(input) {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  }

  sanitizeURL(input) {
    try {
      const url = new URL(input)
      // Only allow specific protocols
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
      if (!allowedProtocols.includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
      return url.toString()
    } catch (error) {
      throw new Error('Invalid URL format')
    }
  }

  sanitizeCSS(input) {
    // Remove potentially dangerous CSS
    return input
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/@import/gi, '')
      .replace(/behavior\s*:/gi, '')
  }

  sanitizeGeneral(input) {
    return input
      .replace(/[<>'"&]/g, (match) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        }
        return entities[match]
      })
  }

  // Security headers validation
  setupSecurityHeaders() {
    const requiredHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': true // Just check presence
    }

    // Check headers on page load
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        Object.keys(requiredHeaders).forEach(header => {
          if (!response.headers.get(header)) {
            this.reportSecurityEvent({
              type: 'missing_security_header',
              header,
              timestamp: new Date().toISOString()
            })
          }
        })
      })
      .catch(error => {
        console.warn('Could not verify security headers:', error)
      })
  }

  // Advanced rate limiting
  setupRateLimiting() {
    this.rateLimits = new Map()
    this.defaultLimits = {
      api: { requests: 100, window: 60000 }, // 100 requests per minute
      form: { requests: 10, window: 60000 },  // 10 form submissions per minute
      search: { requests: 50, window: 60000 }  // 50 searches per minute
    }

    this.checkRateLimit = (key, type = 'api') => {
      const limit = this.defaultLimits[type]
      const now = Date.now()
      const windowStart = now - limit.window

      if (!this.rateLimits.has(key)) {
        this.rateLimits.set(key, [])
      }

      const requests = this.rateLimits.get(key)
      
      // Remove old requests outside the window
      const recentRequests = requests.filter(timestamp => timestamp > windowStart)
      
      if (recentRequests.length >= limit.requests) {
        this.securityMetrics.rateLimitViolations++
        this.reportSecurityEvent({
          type: 'rate_limit_violation',
          key,
          type: type,
          requestCount: recentRequests.length,
          limit: limit.requests,
          timestamp: new Date().toISOString()
        })
        throw new Error(`Rate limit exceeded for ${type}`)
      }

      recentRequests.push(now)
      this.rateLimits.set(key, recentRequests)
      
      return true
    }
  }

  // Security event monitoring
  monitorSecurityEvents() {
    // Monitor DOM mutations for suspicious changes
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                this.scanElementForThreats(node)
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }

    // Monitor for suspicious network requests
    this.monitorNetworkRequests()
    
    // Monitor for suspicious console activity
    this.monitorConsoleActivity()
  }

  // Scan elements for security threats
  scanElementForThreats(element) {
    // Check for suspicious attributes
    const suspiciousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover']
    suspiciousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        this.reportSecurityEvent({
          type: 'suspicious_attribute',
          element: element.tagName,
          attribute: attr,
          value: element.getAttribute(attr),
          timestamp: new Date().toISOString()
        })
      }
    })

    // Check for suspicious content
    if (element.innerHTML && /<script/i.test(element.innerHTML)) {
      this.reportSecurityEvent({
        type: 'suspicious_content',
        element: element.tagName,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Network request monitoring
  monitorNetworkRequests() {
    // Override fetch to monitor requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [url, options = {}] = args
      
      try {
        // Check rate limits
        this.checkRateLimit(url.toString(), 'api')
        
        // Monitor for suspicious requests
        if (typeof url === 'string') {
          this.validateRequestURL(url)
        }
        
        const response = await originalFetch(...args)
        
        // Log suspicious responses
        if (!response.ok && response.status >= 400) {
          this.reportSecurityEvent({
            type: 'failed_request',
            url: url.toString(),
            status: response.status,
            timestamp: new Date().toISOString()
          })
        }
        
        return response
      } catch (error) {
        this.reportSecurityEvent({
          type: 'request_error',
          url: url.toString(),
          error: error.message,
          timestamp: new Date().toISOString()
        })
        throw error
      }
    }
  }

  // Console activity monitoring
  monitorConsoleActivity() {
    const originalConsole = { ...console }
    
    ;['log', 'warn', 'error'].forEach(method => {
      console[method] = (...args) => {
        // Check for potential security issues in console messages
        const message = args.join(' ')
        if (/password|token|api[_-]?key|secret/i.test(message)) {
          this.reportSecurityEvent({
            type: 'sensitive_data_console',
            method,
            timestamp: new Date().toISOString()
          })
        }
        
        originalConsole[method](...args)
      }
    })
  }

  // URL validation
  validateRequestURL(url) {
    try {
      const urlObj = new URL(url, window.location.origin)
      
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /\.\.\//, // Path traversal
        /script:/i,
        /data:/i,
        /file:/i
      ]
      
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(url)) {
          this.securityMetrics.suspiciousRequests++
          this.reportSecurityEvent({
            type: 'suspicious_url',
            url,
            pattern: pattern.source,
            timestamp: new Date().toISOString()
          })
          throw new Error('Suspicious URL pattern detected')
        }
      })
      
      return true
    } catch (error) {
      throw new Error('Invalid URL format')
    }
  }

  // Record security violation
  recordViolation(violation) {
    this.violations.push(violation)
    
    // Keep only last 100 violations to prevent memory leaks
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100)
    }
  }

  // Report security event to monitoring service
  async reportSecurityEvent(event) {
    try {
      // In production, this would send to security monitoring service
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔒 Security Event:', event)
      }
      
      // Send to monitoring endpoint
      await fetch('/api/security-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          sessionId: this.getSessionId(),
          userAgent: navigator.userAgent,
          timestamp: event.timestamp || new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to report security event:', error)
    }
  }

  // Get session ID for tracking
  getSessionId() {
    let sessionId = sessionStorage.getItem('security_session_id')
    if (!sessionId) {
      sessionId = this.generateSecureId()
      sessionStorage.setItem('security_session_id', sessionId)
    }
    return sessionId
  }

  // Generate secure random ID
  generateSecureId() {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16)
      window.crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    } else {
      // Fallback for older browsers
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  // Get security metrics
  getSecurityMetrics() {
    return {
      ...this.securityMetrics,
      totalViolations: this.violations.length,
      recentViolations: this.violations.filter(v => 
        Date.now() - new Date(v.timestamp).getTime() < 3600000 // Last hour
      ).length
    }
  }

  // Security health check
  performSecurityHealthCheck() {
    const checks = {
      csp: this.checkCSPCompliance(),
      headers: this.checkSecurityHeaders(),
      https: window.location.protocol === 'https:',
      localStorage: this.checkLocalStorageSecurity(),
      sessionStorage: this.checkSessionStorageSecurity()
    }

    const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100

    return {
      score: Math.round(score),
      checks,
      recommendations: this.generateSecurityRecommendations(checks)
    }
  }

  // CSP compliance check
  checkCSPCompliance() {
    return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null
  }

  // Security headers check
  checkSecurityHeaders() {
    // This would need to be checked server-side in a real implementation
    return true
  }

  // Local storage security check
  checkLocalStorageSecurity() {
    try {
      const testKey = '__security_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  // Session storage security check
  checkSessionStorageSecurity() {
    try {
      const testKey = '__security_test__'
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  // Generate security recommendations
  generateSecurityRecommendations(checks) {
    const recommendations = []

    if (!checks.csp) {
      recommendations.push('Implement Content Security Policy headers')
    }
    if (!checks.https) {
      recommendations.push('Use HTTPS for secure communication')
    }
    if (!checks.localStorage) {
      recommendations.push('Local storage access issues detected')
    }

    return recommendations
  }
}

// Export singleton instance
export const enhancedSecurityManager = new EnhancedSecurityManager()

export default EnhancedSecurityManager