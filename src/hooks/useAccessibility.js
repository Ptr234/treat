import { useEffect, useState, useCallback } from 'react'

export const useKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const handleKeyDown = useCallback((event, items, onSelect) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex])
        }
        break
      case 'Escape':
        setFocusedIndex(-1)
        break
      default:
        break
    }
  }, [focusedIndex])
  
  return { focusedIndex, setFocusedIndex, handleKeyDown }
}

export const useScreenReader = (text, shouldAnnounce = false) => {
  useEffect(() => {
    if (shouldAnnounce && text) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.style.position = 'absolute'
      announcement.style.left = '-10000px'
      announcement.style.width = '1px'
      announcement.style.height = '1px'
      announcement.style.overflow = 'hidden'
      
      document.body.appendChild(announcement)
      announcement.textContent = text
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [text, shouldAnnounce])
}

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addListener(handleChange)
    
    return () => mediaQuery.removeListener(handleChange)
  }, [])
  
  return prefersReducedMotion
}

export const useFocusManagement = () => {
  const [lastFocusedElement, setLastFocusedElement] = useState(null)
  
  const saveFocus = useCallback(() => {
    setLastFocusedElement(document.activeElement)
  }, [])
  
  const restoreFocus = useCallback(() => {
    if (lastFocusedElement) {
      lastFocusedElement.focus()
      setLastFocusedElement(null)
    }
  }, [lastFocusedElement])
  
  const trapFocus = useCallback((containerRef) => {
    if (!containerRef.current) return
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    containerRef.current.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey)
    }
  }, [])
  
  return { saveFocus, restoreFocus, trapFocus }
}