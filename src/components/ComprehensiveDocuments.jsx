import React, { useState } from 'react'
import { motion } from 'framer-motion'

const ComprehensiveDocuments = () => {
  const [activeProcess, setActiveProcess] = useState(null)

  const businessRegistrationServices = [
    {
      id: 'company-registration',
      title: 'Company Registration',
      agency: 'URSB',
      description: 'Complete company registration process with Uganda Registration Services Bureau',
      duration: '5-7 business days',
      requirements: [
        'Company name reservation',
        'Memorandum and Articles of Association',
        'Directors\' identification documents',
        'Proof of registered office address',
        'Registration fees payment'
      ],
      process: [
        'Name search and reservation at URSB',
        'Prepare incorporation documents',
        'Submit application with required documents',
        'Pay registration fees',
        'Receive Certificate of Incorporation'
      ],
      fees: 'UGX 250,000 - 500,000',
      icon: '🏢',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'tax-registration',
      title: 'Tax Registration (TIN)',
      agency: 'URA',
      description: 'Tax Identification Number registration with Uganda Revenue Authority',
      duration: '1-2 business days',
      requirements: [
        'Certificate of Incorporation',
        'Business license',
        'Directors\' identification',
        'Proof of business address',
        'Bank account details'
      ],
      process: [
        'Complete TIN application form',
        'Submit required documents',
        'URA verification process',
        'Receive Tax Identification Number',
        'Set up tax obligations'
      ],
      fees: 'Free of charge',
      icon: '🔢',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'business-license',
      title: 'Trading License',
      agency: 'Local Authority',
      description: 'Business operating license from local government authorities',
      duration: '3-5 business days',
      requirements: [
        'Certificate of Incorporation',
        'Lease agreement or ownership documents',
        'Tax clearance certificate',
        'Health inspection certificate',
        'Fire safety clearance'
      ],
      process: [
        'Visit local authority offices',
        'Complete license application',
        'Property inspection',
        'Pay license fees',
        'Receive trading license'
      ],
      fees: 'UGX 50,000 - 200,000',
      icon: '📄',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'nssf-registration',
      title: 'NSSF Registration',
      agency: 'NSSF',
      description: 'Employer registration with National Social Security Fund',
      duration: '2-3 business days',
      requirements: [
        'Certificate of Incorporation',
        'Trading license',
        'TIN certificate',
        'List of employees',
        'Employer registration form'
      ],
      process: [
        'Complete employer registration form',
        'Submit required documents',
        'NSSF verification',
        'Receive employer number',
        'Begin monthly contributions'
      ],
      fees: 'Free registration',
      icon: '🏛️',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'investment-license',
      title: 'Investment License',
      agency: 'UIA',
      description: 'Foreign investment registration and licensing with Uganda Investment Authority',
      duration: '7-14 business days',
      requirements: [
        'Investment application form',
        'Business plan and feasibility study',
        'Proof of capital investment',
        'Environmental impact assessment',
        'Company incorporation documents'
      ],
      process: [
        'Submit investment application',
        'Technical evaluation by UIA',
        'Site inspection if required',
        'Investment committee approval',
        'Receive investment license'
      ],
      fees: 'USD 100 - 500',
      icon: '💰',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'work-permits',
      title: 'Work Permits',
      agency: 'Ministry of Internal Affairs',
      description: 'Work permit processing for foreign employees',
      duration: '14-21 business days',
      requirements: [
        'Work permit application form',
        'Employment contract',
        'Academic and professional qualifications',
        'Medical examination report',
        'Police clearance certificate'
      ],
      process: [
        'Submit work permit application',
        'Document verification',
        'Security clearance',
        'Ministry approval',
        'Work permit issuance'
      ],
      fees: 'USD 200 - 1,500',
      icon: '🆔',
      color: 'from-teal-500 to-green-600'
    }
  ]

  return (
    <section id="streamlined-services" className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto">
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
            <span className="inline-block px-4 py-2 bg-green-500/20 text-green-700 rounded-full text-sm font-medium backdrop-blur-sm border border-green-400/30">
              🏛️ Republic of Uganda - Official Business Services
            </span>
            <img 
              src="/images/uganda-coat-of-arms.png" 
              alt="Uganda Coat of Arms" 
              className="w-8 h-8 object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            OSC Services Streamlined
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Complete end-to-end business registration and licensing services. We streamline the entire process 
            across URSB, URA, NSSF, UIA, and other government agencies for seamless business setup in Uganda.
          </p>
        </motion.div>

        {/* Service Process Overview */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Complete Business Registration Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Preparation</h4>
              <p className="text-sm text-gray-600">Document preparation and name reservation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Registration</h4>
              <p className="text-sm text-gray-600">Streamlined processing across all agencies</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Completion</h4>
              <p className="text-sm text-gray-600">Ready-to-operate business with all licenses</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessRegistrationServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setActiveProcess(activeProcess === service.id ? null : service.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {service.icon}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {service.agency}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration}
                  </span>
                  <span className="font-medium text-green-600">{service.fees}</span>
                </div>

                {activeProcess === service.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-4 mt-4"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {service.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {service.process.map((step, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2 font-medium">{idx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}

                <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  {activeProcess === service.id ? 'Hide Details' : 'View Process Details'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Need Help with Business Registration?</h3>
          <p className="text-lg mb-8 opacity-90">
            Our streamlined services make business registration fast, efficient, and hassle-free. 
            Get expert guidance through every step of the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/downloads"
              className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Forms
            </a>
            <a
              href="tel:+256775692335"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg font-semibold transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Get Support
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ComprehensiveDocuments