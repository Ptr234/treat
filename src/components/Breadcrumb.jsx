import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Define page names and icons
  const pageMap = {
    'about': { name: 'About Uganda', icon: '🇺🇬' },
    'investments': { name: 'Investments', icon: '💰' },
    'services': { name: 'Government Services', icon: '🏛️' },
    'agencies': { name: 'Agency Directory', icon: '🏢' },
    'tools': { name: 'Business Tools', icon: '🛠️' },
    'calculator': { name: 'Tax Calculator', icon: '🧮' },
    'roi-calculator': { name: 'ROI Calculator', icon: '📊' },
    'downloads': { name: 'Resources & Downloads', icon: '📁' },
    'support': { name: 'Support Center', icon: '🤝' },
    'invoice': { name: 'Invoice Generator', icon: '📄' },
    'document-checklist': { name: 'Document Checklist', icon: '✅' },
    'registration-wizard': { name: 'Business Registration', icon: '🏢' },
    'investment-onboarding': { name: 'Investment Onboarding', icon: '💰' }
  }

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-300 bg-black/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/10">
      <Link 
        to="/" 
        className="flex items-center hover:text-white transition-colors duration-200"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const pageInfo = pageMap[pathname] || { name: pathname.charAt(0).toUpperCase() + pathname.slice(1), icon: '📄' }
        
        return (
          <React.Fragment key={pathname}>
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            {isLast ? (
              <span className="flex items-center text-yellow-400 font-medium">
                <span className="mr-1">{pageInfo.icon}</span>
                {pageInfo.name}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="flex items-center hover:text-white transition-colors duration-200"
              >
                <span className="mr-1">{pageInfo.icon}</span>
                {pageInfo.name}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb