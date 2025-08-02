import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const InvestmentOnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [investmentData, setInvestmentData] = useState({
    // Step 1: Investment Profile
    investorType: '', // individual, institutional, foreign
    experience: '', // beginner, intermediate, advanced
    investmentGoal: '', // growth, income, diversification, strategic
    
    // Step 2: Investment Capacity
    investmentAmount: '',
    timeHorizon: '', // short-term, medium-term, long-term
    riskTolerance: '', // conservative, moderate, aggressive
    
    // Step 3: Sector Interest
    primarySector: '', // agriculture, tourism, minerals, ict, manufacturing, energy
    secondarySectors: [],
    specificInterests: '',
    
    // Step 4: Personal/Entity Details
    name: '',
    email: '',
    phone: '',
    nationality: '',
    companyName: '',
    position: '',
    
    // Step 5: Investment Readiness
    capitalSource: '', // savings, loan, partnership, grant
    timeframe: '', // immediate, 3-months, 6-months, 1-year
    supportNeeded: [] // legal, financial, technical, marketing
  })

  const { showNotification } = useNotification()

  const totalSteps = 5

  const updateData = (field, value) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateArrayField = (field, value) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return investmentData.investorType && investmentData.experience && investmentData.investmentGoal
      case 2:
        return investmentData.investmentAmount && investmentData.timeHorizon && investmentData.riskTolerance
      case 3:
        return investmentData.primarySector
      case 4:
        return investmentData.name && investmentData.email && investmentData.phone && investmentData.nationality
      case 5:
        return investmentData.capitalSource && investmentData.timeframe
      default:
        return true
    }
  }

  const submitApplication = async () => {
    try {
      // In a real application, this would send data to a backend service
      console.log('Investment Application Data:', investmentData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showNotification('Investment application submitted successfully! Our team will contact you within 24 hours.', 'success')
      
      // Generate consultation email
      const subject = encodeURIComponent('Investment Consultation Request - OneStopCentre Uganda')
      const body = encodeURIComponent(`Dear OneStopCentre Uganda Investment Team,

I have completed the investment onboarding wizard and would like to schedule a consultation.

Investment Profile:
- Investor Type: ${investmentData.investorType}
- Experience Level: ${investmentData.experience}
- Investment Goal: ${investmentData.investmentGoal}
- Investment Amount: USD ${investmentData.investmentAmount}
- Time Horizon: ${investmentData.timeHorizon}
- Risk Tolerance: ${investmentData.riskTolerance}
- Primary Sector Interest: ${investmentData.primarySector}

Contact Information:
- Name: ${investmentData.name}
- Email: ${investmentData.email}
- Phone: ${investmentData.phone}
- Nationality: ${investmentData.nationality}
${investmentData.companyName ? `- Company: ${investmentData.companyName}` : ''}

Investment Readiness:
- Capital Source: ${investmentData.capitalSource}
- Investment Timeframe: ${investmentData.timeframe}
- Support Needed: ${investmentData.supportNeeded.join(', ')}

Please contact me to discuss investment opportunities in Uganda.

Best regards,
${investmentData.name}`)

      // Open email client
      window.location.href = `mailto:invest@onestopcentre.ug?subject=${subject}&body=${body}`
      
    } catch (error) {
      showNotification('Failed to submit application. Please try again.', 'error')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of investor are you?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'individual', label: 'Individual Investor', icon: '👤' },
                  { value: 'institutional', label: 'Institutional Investor', icon: '🏦' },
                  { value: 'foreign', label: 'Foreign Investor', icon: '🌍' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('investorType', option.value)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      investmentData.investorType === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Experience Level
              </label>
              <select
                value={investmentData.experience}
                onChange={(e) => updateData('experience', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select your experience level</option>
                <option value="beginner">Beginner - New to investing</option>
                <option value="intermediate">Intermediate - Some investment experience</option>
                <option value="advanced">Advanced - Experienced investor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Investment Goal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'growth', label: 'Capital Growth', desc: 'Long-term appreciation' },
                  { value: 'income', label: 'Regular Income', desc: 'Dividends and returns' },
                  { value: 'diversification', label: 'Portfolio Diversification', desc: 'Risk management' },
                  { value: 'strategic', label: 'Strategic Investment', desc: 'Market expansion' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('investmentGoal', option.value)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      investmentData.investmentGoal === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Capacity</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USD)
              </label>
              <select
                value={investmentData.investmentAmount}
                onChange={(e) => updateData('investmentAmount', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select investment range</option>
                <option value="10000-50000">$10,000 - $50,000</option>
                <option value="50000-100000">$50,000 - $100,000</option>
                <option value="100000-500000">$100,000 - $500,000</option>
                <option value="500000-1000000">$500,000 - $1,000,000</option>
                <option value="1000000+">$1,000,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Time Horizon
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'short-term', label: 'Short-term', desc: '1-3 years', icon: '📈' },
                  { value: 'medium-term', label: 'Medium-term', desc: '3-7 years', icon: '📊' },
                  { value: 'long-term', label: 'Long-term', desc: '7+ years', icon: '🚀' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('timeHorizon', option.value)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      investmentData.timeHorizon === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Tolerance
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'conservative', label: 'Conservative', desc: 'Low risk, stable returns', color: 'green' },
                  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk-return', color: 'yellow' },
                  { value: 'aggressive', label: 'Aggressive', desc: 'High risk, high potential', color: 'red' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('riskTolerance', option.value)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      investmentData.riskTolerance === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Sector Interests</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Sector of Interest
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'agriculture', label: 'Agriculture & Agribusiness', icon: '🌾', desc: 'Food production, processing, livestock' },
                  { value: 'tourism', label: 'Tourism & Hospitality', icon: '🏨', desc: 'Hotels, eco-tourism, cultural sites' },
                  { value: 'minerals', label: 'Mining & Minerals', icon: '⛏️', desc: 'Gold, copper, rare earth minerals' },
                  { value: 'ict', label: 'ICT & Technology', icon: '💻', desc: 'Software, fintech, telecommunications' },
                  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭', desc: 'Textiles, pharmaceuticals, consumer goods' },
                  { value: 'energy', label: 'Energy & Infrastructure', icon: '⚡', desc: 'Solar, hydro, oil & gas, transport' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('primarySector', option.value)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      investmentData.primarySector === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div>
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Sectors of Interest (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Agriculture', 'Tourism', 'Minerals', 'ICT', 'Manufacturing', 'Energy', 
                  'Healthcare', 'Education', 'Financial Services', 'Real Estate', 'Transport', 'Retail'
                ].map(sector => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => updateArrayField('secondarySectors', sector)}
                    className={`p-2 text-sm border rounded-lg transition-all ${
                      investmentData.secondarySectors.includes(sector)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Investment Interests (Optional)
              </label>
              <textarea
                value={investmentData.specificInterests}
                onChange={(e) => updateData('specificInterests', e.target.value)}
                placeholder="Describe any specific investment opportunities, regions, or business models you're interested in..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={investmentData.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={investmentData.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={investmentData.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="+256 XXX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <select
                  value={investmentData.nationality}
                  onChange={(e) => updateData('nationality', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select nationality</option>
                  <option value="Ugandan">Ugandan</option>
                  <option value="Kenyan">Kenyan</option>
                  <option value="Tanzanian">Tanzanian</option>
                  <option value="Rwandan">Rwandan</option>
                  <option value="South African">South African</option>
                  <option value="Nigerian">Nigerian</option>
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {investmentData.investorType === 'institutional' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization Name
                    </label>
                    <input
                      type="text"
                      value={investmentData.companyName}
                      onChange={(e) => updateData('companyName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position/Title
                    </label>
                    <input
                      type="text"
                      value={investmentData.position}
                      onChange={(e) => updateData('position', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Your position"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Readiness</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source of Investment Capital
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'savings', label: 'Personal/Corporate Savings', icon: '🏦' },
                  { value: 'loan', label: 'Bank Loan/Credit Facility', icon: '💳' },
                  { value: 'partnership', label: 'Partnership/Joint Venture', icon: '🤝' },
                  { value: 'grant', label: 'Grant/Development Funding', icon: '🎁' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateData('capitalSource', option.value)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      investmentData.capitalSource === option.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div className="font-semibold">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Timeframe
              </label>
              <select
                value={investmentData.timeframe}
                onChange={(e) => updateData('timeframe', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">When are you ready to invest?</option>
                <option value="immediate">Immediately (within 1 month)</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="1-year">Within 1 year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Services Needed
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'legal', label: 'Legal & Regulatory Support', icon: '⚖️' },
                  { value: 'financial', label: 'Financial Planning & Analysis', icon: '📊' },
                  { value: 'technical', label: 'Technical Due Diligence', icon: '🔧' },
                  { value: 'marketing', label: 'Market Research & Strategy', icon: '📈' },
                  { value: 'licensing', label: 'Licensing & Permits', icon: '📋' },
                  { value: 'partnerships', label: 'Local Partnership Facilitation', icon: '🤝' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateArrayField('supportNeeded', option.value)}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${
                      investmentData.supportNeeded.includes(option.value)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-xl mr-3">{option.icon}</div>
                      <div className="font-medium text-sm">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 text-xl mr-3">💡</div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">What happens next?</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Our investment specialists will review your application</li>
                    <li>• You'll receive a consultation call within 24 hours</li>
                    <li>• We'll provide personalized investment opportunities</li>
                    <li>• Full support throughout your investment journey</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="bg-white p-3 rounded-full shadow-lg mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Onboarding</h1>
          </motion.div>
          <p className="text-gray-600">Let's find the perfect investment opportunity for you in Uganda</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStep}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep === totalSteps ? (
              <motion.button
                onClick={submitApplication}
                disabled={!validateCurrentStep()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  validateCurrentStep()
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Application
              </motion.button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  validateCurrentStep()
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next Step
              </button>
            )}
          </div>
        </motion.div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need assistance?</p>
          <div className="flex justify-center space-x-4">
            <a href="tel:+256775692335" className="text-red-600 hover:text-red-700 font-medium">
              📞 +256 775 692 335
            </a>
            <a href="mailto:invest@onestopcentre.ug" className="text-red-600 hover:text-red-700 font-medium">
              ✉️ invest@onestopcentre.ug
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentOnboardingWizard