import React from 'react'
import { motion } from 'framer-motion'

const UgandaToolsIntegration = () => {
  const tools = [
    {
      title: 'Advanced Tax Calculator',
      description: 'Comprehensive PAYE, Corporate Tax, and Investment Incentive calculator with ATMS benefits',
      url: '/calculator',
      icon: '🧮',
      category: 'Tax & Finance',
      isInternal: true,
      features: ['PAYE Calculation', 'Corporate Tax', 'Investment Incentives', 'VAT & Withholding Tax']
    },
    {
      title: 'Investment ROI Calculator',
      description: 'Analyze investment returns, tax benefits, and economic impact across all Uganda sectors',
      url: '/roi-calculator',
      icon: '📊',
      category: 'Investment',
      isInternal: true,
      features: ['ROI Analysis', 'ATMS Tax Credits', 'Risk Assessment', 'Economic Impact']
    },
    {
      title: 'URA-Compliant Invoice Generator',
      description: 'Generate professional invoices with full URA tax compliance and electronic receipt features',
      url: '/invoice',
      icon: '📄',
      category: 'Business Tools',
      isInternal: true,
      features: ['URA Compliance', 'VAT Calculation', 'Withholding Tax', 'Professional Templates']
    },
    {
      title: 'Business Registration Wizard',
      description: 'Step-by-step guide to register any type of business in Uganda with cost estimates',
      url: '/registration-wizard',
      icon: '🏢',
      category: 'Registration',
      isInternal: true,
      features: ['All Business Types', 'Cost Estimation', 'Document Guide', 'Timeline Planning']
    },
    {
      title: 'Document Checklist Tool',
      description: 'Interactive checklist for all government service applications with progress tracking',
      url: '/document-checklist',
      icon: '📋',
      category: 'Documentation',
      isInternal: true,
      features: ['Service-Specific Lists', 'Progress Tracking', 'PDF Export', 'Compliance Tips']
    },
    {
      title: 'Uganda Investment Tool',
      description: 'External interactive tool for exploring investment opportunities and incentives',
      url: '/uganda_investment_tool.html',
      icon: '💰',
      category: 'Investment',
      isInternal: false,
      features: ['Sector Analysis', 'Incentive Calculator', 'Location Guide']
    },
    {
      title: 'Uganda Minerals License Tool',
      description: 'External tool for mineral exploration licensing and mining permits in Uganda',
      url: '/uganda_minerals_license_tool.html',
      icon: '⛏️',
      category: 'Mining',
      isInternal: false,
      features: ['License Types', 'Application Process', 'Fee Calculator']
    }
  ]

  const openTool = (url, isInternal) => {
    if (isInternal) {
      // Scroll to internal tool section
      const element = document.querySelector(url)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Open external tool in new window
      window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    }
  }

  return (
    <section id="tools" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Tools
          </h2>
          <p className="text-xl text-gray-600">
            Specialized tools for investment analysis and licensing applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              onClick={() => openTool(tool.url, tool.isInternal)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{tool.icon}</div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                      {tool.category}
                    </span>
                    {tool.isInternal && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-3">
                  {tool.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {tool.description}
                </p>
                
                {tool.features && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">KEY FEATURES:</div>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {tool.features.length > 3 && (
                        <span className="text-xs text-gray-500">+{tool.features.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center text-sm">
                    {tool.isInternal ? 'Use Tool' : 'Launch Tool'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {tool.isInternal ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      )}
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500">
                    {tool.isInternal ? 'Scroll to tool' : 'New window'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            🚀 Enhanced Tool Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Real-Time Calculations</h4>
              <p className="text-white/90 text-sm">
                Live tax calculations, ROI analysis, and financial projections
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">URA Compliance</h4>
              <p className="text-white/90 text-sm">
                Full compliance with Uganda Revenue Authority regulations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Instant Processing</h4>
              <p className="text-white/90 text-sm">
                Quick document generation and checklist management
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Export & Download</h4>
              <p className="text-white/90 text-sm">
                Generate PDFs, invoices, and comprehensive business guides
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white/90 text-sm">
              💡 <strong>Pro Tip:</strong> All tools are fully integrated and work seamlessly together for a complete business management experience.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default UgandaToolsIntegration