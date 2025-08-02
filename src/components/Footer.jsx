import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
// Professional footer with world-class animations

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()

  const footerLinks = {
    Services: [
      { name: 'All Services', href: '/services', type: 'route' },
      { name: 'Business Registration', href: '/registration-wizard', type: 'route' },
      { name: 'Tax Calculator', href: '/calculator', type: 'route' },
      { name: 'Document Checklist', href: '/document-checklist', type: 'route' }
    ],
    Investment: [
      { name: 'Investment Opportunities', href: '/investments', type: 'route' },
      { name: 'Investment Onboarding', href: '/investment-onboarding', type: 'route' },
      { name: 'ROI Calculator', href: '/roi-calculator', type: 'route' },
      { name: 'Agencies Directory', href: '/agencies', type: 'route' }
    ],
    Resources: [
      { name: 'Downloads', href: '/downloads', type: 'route' },
      { name: 'Tools & Calculators', href: '/tools', type: 'route' },
      { name: 'Invoice Generator', href: '/invoice', type: 'route' },
      { name: 'Support Center', href: '/support', type: 'route' }
    ],
    Contact: [
      { name: 'Phone: +256 775 692 335', href: 'tel:+256775692335', type: 'external' },
      { name: 'Email: support@onestopcentre.ug', href: 'mailto:support@onestopcentre.ug', type: 'external' },
      { name: 'About Us', href: '/about', type: 'route' }
    ]
  }

  const handleLinkClick = (link) => {
    if (link.type === 'route') {
      navigate(link.href)
    } else if (link.type === 'external') {
      if (link.href.startsWith('tel:') || link.href.startsWith('mailto:')) {
        window.location.href = link.href
      } else {
        window.open(link.href, '_blank')
      }
    } else if (link.href.startsWith('#')) {
      const element = document.querySelector(link.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        // If element not found on current page, navigate to home and then scroll
        if (window.location.pathname !== '/') {
          navigate(`/${link.href}`)
        }
      }
    } else {
      window.open(link.href, '_blank')
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-800 rounded-lg overflow-hidden flex items-center justify-center mr-3 shadow-lg">
                  <img 
                    src="/images/oneStopCenter-logo.jpeg" 
                    alt="OneStopCentre Uganda Official Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <span className="hidden text-white font-bold text-lg">OSC</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">OneStopCentre Uganda</h3>
                  <p className="text-sm text-gray-400 font-medium">InvestUganda simplified</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your gateway to streamlined government services, business registration, 
                and investment opportunities in Uganda.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.open('https://twitter.com/ugandainvest', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Follow UIA on Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => window.open('https://facebook.com/UgandaInvestmentAuthority', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Follow UIA on Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => window.open('https://linkedin.com/company/uganda-investment-authority', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Connect with UIA on LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>

          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={category}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h4 className="text-lg font-semibold mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-gray-400 hover:text-white transition-colors text-sm text-left hover:text-red-300"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Official Government Portals */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h4 className="text-lg font-semibold mb-4 text-center text-red-400">
              🏛️ Official Government Portals
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600 hover:border-red-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white">MyBusiness Portal</h5>
                    <p className="text-xs text-gray-400">Business registration & licensing</p>
                    <button
                      onClick={() => window.open('https://mybusiness.go.ug/', '_blank')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium mt-1 transition-colors"
                    >
                      mybusiness.go.ug →
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600 hover:border-red-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                    <img 
                      src="/images/logos/UIA logo.png" 
                      alt="UIA Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <svg className="hidden w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white">Uganda Investment Authority</h5>
                    <p className="text-xs text-gray-400">Investment opportunities & incentives</p>
                    <button
                      onClick={() => window.open('https://ugandainvest.go.ug/', '_blank')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium mt-1 transition-colors"
                    >
                      ugandainvest.go.ug →
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600 hover:border-red-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white">eBiz Portal</h5>
                    <p className="text-xs text-gray-400">Electronic business services</p>
                    <button
                      onClick={() => window.open('https://ebiz.go.ug/', '_blank')}
                      className="text-red-400 hover:text-red-300 text-sm font-medium mt-1 transition-colors"
                    >
                      ebiz.go.ug →
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} OneStop Centre Uganda. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => window.open('https://www.ugandainvest.go.ug/privacy-policy', '_blank')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.open('https://www.ugandainvest.go.ug/terms-of-service', '_blank')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => window.open('https://www.ugandainvest.go.ug/accessibility', '_blank')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Accessibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer