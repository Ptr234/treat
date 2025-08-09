import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  WrenchScrewdriverIcon,
  CalculatorIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  CheckCircleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  PresentationChartLineIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import UgandaToolsIntegration from '../components/UgandaToolsIntegration'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const ToolsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleToolAction = (action) => {
    switch (action) {
      case 'openInvoiceGenerator':
        // Trigger invoice generator
        document.dispatchEvent(new CustomEvent('openInvoiceGenerator'))
        break
      case 'openChecklistModal':
        // Trigger checklist modal
        document.dispatchEvent(new CustomEvent('openChecklistModal'))
        break
      case 'openFeedbackForm':
        // Trigger feedback form
        document.dispatchEvent(new CustomEvent('openFeedbackForm'))
        break
      default:
        break
    }
  }

  // Handle hash-based navigation for specific tools (legacy support)
  useEffect(() => {
    const hash = location.hash
    if (hash === '#invoice') {
      // Redirect to dedicated invoice page
      navigate('/invoice')
    } else if (hash === '#checklist') {
      // Redirect to dedicated document checklist page
      navigate('/document-checklist')
    } else if (hash === '#registration-wizard') {
      // Redirect to dedicated business registration page
      navigate('/registration-wizard')
    }
  }, [location, navigate])

  const tools = [
    {
      title: 'Tax Calculator',
      description: 'Calculate VAT, PAYE, and corporate tax obligations with real-time rates',
      IconComponent: CalculatorIcon,
      link: '/calculator',
      features: ['VAT Calculator', 'PAYE Calculator', 'Corporate Tax', 'Withholding Tax'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Investment ROI Calculator',
      description: 'Analyze potential returns on ATMS sector investments',
      IconComponent: ChartBarIcon,
      link: '/roi-calculator',
      features: ['ROI Analysis', 'Risk Assessment', 'Market Projections', 'Profitability Metrics'],
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Business Registration Wizard',
      description: 'Step-by-step guide for company registration with URSB',
      IconComponent: BuildingOffice2Icon,
      link: '/registration-wizard',
      features: ['Name Reservation', 'Documentation Guide', 'Fee Calculator', 'Timeline Tracker'],
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Invoice Generator',
      description: 'Create professional invoices compliant with URA requirements',
      IconComponent: DocumentTextIcon,
      link: '/invoice',
      features: ['URA Compliant', 'Multiple Currencies', 'Tax Calculations', 'PDF Export'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Document Checklist',
      description: 'Interactive checklist for business registration and licensing',
      IconComponent: CheckCircleIcon,
      link: '/document-checklist',
      features: ['Process Tracking', 'Document Verification', 'Deadline Reminders', 'Progress Reports'],
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Uganda Minerals License Tool',
      description: 'Explore mineral licensing opportunities and requirements',
      IconComponent: CubeIcon,
      link: '/uganda_minerals_license_tool.html',
      external: true,
      features: ['License Types', 'Application Process', 'Fee Structure', 'Requirements Guide'],
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Uganda Investment Tool',
      description: 'Comprehensive investment planning and analysis platform',
      IconComponent: CurrencyDollarIcon,
      link: '/uganda_investment_tool.html',
      external: true,
      features: ['Sector Analysis', 'Investment Planning', 'Risk Evaluation', 'Market Intelligence'],
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Feedback System',
      description: 'Share your experience and get support from our team',
      IconComponent: ChatBubbleLeftRightIcon,
      link: '#',
      action: 'openFeedbackForm',
      features: ['Quick Feedback', 'Issue Reporting', 'Feature Requests', 'Support Tickets'],
      color: 'from-pink-500 to-rose-600'
    }
  ]

  return (
    <PageBackground page="tools">
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumb />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <WrenchScrewdriverIcon className="w-6 h-6 mr-3 text-orange-400" />
              <span className="text-white font-semibold">Business Tools</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Powerful Tools for
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Business Success
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Access our comprehensive suite of business tools designed specifically for the Ugandan market. 
              From tax calculations to investment analysis, we've got everything you need.
            </p>
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <tool.IconComponent className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{tool.title}</h3>
                      <div className={`h-1 w-16 bg-gradient-to-r ${tool.color} rounded-full`}></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4 flex-1">{tool.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-400">
                          <span className="w-1 h-1 bg-yellow-400 rounded-full mr-2"></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {tool.action ? (
                    <button
                      onClick={() => handleToolAction(tool.action)}
                      className={`w-full bg-gradient-to-r ${tool.color} text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                    >
                      Launch Tool
                    </button>
                  ) : tool.external ? (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full bg-gradient-to-r ${tool.color} text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105 text-center block`}
                    >
                      Open Tool
                    </a>
                  ) : (
                    <Link
                      to={tool.link}
                      className={`w-full bg-gradient-to-r ${tool.color} text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105 text-center block`}
                    >
                      Access Tool
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Specialized Tools Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Specialized Tools</h2>
              <p className="text-xl text-gray-300">
                Advanced tools for specific sectors and requirements
              </p>
            </div>
            <UgandaToolsIntegration />
          </motion.div>

          {/* Tool Categories */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
              <BriefcaseIcon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Business Tools</h3>
              <p className="text-gray-300 text-sm">
                Essential tools for business registration, compliance, and daily operations
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
              <PresentationChartLineIcon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Financial Tools</h3>
              <p className="text-gray-300 text-sm">
                Advanced calculators and analysis tools for financial planning and compliance
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
              <FlagIcon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Sector-Specific</h3>
              <p className="text-gray-300 text-sm">
                Specialized tools for agriculture, mining, tourism, and ICT sectors
              </p>
            </div>
          </motion.div>
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default ToolsPage