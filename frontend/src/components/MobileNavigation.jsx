import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMobile } from '../contexts/MobileContext'
import {
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline'

const MobileNavigation = () => {
  const { isMobile } = useMobile()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isMobile) return null

  const navItems = [
    { name: 'Home', route: '/', icon: HomeIcon },
    { name: 'Investments', route: '/investments', icon: CurrencyDollarIcon },
    { name: 'Services', route: '/services', icon: BuildingOfficeIcon },
    { name: 'Tools', route: '/tools', icon: WrenchScrewdriverIcon },
    { name: 'Support', route: '/support', icon: HandRaisedIcon }
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
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.route)}
              className={`flex flex-col items-center p-2 text-xs transition-colors ${
                location.pathname === item.route 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span>{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNavigation