// Precise Navigation Utility - Ensures every navigation goes exactly where intended

export const navigateToSection = (navigate, path, sectionId = null, options = {}) => {
  const { 
    offset = 100, // Offset from top for sticky headers
    behavior = 'smooth',
    block = 'start',
    replace = false 
  } = options

  try {
    if (sectionId) {
      // Navigate to page with hash
      const fullPath = `${path}#${sectionId}`
      navigate(fullPath, { replace })
      
      // Wait for navigation to complete, then scroll to element
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.pageYOffset - offset
          window.scrollTo({
            top: elementTop,
            behavior
          })
        }
      }, 100)
    } else {
      // Regular navigation
      navigate(path, { replace })
    }
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback to hash navigation
    window.location.href = sectionId ? `${path}#${sectionId}` : path
  }
}

export const scrollToElement = (elementId, options = {}) => {
  const { 
    offset = 100,
    behavior = 'smooth' 
  } = options

  try {
    const element = document.getElementById(elementId)
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({
        top: elementTop,
        behavior
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Scroll error:', error)
    return false
  }
}

// Handle hash navigation on page load
export const handleHashNavigation = (offset = 100) => {
  const hash = window.location.hash.substring(1)
  if (hash) {
    // Wait for page to fully load
    setTimeout(() => {
      scrollToElement(hash, { offset })
    }, 500)
  }
}

export default {
  navigateToSection,
  scrollToElement,
  handleHashNavigation
}