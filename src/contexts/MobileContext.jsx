import React, { createContext, useContext, useState, useEffect } from 'react'

const MobileContext = createContext(null)

export const useMobile = () => {
  const context = useContext(MobileContext)
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider')
  }
  return context
}

export const MobileProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenSize, setScreenSize] = useState('desktop')
  const [orientation, setOrientation] = useState('portrait')
  const [touchSupport, setTouchSupport] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Determine screen size
      if (width < 640) {
        setScreenSize('mobile')
        setIsMobile(true)
        setIsTablet(false)
      } else if (width < 1024) {
        setScreenSize('tablet')
        setIsMobile(false)
        setIsTablet(true)
      } else {
        setScreenSize('desktop')
        setIsMobile(false)
        setIsTablet(false)
      }

      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait')

      // Check for touch support
      setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  const isSmallScreen = screenSize === 'mobile'
  const isMediumScreen = screenSize === 'tablet'
  const isLargeScreen = screenSize === 'desktop'

  const value = {
    isMobile,
    isTablet,
    screenSize,
    orientation,
    touchSupport,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    // Convenience methods
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isTouchDevice: touchSupport,
    isDesktop: !isMobile && !isTablet
  }

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}