import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const BusinessRegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessData, setBusinessData] = useState({
    // Step 1: Business Type
    businessType: '',
    businessStructure: '',
    
    // Step 2: Business Details
    businessName: '',
    businessDescription: '',
    sector: '',
    location: '',
    
    // Step 3: Ownership
    owners: [{ name: '', nationality: '', idNumber: '', percentage: '' }],
    
    // Step 4: Financial Information
    initialCapital: '',
    projectedTurnover: '',
    
    // Step 5: Registration Requirements
    requirements: [],
    estimatedCost: 0,
    timeframe: ''
  })
  
  const { addNotification } = useNotification()

  const businessTypes = [
    { value: 'sole-proprietorship', label: 'Sole Proprietorship', description: 'Individual business ownership' },
    { value: 'partnership', label: 'Partnership', description: 'Two or more partners' },
    { value: 'limited-company', label: 'Limited Company', description: 'Separate legal entity' },
    { value: 'ngo', label: 'NGO/Foundation', description: 'Non-profit organization' },
    { value: 'cooperative', label: 'Cooperative', description: 'Member-owned organization' }
  ]

  const businessStructures = {
    'sole-proprietorship': [
      { value: 'individual', label: 'Individual Business' }
    ],
    'partnership': [
      { value: 'general', label: 'General Partnership' },
      { value: 'limited', label: 'Limited Partnership' }
    ],
    'limited-company': [
      { value: 'private', label: 'Private Limited Company' },
      { value: 'public', label: 'Public Limited Company' },
      { value: 'guarantee', label: 'Company Limited by Guarantee' }
    ],
    'ngo': [
      { value: 'ngo', label: 'Non-Governmental Organization' },
      { value: 'foundation', label: 'Foundation' },
      { value: 'trust', label: 'Trust' }
    ],
    'cooperative': [
      { value: 'primary', label: 'Primary Cooperative' },
      { value: 'secondary', label: 'Secondary Cooperative' }
    ]
  }

  const sectors = [
    'Agriculture & Agribusiness',
    'Tourism & Hospitality',
    'Manufacturing',
    'ICT & Digital Services',
    'Mining & Minerals',
    'Energy & Utilities',
    'Healthcare',
    'Education',
    'Trade & Commerce',
    'Financial Services',
    'Transport & Logistics',
    'Construction & Real Estate',
    'Other'
  ]

  const locations = [
    'Kampala',
    'Entebbe',
    'Jinja',
    'Mbale',
    'Gulu',
    'Mbarara',
    'Fort Portal',
    'Masaka',
    'Soroti',
    'Arua',
    'Other'
  ]

  const handleInputChange = (field, value, index = null) => {
    if (field === 'owners' && index !== null) {
      const newOwners = [...businessData.owners]
      newOwners[index] = { ...newOwners[index], ...value }
      setBusinessData(prev => ({ ...prev, owners: newOwners }))
    } else {
      setBusinessData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addOwner = () => {
    setBusinessData(prev => ({
      ...prev,
      owners: [...prev.owners, { name: '', nationality: '', idNumber: '', percentage: '' }]
    }))
  }

  const removeOwner = (index) => {
    if (businessData.owners.length > 1) {
      setBusinessData(prev => ({
        ...prev,
        owners: prev.owners.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateRequirements = () => {
    const requirements = []
    let cost = 0
    let timeframe = ''

    // Base requirements based on business type
    if (businessData.businessType === 'sole-proprietorship') {
      requirements.push(
        { item: 'Business License', cost: 150000, authority: 'KCCA/Local Council' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'Trading License', cost: 100000, authority: 'Local Government' }
      )
      timeframe = '5-7 business days'
    } else if (businessData.businessType === 'partnership') {
      requirements.push(
        { item: 'Partnership Agreement', cost: 200000, authority: 'Legal Practitioner' },
        { item: 'Business License', cost: 150000, authority: 'KCCA/Local Council' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'Partnership Registration', cost: 50000, authority: 'URSB' }
      )
      timeframe = '7-10 business days'
    } else if (businessData.businessType === 'limited-company') {
      requirements.push(
        { item: 'Company Registration', cost: 250000, authority: 'URSB' },
        { item: 'Memorandum & Articles', cost: 300000, authority: 'Legal Practitioner' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'VAT Registration', cost: 0, authority: 'URA (if required)' },
        { item: 'NSSF Registration', cost: 0, authority: 'NSSF' },
        { item: 'Workers Compensation', cost: 100000, authority: 'Insurance Company' }
      )
      timeframe = '10-14 business days'
    } else if (businessData.businessType === 'ngo') {
      requirements.push(
        { item: 'NGO Registration', cost: 200000, authority: 'NGO Bureau' },
        { item: 'Tax Exemption Certificate', cost: 50000, authority: 'URA' },
        { item: 'Constitution/Articles', cost: 150000, authority: 'Legal Practitioner' }
      )
      timeframe = '14-21 business days'
    } else if (businessData.businessType === 'cooperative') {
      requirements.push(
        { item: 'Cooperative Registration', cost: 100000, authority: 'Ministry of Trade' },
        { item: 'Bylaws Preparation', cost: 150000, authority: 'Legal Practitioner' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' }
      )
      timeframe = '7-14 business days'
    }

    // Add sector-specific requirements
    if (businessData.sector === 'Financial Services') {
      requirements.push(
        { item: 'Financial Institution License', cost: 5000000, authority: 'Bank of Uganda' }
      )
    } else if (businessData.sector === 'Healthcare') {
      requirements.push(
        { item: 'Health Facility License', cost: 500000, authority: 'Ministry of Health' }
      )
    } else if (businessData.sector === 'Education') {
      requirements.push(
        { item: 'Education License', cost: 300000, authority: 'Ministry of Education' }
      )
    }

    // Add location-specific requirements
    if (businessData.location === 'Kampala') {
      requirements.push(
        { item: 'KCCA Business Permit', cost: 200000, authority: 'KCCA' }
      )
    }

    cost = requirements.reduce((total, req) => total + req.cost, 0)

    setBusinessData(prev => ({
      ...prev,
      requirements,
      estimatedCost: cost,
      timeframe
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 4) {
        calculateRequirements()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRegistrationGuide = () => {

    const guideHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Registration Guide - ${businessData.businessName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fbbf24, #dc2626); color: white; padding: 30px; border-radius: 12px; text-align: center; }
        .section { background: white; margin: 20px 0; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .requirement { display: flex; justify-content: space-between; padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #fbbf24; }
        .cost { color: #dc2626; font-weight: bold; }
        .total { background: #e8f5e8; padding: 20px; border-radius: 8px; border: 2px solid #10b981; }
        .step { background: #fffbeb; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🇺🇬 Business Registration Guide</h1>
        <h2>${businessData.businessName}</h2>
        <p>${businessTypes.find(t => t.value === businessData.businessType)?.label}</p>
    </div>
    
    <div class="section">
        <h3>📋 Registration Requirements</h3>
        ${businessData.requirements.map(req => `
            <div class="requirement">
                <div>
                    <strong>${req.item}</strong><br>
                    <small>Authority: ${req.authority}</small>
                </div>
                <div class="cost">UGX ${req.cost.toLocaleString()}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="total">
        <h3>💰 Total Estimated Cost: UGX ${businessData.estimatedCost.toLocaleString()}</h3>
        <p><strong>⏱️ Expected Timeframe:</strong> ${businessData.timeframe}</p>
    </div>
    
    <div class="section">
        <h3>📚 Step-by-Step Process</h3>
        <div class="step">
            <strong>Step 1:</strong> Prepare required documents (ID copies, passport photos, business plan)
        </div>
        <div class="step">
            <strong>Step 2:</strong> Visit URSB offices or use online registration portal
        </div>
        <div class="step">
            <strong>Step 3:</strong> Submit application with required fees
        </div>
        <div class="step">
            <strong>Step 4:</strong> Wait for processing and approval
        </div>
        <div class="step">
            <strong>Step 5:</strong> Collect certificates and complete post-registration requirements
        </div>
    </div>
    
    <div class="section">
        <h3>📞 Contact Information</h3>
        <p><strong>OneStopCentre Uganda:</strong> +256 775 692 335</p>
        <p><strong>Email:</strong> support@onestopcentre.ug</p>
        <p><strong>URSB:</strong> +256 414 333 200</p>
        <p><strong>URA:</strong> +256 417 117 000</p>
    </div>
    
    <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
        Generated by OneStopCentre Uganda | ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`

    const blob = new Blob([guideHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${businessData.businessName.replace(/\s+/g, '_')}_Registration_Guide.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: 'Registration Guide Generated',
      message: `Complete business registration guide for ${businessData.businessName} has been downloaded`,
      duration: 5000
    })
  }

  const steps = [
    { number: 1, title: 'Business Type', description: 'Choose your business structure' },
    { number: 2, title: 'Business Details', description: 'Provide business information' },
    { number: 3, title: 'Ownership', description: 'Define ownership structure' },
    { number: 4, title: 'Financial Info', description: 'Capital and projections' },
    { number: 5, title: 'Registration Plan', description: 'Requirements and costs' }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Business Type *
              </label>
              <div className="grid grid-cols-1 gap-4">
                {businessTypes.map(type => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      businessData.businessType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => handleInputChange('businessType', type.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="businessType"
                        value={type.value}
                        checked={businessData.businessType === type.value}
                        onChange={() => handleInputChange('businessType', type.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-3 block">
                        <span className="text-lg font-medium text-gray-900">{type.label}</span>
                        <span className="block text-sm text-gray-600">{type.description}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {businessData.businessType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Structure *
                </label>
                <select
                  value={businessData.businessStructure}
                  onChange={(e) => handleInputChange('businessStructure', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select structure</option>
                  {businessStructures[businessData.businessType]?.map(structure => (
                    <option key={structure.value} value={structure.value}>
                      {structure.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={businessData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                value={businessData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your business activities"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Sector *
              </label>
              <select
                value={businessData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select sector</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Location *
              </label>
              <select
                value={businessData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select location</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Business Owners/Directors</h4>
              <button
                onClick={addOwner}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Owner
              </button>
            </div>

            {businessData.owners.map((owner, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium text-gray-900">Owner {index + 1}</h5>
                  {businessData.owners.length > 1 && (
                    <button
                      onClick={() => removeOwner(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={owner.name}
                      onChange={(e) => handleInputChange('owners', { name: e.target.value }, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      value={owner.nationality}
                      onChange={(e) => handleInputChange('owners', { nationality: e.target.value }, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Ugandan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID/Passport Number *
                    </label>
                    <input
                      type="text"
                      value={owner.idNumber}
                      onChange={(e) => handleInputChange('owners', { idNumber: e.target.value }, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ID or passport number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={owner.percentage}
                      onChange={(e) => handleInputChange('owners', { percentage: e.target.value }, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Capital (UGX) *
              </label>
              <input
                type="number"
                value={businessData.initialCapital}
                onChange={(e) => handleInputChange('initialCapital', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 10,000,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projected Annual Turnover (UGX)
              </label>
              <input
                type="number"
                value={businessData.projectedTurnover}
                onChange={(e) => handleInputChange('projectedTurnover', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 50,000,000"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💡 Financial Planning Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consider all startup costs including registration, equipment, and working capital</li>
                <li>• Be realistic about projected turnover - banks may require business plans</li>
                <li>• Keep some capital reserved for unexpected expenses</li>
                <li>• Consider tax implications of your chosen business structure</li>
              </ul>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-xl font-semibold text-green-800 mb-4">
                📋 Registration Requirements Summary
              </h4>
              
              <div className="space-y-4">
                {businessData.requirements.map((req, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-900">{req.item}</div>
                      <div className="text-sm text-gray-600">Authority: {req.authority}</div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      UGX {req.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-100 rounded-lg border-2 border-green-300">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-800">Total Estimated Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    UGX {businessData.estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-medium text-green-800">Expected Timeframe:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {businessData.timeframe}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📚 Next Steps</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Download your personalized registration guide</li>
                <li>Gather all required documents</li>
                <li>Prepare the registration fees</li>
                <li>Visit the relevant authorities or use online portals</li>
                <li>Follow up on your application status</li>
              </ol>
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateRegistrationGuide}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center"
              >
                <span className="mr-2">📄</span>
                Download Registration Guide
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section id="registration-wizard" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Business Registration Wizard
          </h2>
          <p className="text-xl text-gray-600">
            Step-by-step guide to register your business in Uganda
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.number
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-600">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute w-full h-0.5 bg-gray-300 top-5 left-1/2 transform -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Step {currentStep}: {steps[currentStep - 1].title}
              </h3>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Previous
            </button>

            {currentStep < 5 && (
              <button
                onClick={nextStep}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BusinessRegistrationWizard