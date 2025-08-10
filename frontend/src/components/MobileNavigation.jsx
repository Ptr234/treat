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
    { name: 'Invest', route: '/investments', icon: CurrencyDollarIcon },
    { name: 'Services', route: '/services', icon: BuildingOfficeIcon },
    { name: 'Tools', route: '/tools', icon: WrenchScrewdriverIcon },
    { name: 'Help', route: '/support', icon: HandRaisedIcon }
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
      // Mobile navigation error handling removed for production
      // Fallback navigation
      window.location.href = `#${route}`
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg md:hidden">
      <div className="flex justify-around items-center py-1 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.route || 
                          (item.route !== '/' && location.pathname.startsWith(item.route))
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.route)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-500 hover:text-red-600 active:scale-95'
              }`}
            >
              <IconComponent className={`w-4 h-4 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNavigation