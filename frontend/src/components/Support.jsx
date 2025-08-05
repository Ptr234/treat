import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const Support = () => {
  const [showQueryForm, setShowQueryForm] = useState(false)
  const [queries, setQueries] = useState([])
  const [selectedQueryType, setSelectedQueryType] = useState('')
  const [selectedAgency, setSelectedAgency] = useState('')
  const { addNotification } = useNotification()

  const supportChannels = [
    {
      title: 'Submit Query',
      description: 'Submit your questions through our query system',
      contact: 'Track your queries online',
      hours: 'Available 24/7',
      icon: '📝',
      action: () => setShowQueryForm(true)
    },
    {
      title: 'Phone Support',
      description: 'Call our support line for immediate assistance',
      contact: '+256 775 692 335',
      hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
      icon: '📞',
      action: () => window.open('tel:+256775692335', '_self')
    },
    {
      title: 'Email Support',
      description: 'Send us your questions via email',
      contact: 'support@onestopcentre.ug',
      hours: 'Response within 24 hours',
      icon: '✉️',
      action: () => window.open('mailto:support@onestopcentre.ug?subject=Support Request - OneStopCentre Uganda', '_blank')
    },
    {
      title: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp for quick responses',
      contact: '+256 775 692 335',
      hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
      icon: '💬',
      action: () => window.open('https://wa.me/256775692335?text=Hello, I need assistance with OneStopCentre Uganda services.', '_blank')
    }
  ]

  const queryTypes = [
    'Investment Inquiry',
    'Business Registration',
    'Tax Registration',
    'Licensing & Permits',
    'NSSF Registration',
    'Document Verification',
    'Application Status',
    'Technical Support',
    'General Inquiry'
  ]

  const agencies = [
    'Uganda Investment Authority (UIA)',
    'Uganda Revenue Authority (URA)',
    'Uganda Registration Services Bureau (URSB)',
    'National Social Security Fund (NSSF)',
    'Bank of Uganda (BOU)',
    'Uganda Tourism Board (UTB)',
    'Uganda Communications Commission (UCC)',
    'National Environment Management Authority (NEMA)',
    'General Inquiry'
  ]

  const handleSubmitQuery = useCallback((queryData) => {
    const newQuery = {
      id: Date.now(),
      ...queryData,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      assignedTo: queryData.agency || 'General Support'
    }
    
    setQueries(prev => [...prev, newQuery])
    
    addNotification({
      type: 'success',
      title: 'Query Submitted Successfully',
      message: `Your query has been submitted with ID: ${newQuery.id}. You will receive updates via email.`,
      duration: 5000
    })
    
    return newQuery
  }, [addNotification])

  return (
    <section id="support" className="py-20 px-4 relative">
      {/* Uganda Government Support Buildings Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda government support buildings and service centers" 
            className="w-full h-full object-cover opacity-8"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-purple-100/90 to-blue-50/95"></div>
        
        {/* Uganda Flag Pattern */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-yellow-400 via-red-500 to-black opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-yellow-400 via-red-500 to-black opacity-50"></div>
        
        {/* National Support Symbols */}
        <div className="absolute top-10 left-10 opacity-20">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            className="w-20 h-20 object-contain"
          />
        </div>
        
        <div className="absolute top-10 right-10 opacity-25">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-24 h-16 object-cover rounded shadow-lg"
          />
        </div>
        
        {/* Patriotic Support Pattern */}
        <div className="absolute bottom-20 right-10 opacity-15">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-red-500 to-black rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/uganda-flag.png" 
              alt="Uganda flag" 
              className="w-8 h-6 object-cover mr-3 rounded shadow-md"
            />
            <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-700 rounded-full text-sm font-medium border border-blue-300/30">
              🛟 Official Uganda Government Support Services
            </span>
            <img 
              src="/images/uganda-coat-of-arms.png" 
              alt="Uganda Coat of Arms" 
              className="w-8 h-8 object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Uganda Government Support &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Query Management System
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Official support portal for Uganda's investment and business services. Get expert assistance from UIA, URSB, URA, and other government agencies. 
            Submit queries, track progress, and receive personalized support from our dedicated team serving the Pearl of Africa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all cursor-pointer group"
              onClick={channel.action}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{channel.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {channel.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {channel.description}
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-blue-600 text-sm">{channel.contact}</p>
                <p className="text-xs text-gray-500">{channel.hours}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Query Submission Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Submit Query
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const queryData = Object.fromEntries(formData.entries())
              
              const newQuery = {
                id: Date.now(),
                ...queryData,
                status: 'Submitted',
                submittedAt: new Date().toISOString(),
                assignedTo: queryData.agency || 'General Support'
              }
              
              setQueries(prev => [...prev, newQuery])
              
              addNotification({
                type: 'success',
                title: 'Query Submitted',
                message: `Your query has been submitted with ID: ${newQuery.id}`,
                duration: 5000
              })
              
              e.target.reset()
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Type *</label>
                  <select
                    name="queryType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select query type</option>
                    {queryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related Agency</label>
                  <select
                    name="agency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select agency (optional)</option>
                    {agencies.map(agency => (
                      <option key={agency} value={agency}>{agency}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Query Details *</label>
                  <textarea
                    name="details"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please provide detailed information about your query..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Submit Query
                </button>
              </div>
            </form>
          </motion.div>

          {/* Query Tracking */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Track Your Queries
            </h3>
            
            {queries.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {queries.map((query) => (
                  <div key={query.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">Query #{query.id}</h4>
                        <p className="text-xs text-gray-500">{new Date(query.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        query.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                        query.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        query.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {query.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Type:</strong> {query.queryType}</p>
                    {query.agency && (
                      <p className="text-sm text-gray-600 mb-2"><strong>Agency:</strong> {query.agency}</p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2">{query.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-sm mb-2">No queries submitted yet</p>
                <p className="text-xs text-gray-400">Submit a query to track its progress here</p>
              </div>
            )}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How long does company registration take?
                </h4>
                <p className="text-gray-600 text-sm">
                  Company registration typically takes 7 working days through URSB. 
                  Online applications may be processed faster.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What documents do I need for TIN registration?
                </h4>
                <p className="text-gray-600 text-sm">
                  You need a valid National ID or passport, business registration 
                  certificate (for businesses), and proof of address.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can foreign investors start a business in Uganda?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes, foreign investors can start businesses in Uganda. 
                  The minimum investment requirement is USD 250,000 for most sectors.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  How do I track my application status?
                </h4>
                <p className="text-gray-600 text-sm">
                  Most agencies provide online tracking systems. You can also 
                  contact the specific agency or use our support channels.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Need immediate help?</h4>
              <p className="text-blue-800 text-sm mb-3">
                For urgent matters, use our priority contact channels:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => window.open('tel:+256775692335', '_self')}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📞 Call Now
                </button>
                <button
                  onClick={() => window.open('https://wa.me/256775692335?text=Urgent: I need immediate assistance with OneStopCentre Uganda services.', '_blank')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Support Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Our Support Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-90">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">&lt; 2hrs</div>
              <div className="text-sm opacity-90">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">Query Submission</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-sm opacity-90">Queries Resolved Monthly</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Support