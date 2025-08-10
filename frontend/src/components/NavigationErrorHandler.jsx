import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NavigationErrorHandler = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Handle navigation errors globally
    const handleNavigationError = (event) => {
      // Navigation error logging removed for production
      
      // Attempt to recover from navigation errors
      if (event.error?.message?.includes('navigation') || 
          event.error?.message?.includes('router')) {
        
        // Try to navigate to home page as fallback
        try {
          navigate('/', { replace: true })
        } catch (_fallbackError) {
          // Fallback navigation error logging removed for production
          // Last resort: direct window navigation
          window.location.href = '/'
        }
      }
    }

    // Handle route not found errors
    const handleRouteError = () => {
      const currentPath = location.pathname
      // Route processing warning removed for production
      
      // Check if current route exists in our defined routes
      const validRoutes = [
        '/', '/about', '/investments', '/services', '/agencies', 
        '/tools', '/calculator', '/roi-calculator', '/downloads', 
        '/support', '/invoice', '/document-checklist', 
        '/registration-wizard', '/investment-onboarding', '/search'
      ]
      
      if (!validRoutes.includes(currentPath)) {
        // Invalid route warning removed for production
        navigate('/*', { replace: true })
      }
    }

    // Add error listeners
    window.addEventListener('error', handleNavigationError)
    window.addEventListener('unhandledrejection', handleNavigationError)
    
    // Check current route validity
    handleRouteError()
    
    return () => {
      window.removeEventListener('error', handleNavigationError)
      window.removeEventListener('unhandledrejection', handleNavigationError)
    }
  }, [navigate, location.pathname])

  return children
}

export default NavigationErrorHandler