import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'
import LazyImage from './LazyImage'

const AgencyDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const { addNotification } = useNotification()

  const agencies = [
    {
      id: 'uia',
      name: 'Uganda Investment Authority',
      abbreviation: 'UIA',
      category: 'Investment',
      description: 'The national investment promotion agency responsible for promoting, facilitating and monitoring investments in Uganda.',
      services: ['Investment Promotion', 'Investment Facilitation', 'Investment Monitoring', 'Investment Licensing'],
      contact: {
        phone: '+256 414 301000',
        email: 'info@ugandainvest.go.ug',
        website: 'https://www.ugandainvest.go.ug',
        address: 'Plot 28 Kampala Road, UIA House, P.O. Box 7418, Kampala, Uganda'
      },
      logo: '/images/logos/UIA logo.png',
      established: '1991',
      priority: 'high'
    },
    {
      id: 'ura',
      name: 'Uganda Revenue Authority',
      abbreviation: 'URA',
      category: 'Tax & Revenue',
      description: 'The national tax collection agency responsible for the assessment, collection and accounting for all central government tax revenues.',
      services: ['Tax Registration', 'Tax Assessment', 'Tax Collection', 'Customs Services'],
      contact: {
        phone: '+256 414 233219',
        email: 'info@ura.go.ug',
        website: 'https://www.ura.go.ug',
        address: 'Plot 38 Kampala Road, Tax House, P.O. Box 7223, Kampala, Uganda'
      },
      logo: '/images/logos/URA logo.png',
      established: '1991',
      priority: 'high'
    },
    {
      id: 'ursb',
      name: 'Uganda Registration Services Bureau',
      abbreviation: 'URSB',
      category: 'Business Registration',
      description: 'The national business registration authority providing company registration, intellectual property, and collateral registry services.',
      services: ['Company Registration', 'Business Names', 'Intellectual Property', 'Collateral Registry'],
      contact: {
        phone: '+256 414 259005',
        email: 'ursb@ursb.go.ug',
        website: 'https://ursb.go.ug',
        address: 'Plot 5 George Street, Worker\'s House, P.O. Box 6848, Kampala, Uganda'
      },
      logo: '/images/logos/URSB logo.png',
      established: '1998',
      priority: 'high'
    },
    {
      id: 'nssf',
      name: 'National Social Security Fund',
      abbreviation: 'NSSF',
      category: 'Social Security',
      description: 'The national social security scheme providing retirement, disability, and survivors benefits to employees.',
      services: ['Employee Registration', 'Employer Registration', 'Benefits Processing', 'Fund Management'],
      contact: {
        phone: '+256 414 330772',
        email: 'info@nssfug.org',
        website: 'https://www.nssfug.org',
        address: 'Workers House, Plot 1 Pilkington Road, P.O. Box 7079, Kampala, Uganda'
      },
      logo: '/images/logos/NSSF logo.png',
      established: '1985',
      priority: 'medium'
    },
    {
      id: 'bou',
      name: 'Bank of Uganda',
      abbreviation: 'BOU',
      category: 'Financial Services',
      description: 'The central bank of Uganda responsible for monetary policy, financial stability, and banking supervision.',
      services: ['Banking Supervision', 'Monetary Policy', 'Foreign Exchange', 'Financial Licensing'],
      contact: {
        phone: '+256 414 258441',
        email: 'info@bou.or.ug',
        website: 'https://www.bou.or.ug',
        address: 'Plot 37-43 Kampala Road, P.O. Box 7120, Kampala, Uganda'
      },
      logo: '/images/logos/BOU.jpeg',
      established: '1966',
      priority: 'high'
    },
    {
      id: 'utb',
      name: 'Uganda Tourism Board',
      abbreviation: 'UTB',
      category: 'Tourism',
      description: 'The national tourism promotion agency responsible for marketing Uganda as a tourist destination.',
      services: ['Tourism Promotion', 'Tourism Licensing', 'Tourism Development', 'Quality Assurance'],
      contact: {
        phone: '+256 414 342196',
        email: 'info@utb.go.ug',
        website: 'https://www.utb.go.ug',
        address: 'Plot 42-44 Jinja Road, IPS Building, P.O. Box 7211, Kampala, Uganda'
      },
      logo: '/images/logos/UTB.png',
      established: '1994',
      priority: 'medium'
    },
    {
      id: 'ucc',
      name: 'Uganda Communications Commission',
      abbreviation: 'UCC',
      category: 'Communications',
      description: 'The national communications regulator responsible for licensing and regulating the communications sector.',
      services: ['Communications Licensing', 'Spectrum Management', 'Consumer Protection', 'Quality Assurance'],
      contact: {
        phone: '+256 414 339000',
        email: 'ucc@ucc.co.ug',
        website: 'https://www.ucc.co.ug',
        address: 'Plot 42-44 Spring Road, Bugolobi, P.O. Box 7376, Kampala, Uganda'
      },
      logo: '/images/logos/UCC logo.png',
      established: '1997',
      priority: 'medium'
    },
    {
      id: 'nema',
      name: 'National Environment Management Authority',
      abbreviation: 'NEMA',
      category: 'Environment',
      description: 'The national environmental authority responsible for environmental protection and management.',
      services: ['Environmental Impact Assessment', 'Environmental Monitoring', 'Environmental Licensing', 'Compliance Enforcement'],
      contact: {
        phone: '+256 414 251064',
        email: 'info@nema.go.ug',
        website: 'https://www.nema.go.ug',
        address: 'Plot 17/19/21 Jinja Road, NEMA House, P.O. Box 22255, Kampala, Uganda'
      },
      logo: '/images/logos/NEMA.png',
      established: '1995',
      priority: 'medium'
    }
  ]

  const categories = ['All', ...new Set(agencies.map(agency => agency.category))]

  const filteredAgencies = useMemo(() => {
    let filtered = agencies

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(agency => agency.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [agencies, selectedCategory, searchTerm])

  const handleCall = useCallback((e, contact) => {
    e.stopPropagation()
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_self')
      addNotification({
        type: 'info',
        title: 'Calling Agency',
        message: `Dialing ${contact.phone}`,
        duration: 3000
      })
    }
  }, [addNotification])

  const handleEmail = useCallback((e, contact) => {
    e.stopPropagation()
    if (contact.email) {
      const subject = encodeURIComponent('Service Inquiry - Uganda Government Agency')
      window.open(`mailto:${contact.email}?subject=${subject}`, '_blank')
      addNotification({
        type: 'info',
        title: 'Opening Email',
        message: `Composing email to ${contact.email}`,
        duration: 3000
      })
    }
  }, [addNotification])

  const handleWebsite = useCallback((e, contact) => {
    e.stopPropagation()
    if (contact.website) {
      window.open(contact.website, '_blank')
      addNotification({
        type: 'info',
        title: 'Opening Website',
        message: 'Visiting agency website',
        duration: 3000
      })
    }
  }, [addNotification])

  return (
    <section id="agencies" className="py-20 px-4 relative">
      {/* Uganda Government Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda government agencies and institutions" 
            className="w-full h-full object-cover opacity-6"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
        
        {/* Uganda National Symbols */}
        <div className="absolute top-10 left-10 opacity-20">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            className="w-24 h-24 object-contain"
          />
        </div>
        
        <div className="absolute top-10 right-10 opacity-25">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-28 h-20 object-cover rounded shadow-lg"
          />
        </div>
        
        {/* Uganda Flag Pattern Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-yellow-400 via-red-500 to-black opacity-40"></div>
        
        {/* National Unity Pattern */}
        <div className="absolute bottom-20 left-10 opacity-15">
          <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-black opacity-70"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/uganda-flag.png" 
              alt="Uganda flag" 
              className="w-8 h-6 object-cover mr-3 rounded shadow-md"
            />
            <span className="inline-block px-4 py-2 bg-blue-500/30 text-blue-200 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-400/30">
              🏛️ Republic of Uganda - Official Government Agencies Directory
            </span>
            <img 
              src="/images/uganda-coat-of-arms.png" 
              alt="Uganda Coat of Arms" 
              className="w-8 h-8 object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Uganda Government Agencies
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-300 text-3xl mt-2">
              "Unity, Work, Progress"
            </span>
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Official directory of Uganda's key government agencies, regulatory bodies, and institutions. 
            Find verified contact information, services, and direct access to UIA, URSB, URA, NSSF, BOU, UTB, UCC, NEMA and other essential agencies 
            serving the Pearl of Africa's business and investment community.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Browse Agencies</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {filteredAgencies.length} agencies found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                type="text"
                placeholder="Search agencies, services, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Agencies Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}`}>
          {filteredAgencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-400 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group ${
                viewMode === 'list' ? 'flex items-start p-6' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      agency.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {agency.category}
                    </div>
                    <LazyImage
                      src={agency.logo}
                      alt={agency.name}
                      className="w-12 h-12 object-contain bg-white rounded p-1"
                      fallbackSrc="/images/uganda-coat-of-arms.png"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {agency.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-2">{agency.abbreviation} • Est. {agency.established}</p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {agency.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agency.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {agency.services.length > 3 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          +{agency.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="mb-3 text-xs text-gray-500">
                      <p className="truncate">{agency.contact.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={(e) => handleCall(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Call Agency"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call
                      </button>
                      <button 
                        onClick={(e) => handleEmail(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </button>
                      <button 
                        onClick={(e) => handleWebsite(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
                        title="Visit Website"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                        </svg>
                        Visit
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-start space-x-6">
                  <LazyImage
                    src={agency.logo}
                    alt={agency.name}
                    className="w-16 h-16 object-contain bg-white rounded p-2 flex-shrink-0"
                    fallbackSrc="/images/uganda-coat-of-arms.png"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{agency.name}</h3>
                        <p className="text-sm text-gray-500">{agency.abbreviation} • {agency.category} • Est. {agency.established}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        agency.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {agency.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{agency.description}</p>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {agency.services.map((service, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleCall(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call
                      </button>
                      <button 
                        onClick={(e) => handleEmail(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </button>
                      <button 
                        onClick={(e) => handleWebsite(e, agency.contact)}
                        className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                        </svg>
                        Visit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredAgencies.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter</p>
          </div>
        )}

        {/* Quick Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Need Help Finding the Right Agency?</h3>
          <p className="text-lg mb-8 opacity-90">
            Our support team can help you identify the right government agency for your specific needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                const subject = encodeURIComponent('Agency Directory Assistance Request')
                const body = encodeURIComponent(`Dear OneStopCentre Uganda Team,

I need assistance in identifying the right government agency for my needs:

1. Type of service required: [Please specify]
2. Business/Investment sector: [Please specify]
3. Specific requirements: [Please describe]
4. Preferred contact method: [Phone/Email/In-person]

Please provide guidance on which agency I should contact and any additional requirements.

Thank you for your assistance.

Best regards,
[Your Name]`)
                
                window.open(`mailto:info@onestopcentre.go.ug?subject=${subject}&body=${body}`, '_blank')
              }}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Agency Guidance
            </button>
            <button 
              onClick={() => {
                window.open('tel:+256414301000', '_self')
              }}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Call Support: +256 414 301000
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AgencyDirectory