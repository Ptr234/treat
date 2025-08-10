// Enhanced Keyboard Navigation Hook with WCAG 2.1 AA Compliance
import { useEffect, useCallback, useRef } from 'react'

export const useEnhancedKeyboardNavigation = (options = {}) => {
  const {
    enabled = true,
    trapFocus = false,
    escapeCallback = null,
    arrowNavigation = false,
    skipDisabledElements = true,
    announceChanges = true
  } = options

  const containerRef = useRef(null)
  const focusHistoryRef = useRef([])
  const currentIndexRef = useRef(0)

  // Get all focusable elements within container
  const getFocusableElements = useCallback((container = containerRef.current) => {
    if (!container) return []

    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
      '[role="option"]:not([disabled])',
      '[role="tab"]:not([disabled])'
    ].join(', ')

    const elements = Array.from(container.querySelectorAll(focusableSelectors))
    
    return elements.filter(element => {
      const style = getComputedStyle(element)
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0' &&
                       element.offsetWidth > 0 && 
                       element.offsetHeight > 0

      if (!isVisible) return false
      
      if (skipDisabledElements) {
        return !element.disabled && element.getAttribute('aria-disabled') !== 'true'
      }
      
      return true
    })
  }, [skipDisabledElements])

  // Focus trap functionality
  const trapFocusHandler = useCallback((event) => {
    if (!trapFocus || !containerRef.current) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
          announceElementFocus(lastElement)
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
          announceElementFocus(firstElement)
        }
      }
    }
  }, [trapFocus, getFocusableElements])

  // Arrow key navigation
  const arrowNavigationHandler = useCallback((event) => {
    if (!arrowNavigation || !containerRef.current) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const currentElement = document.activeElement
    const currentIndex = focusableElements.indexOf(currentElement)
    
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = (currentIndex + 1) % focusableElements.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = focusableElements.length - 1
        break
      default:
        return
    }

    if (nextIndex !== currentIndex) {
      focusableElements[nextIndex].focus()
      currentIndexRef.current = nextIndex
      announceElementFocus(focusableElements[nextIndex])
    }
  }, [arrowNavigation, getFocusableElements])

  // Escape key handler
  const escapeHandler = useCallback((event) => {
    if (event.key === 'Escape' && escapeCallback) {
      event.preventDefault()
      escapeCallback(event)
    }
  }, [escapeCallback])

  // Announce element focus for screen readers
  const announceElementFocus = useCallback((element) => {
    if (!announceChanges) return

    const announcement = generateElementAnnouncement(element)
    if (announcement) {
      announceToScreenReader(announcement)
    }
  }, [announceChanges])

  // Generate appropriate announcement for element
  const generateElementAnnouncement = (element) => {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    
    const label = ariaLabel || 
                (ariaLabelledBy && document.getElementById(ariaLabelledBy)?.textContent) ||
                element.textContent?.trim() ||
                element.value ||
                element.alt ||
                element.title

    let type = role || tagName

    // Special handling for different element types
    switch (tagName) {
      case 'button':
        type = 'button'
        break
      case 'a':
        type = 'link'
        break
      case 'input':
        type = element.type === 'submit' ? 'submit button' : `${element.type} input`
        break
      case 'select':
        type = 'combobox'
        break
      case 'textarea':
        type = 'text area'
        break
    }

    if (!label) return null

    return `${label}, ${type}`
  }

  // Announce to screen reader
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management utilities
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
      currentIndexRef.current = 0
      announceElementFocus(focusableElements[0])
    }
  }, [getFocusableElements, announceElementFocus])

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      const lastIndex = focusableElements.length - 1
      focusableElements[lastIndex].focus()
      currentIndexRef.current = lastIndex
      announceElementFocus(focusableElements[lastIndex])
    }
  }, [getFocusableElements, announceElementFocus])

  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      const nextIndex = (currentIndexRef.current + 1) % focusableElements.length
      focusableElements[nextIndex].focus()
      currentIndexRef.current = nextIndex
      announceElementFocus(focusableElements[nextIndex])
    }
  }, [getFocusableElements, announceElementFocus])

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      const prevIndex = currentIndexRef.current === 0 
        ? focusableElements.length - 1 
        : currentIndexRef.current - 1
      focusableElements[prevIndex].focus()
      currentIndexRef.current = prevIndex
      announceElementFocus(focusableElements[prevIndex])
    }
  }, [getFocusableElements, announceElementFocus])

  // Store focus history for restoration
  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement
    if (activeElement && activeElement !== document.body) {
      focusHistoryRef.current.push(activeElement)
    }
  }, [])

  const restoreFocus = useCallback(() => {
    const lastFocusedElement = focusHistoryRef.current.pop()
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      try {
        lastFocusedElement.focus()
        announceElementFocus(lastFocusedElement)
      } catch (error) {
        // Focus restoration error removed for production
      }
    }
  }, [announceElementFocus])

  // Setup event listeners
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    
    const keyDownHandler = (event) => {
      trapFocusHandler(event)
      arrowNavigationHandler(event)
      escapeHandler(event)
    }

    container.addEventListener('keydown', keyDownHandler)

    return () => {
      container.removeEventListener('keydown', keyDownHandler)
    }
  }, [enabled, trapFocusHandler, arrowNavigationHandler, escapeHandler])

  // Add CSS for screen reader only content
  useEffect(() => {
    if (!document.getElementById('sr-only-styles')) {
      const style = document.createElement('style')
      style.id = 'sr-only-styles'
      style.textContent = `
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        
        .sr-only-focusable:focus {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: inherit !important;
          margin: inherit !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: normal !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    storeFocus,
    restoreFocus,
    getFocusableElements,
    announceToScreenReader
  }
}

export default useEnhancedKeyboardNavigation