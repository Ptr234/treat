import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const InvestorTour = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const investmentSteps = [
    {
      id: 1,
      title: "Welcome to Uganda Investment Authority",
      subtitle: "Your Premium Investment Journey Starts Here",
      description: "Uganda offers Africa's most investor-friendly environment with 97% fast-track approval rates, 10-year tax holidays, and direct government support.",
      visual: "🇺🇬",
      keyPoints: [
        "FDI grew 79.2% to $2.9B in 2023",
        "GDP growth 6.5% projected for 2024/25",
        "15-35% ROI potential across sectors",
        "Presidential committee access for $5M+ investments"
      ],
      action: "Start Your Investment Assessment",
      nextStep: "Let's determine your investor profile"
    },
    {
      id: 2,
      title: "Investment Profile Assessment",
      subtitle: "Choose Your Investment Tier",
      description: "Select your investment level to unlock tier-specific benefits and fast-track services.",
      visual: "💎",
      profiles: [
        {
          tier: "Major Investor",
          amount: "$5M+",
          icon: "🏦",
          color: "from-purple-600 to-indigo-700",
          benefits: ["Presidential Committee Access", "15-day Guaranteed Approval", "Single Window Clearance", "Dedicated Task Force"],
          successRate: "97%"
        },
        {
          tier: "Premium Investor", 
          amount: "$1M+",
          icon: "💎",
          color: "from-green-600 to-emerald-700",
          benefits: ["Dedicated Investment Officer", "Ministerial Liaison", "Fast-track Processing", "Monthly Reviews"],
          successRate: "95%"
        },
        {
          tier: "Strategic Investor",
          amount: "$100K - $1M",
          icon: "🚀",
          color: "from-blue-600 to-cyan-700",
          benefits: ["Investment License Support", "Tax Incentive Access", "Business Facilitation", "Growth Support"],
          successRate: "88%"
        },
        {
          tier: "Emerging Investor",
          amount: "$50K+",
          icon: "🌟",
          color: "from-orange-600 to-red-700",
          benefits: ["Sector Analysis", "Partnership Matching", "Market Entry Guidance", "Advisory Services"],
          successRate: "84%"
        }
      ],
      action: "Select Your Investment Tier",
      nextStep: "Choose your preferred sectors"
    },
    {
      id: 3,
      title: "Sector Selection & Opportunities",
      subtitle: "High-ROI Investment Sectors",
      description: "Uganda's ATMS priority sectors offer exclusive tax incentives and government support.",
      visual: "🎯",
      sectors: [
        {
          name: "Agriculture & Agribusiness",
          roi: "25-35%",
          icon: "🌾",
          opportunities: "Export crops, processing, livestock",
          incentives: "10-year tax holiday, duty-free equipment",
          minInvestment: "$50K"
        },
        {
          name: "Tourism & Hospitality", 
          roi: "20-30%",
          icon: "🏖️",
          opportunities: "Eco-lodges, cultural tourism, adventure",
          incentives: "VAT exemption, accelerated depreciation",
          minInvestment: "$100K"
        },
        {
          name: "Mining & Minerals",
          roi: "30-45%", 
          icon: "⛏️",
          opportunities: "Gold, minerals processing, exploration",
          incentives: "Royalty reductions, tax incentives",
          minInvestment: "$500K"
        },
        {
          name: "ICT & Technology",
          roi: "35-50%",
          icon: "💻",
          opportunities: "Fintech, software, digital services",
          incentives: "R&D tax credits, startup support",
          minInvestment: "$25K"
        },
        {
          name: "Manufacturing & Industrial",
          roi: "20-35%",
          icon: "🏭",
          opportunities: "Value addition, export manufacturing",
          incentives: "Industrial park benefits, export incentives",
          minInvestment: "$200K"
        },
        {
          name: "Energy & Infrastructure",
          roi: "15-25%",
          icon: "⚡",
          opportunities: "Solar, hydro, transmission, PPP",
          incentives: "Feed-in tariffs, government guarantees",
          minInvestment: "$1M"
        }
      ],
      action: "Select Priority Sectors",
      nextStep: "Review required services and documentation"
    },
    {
      id: 4,
      title: "Required Services & Documentation",
      subtitle: "Your Investment Service Roadmap",
      description: "Based on your profile, here are the essential services you'll need.",
      visual: "📋",
      action: "Review Service Requirements",
      nextStep: "Get your customized investment timeline"
    },
    {
      id: 5,
      title: "Investment Timeline & Process",
      subtitle: "Your Step-by-Step Journey",
      description: "Clear timeline with milestones and government touchpoints.",
      visual: "⏱️",
      timeline: [
        { phase: "Initial Consultation", duration: "3-5 days", description: "Meet with UIA investment officer, review opportunities" },
        { phase: "Documentation Prep", duration: "7-14 days", description: "Prepare business plan, financial projections, compliance docs" },
        { phase: "License Application", duration: "15-30 days", description: "Submit investment license, await government approval" },
        { phase: "Incentives Application", duration: "21-45 days", description: "Apply for tax holidays and other incentives" },
        { phase: "Implementation Support", duration: "Ongoing", description: "Dedicated support during setup and operations" }
      ],
      action: "Start Your Investment Journey",
      nextStep: "Connect with your dedicated investment officer"
    },
    {
      id: 6,
      title: "Next Steps & Contact",
      subtitle: "Ready to Begin Your Investment",
      description: "Connect with Uganda Investment Authority for immediate support.",
      visual: "🤝",
      contacts: [
        {
          title: "Direct Investment Hotline",
          contact: "+256 414 301000",
          description: "Immediate support for serious investors",
          available: "24/7 for Premium+ investors"
        },
        {
          title: "Executive Investment Email",
          contact: "invest@ugandainvest.go.ug",
          description: "Priority email for investment inquiries",
          available: "48-hour response guarantee"
        },
        {
          title: "Investment Portal",
          contact: "ugandainvest.go.ug",
          description: "Complete investment services online",
          available: "24/7 online services"
        }
      ],
      action: "Contact UIA Now",
      nextStep: "Begin your investment process"
    }
  ]

  const handleNext = useCallback(() => {
    if (currentStep < investmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }, [currentStep, investmentSteps.length])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleProfileSelect = useCallback((profile) => {
    setUserProfile(profile)
    setTimeout(handleNext, 500)
  }, [handleNext])

  const handleStartInvestment = useCallback(() => {
    onClose()
    navigate('/services?category=Investment Support')
  }, [onClose, navigate])

  const handleViewOpportunities = useCallback(() => {
    onClose()
    navigate('/investments')
  }, [onClose, navigate])

  const currentStepData = investmentSteps[currentStep]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 rounded-t-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                    {currentStepData.visual}
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Step {currentStep + 1} of {investmentSteps.length}</div>
                    <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                    <p className="text-lg opacity-90">{currentStepData.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / investmentSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-gray-600 text-lg mb-8">{currentStepData.description}</p>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentStepData.keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ✓
                      </div>
                      <span className="text-gray-800 font-medium">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentStepData.profiles.map((profile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${profile.color} text-white cursor-pointer hover:scale-105 transition-transform ${userProfile?.tier === profile.tier ? 'ring-4 ring-yellow-400' : ''}`}
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-4">{profile.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold">{profile.tier}</h3>
                        <p className="text-sm opacity-90">{profile.amount}</p>
                        <div className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs font-bold mt-1">
                          {profile.successRate} Success Rate
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {profile.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStepData.sectors.map((sector, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{sector.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{sector.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                            {sector.roi} ROI
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                            Min: {sector.minInvestment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{sector.opportunities}</p>
                    <p className="text-xs text-green-700 font-medium">{sector.incentives}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                {currentStepData.timeline.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900">{phase.phase}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                {currentStepData.contacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 border-2 border-blue-200 rounded-2xl bg-blue-50"
                  >
                    <h3 className="font-bold text-blue-900 text-lg mb-2">{contact.title}</h3>
                    <p className="text-2xl font-bold text-blue-700 mb-2">{contact.contact}</p>
                    <p className="text-gray-700 mb-1">{contact.description}</p>
                    <p className="text-sm text-green-700 font-medium">{contact.available}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 bg-gray-50 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-4">
                {currentStep === 5 ? (
                  <>
                    <button
                      onClick={handleViewOpportunities}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      View Opportunities
                    </button>
                    <button
                      onClick={handleStartInvestment}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                    >
                      Start Investment Process
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                  >
                    {currentStepData.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default InvestorTour