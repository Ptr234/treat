import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const themes = {
  default: {
    name: 'Uganda Red',
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #000000 100%)',
    accent: 'from-red-600 to-red-800'
  },
  wildlife: {
    name: 'African Wildlife',
    background: `linear-gradient(rgba(220,38,38,0.7), rgba(0,0,0,0.5)), url('https://imgs.search.brave.com/7Zf__NagL78Anjo_ZJ0gvxKo2nfHnwolTc1cVUssCsg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9jcm93/bmVkLWNyYW5lLXpv/by1tYWRyaWQtc3Bh/aW4tNjAyNDc1Mzcu/anBn')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    accent: 'from-red-600 to-yellow-400'
  },
  heritage: {
    name: 'Heritage Pride',
    background: `linear-gradient(rgba(220,38,38,0.8), rgba(0,0,0,0.6)), url('https://imgs.search.brave.com/d6POB43GhgZ9Xi6serN-h4cIeBBbsHHDnQ6BBmUcxDs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9t/b3phbWJpcXVlLWZs/YWctcnVmZmxlZC1i/ZWF1dGlmdWxseS13/YXZpbmctbWFjcm8t/Y2xvc2UtdXAtc2hv/dF8xMzc5LTExOC5q/cGc_c2VtdD1haXNf/aHlicmlk')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    accent: 'from-red-600 to-yellow-400'
  },
  community: {
    name: 'Community Joy',
    background: `linear-gradient(rgba(255,215,0,0.8), rgba(0,0,0,0.5)), url('https://imgs.search.brave.com/AxVdlXBFn2VzY0HWiESXzkDEUyWMR00jhHN4iQDRBow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzAv/NjI2LzM5MC9zbWFs/bC90aGUtam95LWFu/ZC1sYXVnaHRlci1v/Zi1hZnJpY2FuLWNo/aWxkcmVuLXBsYXlp/bmctZ2EtZnJlZS1w/aG90by5qcGc')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    accent: 'from-yellow-400 to-black'
  },
  sunset: {
    name: 'Heritage Red',
    background: 'linear-gradient(135deg, #dc2626 0%, #000000 50%, #ffd700 100%)',
    accent: 'from-red-600 to-yellow-400'
  },
  ocean: {
    name: 'Presidential',
    background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #dc2626 100%)',
    accent: 'from-black to-red-600'
  },
  forest: {
    name: 'National Pride',
    background: 'linear-gradient(135deg, #ffd700 0%, #dc2626 50%, #000000 100%)',
    accent: 'from-yellow-400 to-black'
  }
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default')
  const [isAutoRotate, setIsAutoRotate] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved && themes[saved]) {
      setCurrentTheme(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  useEffect(() => {
    if (!isAutoRotate) return

    const interval = setInterval(() => {
      const themeKeys = Object.keys(themes)
      const currentIndex = themeKeys.indexOf(currentTheme)
      const nextIndex = (currentIndex + 1) % themeKeys.length
      setCurrentTheme(themeKeys[nextIndex])
    }, 30000) // Change theme every 30 seconds

    return () => clearInterval(interval)
  }, [currentTheme, isAutoRotate])

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  const getNextTheme = () => {
    const themeKeys = Object.keys(themes)
    const currentIndex = themeKeys.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    return themeKeys[nextIndex]
  }

  const toggleAutoRotate = () => {
    setIsAutoRotate(prev => !prev)
  }

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
    getNextTheme,
    isAutoRotate,
    toggleAutoRotate
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}