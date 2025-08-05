import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMobile } from '../contexts/MobileContext'

const MobileNavigation = () => {
  const { isMobile } = useMobile()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isMobile) return null

  const navItems = [
    { name: 'Home', route: '/', icon: '🏠' },
    { name: 'Investment Opportunities', route: '/investments', icon: '💰' },
    { name: 'Investment Services', route: '/services', icon: '🏛️' },
    { name: 'Investment Tools', route: '/tools', icon: '🛠️' },
    { name: 'Investor Support', route: '/support', icon: '🤝' }
  ]

  const handleNavigation = (route) => {
    try {
      if (location.pathname !== route) {
        navigate(route)
      } else {
        // If already on the page, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Mobile navigation error:', error)
      // Fallback navigation
      window.location.href = `#${route}`
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.route)}
            className={`flex flex-col items-center p-2 text-xs transition-colors ${
              location.pathname === item.route 
                ? 'text-red-600' 
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MobileNavigation