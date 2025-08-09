import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ChevronRightIcon, 
  HomeIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  HandRaisedIcon,
  CalculatorIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Define page names and professional icons with descriptions
  const pageMap = {
    'about': { 
      name: 'About Uganda', 
      IconComponent: InformationCircleIcon,
      description: 'Uganda investment overview'
    },
    'investments': { 
      name: 'Investment Opportunities', 
      IconComponent: CurrencyDollarIcon,
      description: 'Explore investment sectors'
    },
    'services': { 
      name: 'Government Services', 
      IconComponent: BuildingLibraryIcon,
      description: 'Official government services'
    },
    'agencies': { 
      name: 'Agency Directory', 
      IconComponent: BuildingOfficeIcon,
      description: 'Government agency contacts'
    },
    'tools': { 
      name: 'Business Tools', 
      IconComponent: WrenchScrewdriverIcon,
      description: 'Business calculation tools'
    },
    'calculator': { 
      name: 'Tax Calculator', 
      IconComponent: CalculatorIcon,
      description: 'Calculate tax obligations'
    },
    'roi-calculator': { 
      name: 'ROI Calculator', 
      IconComponent: ChartBarIcon,
      description: 'Calculate investment returns'
    },
    'downloads': { 
      name: 'Resources & Downloads', 
      IconComponent: FolderIcon,
      description: 'Download business resources'
    },
    'support': { 
      name: 'Support Center', 
      IconComponent: HandRaisedIcon,
      description: 'Get help and support'
    },
    'invoice': { 
      name: 'Invoice Generator', 
      IconComponent: DocumentTextIcon,
      description: 'Generate professional invoices'
    },
    'document-checklist': { 
      name: 'Document Checklist', 
      IconComponent: CheckCircleIcon,
      description: 'Required document checklist'
    },
    'registration-wizard': { 
      name: 'Business Registration', 
      IconComponent: BuildingOfficeIcon,
      description: 'Register your business'
    },
    'investment-onboarding': { 
      name: 'Investment Onboarding', 
      IconComponent: CurrencyDollarIcon,
      description: 'Investment application process'
    }
  }

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-300 bg-black/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 shadow-lg">
      <Link 
        to="/" 
        className="flex items-center hover:text-yellow-400 transition-all duration-300 hover:scale-105 group"
        title="Return to homepage"
      >
        <HomeIcon className="h-5 w-5 mr-2 group-hover:text-yellow-400" />
        <span className="font-medium">Home</span>
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const pageInfo = pageMap[pathname] || { 
          name: pathname.charAt(0).toUpperCase() + pathname.slice(1), 
          IconComponent: DocumentTextIcon,
          description: 'Page content'
        }
        
        return (
          <React.Fragment key={pathname}>
            <ChevronRightIcon className="h-4 w-4 text-gray-500 mx-2" />
            {isLast ? (
              <div className="flex items-center group">
                <div className="flex items-center text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                  <pageInfo.IconComponent className="h-4 w-4 mr-2" />
                  <span>{pageInfo.name}</span>
                </div>
                {pageInfo.description && (
                  <div className="ml-3 text-xs text-gray-400 hidden lg:block">
                    {pageInfo.description}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to={routeTo} 
                className="flex items-center hover:text-yellow-400 transition-all duration-300 hover:scale-105 group px-2 py-1 rounded-lg hover:bg-white/5"
                title={`Go to ${pageInfo.name}${pageInfo.description ? ` - ${pageInfo.description}` : ''}`}
              >
                <pageInfo.IconComponent className="h-4 w-4 mr-2 group-hover:text-yellow-400" />
                <span className="font-medium">{pageInfo.name}</span>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb