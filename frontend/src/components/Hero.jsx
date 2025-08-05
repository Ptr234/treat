import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../contexts/NotificationContext'
import InvestorTour from './InvestorTour'

const Hero = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [selectedRole, setSelectedRole] = useState(null)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showInvestorTour, setShowInvestorTour] = useState(false)

  const keyStats = [
    { value: '$2.9B+', label: 'FDI in 2023 (+79.2%)', icon: '💰', highlight: 'Record FDI Growth' },
    { value: '6.5%', label: 'GDP Growth 2024/25', icon: '📈', highlight: 'Strong Economy' },
    { value: '97%', label: 'Fast-Track Success Rate', icon: '🎯', highlight: 'Premium Service' },
    { value: '10 Years', label: 'Max Tax Holiday Period', icon: '🏢', highlight: 'Investment Incentives' }
  ]

  const userRoles = [
    {
      id: 'investor',
      title: 'Premium Investor',
      description: 'USD 1M+ investments with fast-track approvals, dedicated support, and exclusive incentives',
      icon: '💎',
      color: 'from-green-500 to-emerald-600',
      features: ['15-day Fast-Track', 'Dedicated Officer', 'Tax Holidays', 'Ministerial Access'],
      minInvestment: 'USD 1,000,000+'
    },
    {
      id: 'entrepreneur',
      title: 'Strategic Investor',
      description: 'USD 100K-1M investments with comprehensive support and tax incentives',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-600',
      features: ['Investment License', 'Tax Incentives', 'Business Support', 'Growth Facilitation'],
      minInvestment: 'USD 100,000 - 1M'
    },
    {
      id: 'institutional',
      title: 'Major Investor',
      description: 'USD 5M+ mega-projects with presidential committee access and single-window clearance',
      icon: '🏦',
      color: 'from-purple-500 to-indigo-600',
      features: ['Presidential Committee', 'Single Window', 'Infrastructure PPP', 'Guaranteed Approvals'],
      minInvestment: 'USD 5,000,000+'
    },
    {
      id: 'explorer',
      title: 'Emerging Investor',
      description: 'USD 50K+ investments with sectoral guidance and partnership matching',
      icon: '🌟',
      color: 'from-orange-500 to-red-600',
      features: ['Sector Analysis', 'Partnership Matching', 'Market Entry', 'Advisory Services'],
      minInvestment: 'USD 50,000+'
    }
  ]

  const tutorialSteps = [
    {
      title: 'Welcome to Uganda Investment Portal',
      content: 'Your gateway to high-return investment opportunities and business support in Uganda. Let\'s show you around!',
      target: null
    },
    {
      title: 'Investment Navigation',
      content: 'Use the header menu to explore Investment Opportunities, Support Services, and Investment Tools.',
      target: 'header'
    },
    {
      title: 'Investment Opportunities',
      content: 'Discover ATMS sector investments with tax incentives, detailed ROI calculations, and investment guides.',
      target: 'investments'
    },
    {
      title: 'Investment Support Services',
      content: 'Access business registration, investment documentation, and regulatory support through government agencies.',
      target: 'services'
    },
    {
      title: 'Investment Support & Guidance',
      content: 'Get expert assistance for your investments, submit inquiries, and track your applications.',
      target: 'support'
    }
  ]

  const quickActions = [
    { 
      title: '🎯 Investment Tour', 
      desc: 'Step-by-step investor guide', 
      icon: '🎯', 
      action: () => {
        setShowInvestorTour(true)
      },
      highlight: true
    },
    { 
      title: 'Explore Investments', 
      desc: 'High-return opportunities', 
      icon: '💰', 
      action: () => {
        console.log('Navigating to investments')
        navigate('/investments')
      }
    },
    { 
      title: 'ROI Calculator', 
      desc: 'Calculate investment returns', 
      icon: '📊', 
      action: () => {
        console.log('Navigating to ROI calculator')
        navigate('/roi-calculator')
      }
    },
    { 
      title: 'Start Investment', 
      desc: 'Business registration & setup', 
      icon: '🚀', 
      action: () => {
        console.log('Navigating to registration')
        navigate('/registration-wizard')
      }
    },
    { 
      title: 'Investment Support', 
      desc: 'Expert guidance available', 
      icon: '💬', 
      action: () => {
        console.log('Navigating to support')
        navigate('/support')
      }
    }
  ]

  return (
    <motion.section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 1,
            staggerChildren: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {/* Modern Uganda Cityscape & Pride Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-map-flag.jpg" 
            alt="Uganda map with flag - Republic of Uganda investment portal" 
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0">
          <img 
            src="/images/Pride.webp" 
            alt="Uganda's national pride and heritage" 
            className="absolute top-10 right-10 w-32 h-24 object-cover opacity-60 rounded-lg shadow-2xl border border-red-400/30 z-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
        
        {/* Crested Crane Silhouette */}
        <div className="absolute bottom-20 left-10 opacity-10">
          <div className="w-32 h-32 text-white">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M30 70 Q35 65 40 70 Q45 60 55 65 Q60 55 70 60 Q75 65 70 75 Q65 80 55 75 Q50 85 40 80 Q35 75 30 70 Z" />
              <path d="M45 50 Q50 45 55 50 Q60 45 65 50 Q70 55 65 65 Q60 70 50 65 Q40 60 45 50 Z" />
              <circle cx="52" cy="52" r="2" />
              <path d="M50 35 Q55 30 60 35 Q65 40 60 45 Q55 50 50 45 Q45 40 50 35 Z" />
            </svg>
          </div>
        </div>
        
        {/* Tourism Beauty of Uganda */}
        <div className="absolute top-20 left-10 opacity-30">
          <img 
            src="/images/Tourism.webp" 
            alt="Beautiful tourism landscapes of Uganda - Pearl of Africa" 
            className="w-24 h-20 object-cover rounded-lg shadow-xl border border-red-400/30"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <motion.div 
          className="pt-32 pb-16 text-center"
          variants={{
            hidden: { 
              opacity: 0, 
              y: 50,
              scale: 0.95
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  duration: 1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/images/oneStopCenter-logo.jpeg" 
                  alt="OneStopCentre Uganda Official Logo" 
                  className="w-8 h-8 object-cover mr-3 rounded shadow-md"
                />
                <span className="inline-block px-4 py-2 bg-red-500/40 text-red-100 rounded-full text-sm font-medium backdrop-blur-sm border border-red-400/30">
                  🏆 Uganda Investment Authority - Official Investment Portal 🏆
                </span>
                <img 
                  src="/images/uganda-coat-of-arms.png" 
                  alt="Uganda Coat of Arms" 
                  className="w-8 h-8 object-contain ml-3 opacity-80"
                />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                <span className="bg-gradient-to-r from-red-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                  Invest Uganda
                </span>
                <span className="block text-white text-3xl md:text-4xl lg:text-5xl font-medium">
                  Pearl of Africa Investment Portal
                </span>
              </h1>
              <div className="relative mb-8">
                <div className="absolute -top-4 -right-4 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-16 h-16 text-red-300 fill-current">
                    <path d="M30 70 Q35 65 40 70 Q45 60 55 65 Q60 55 70 60 Q75 65 70 75 Q65 80 55 75 Q50 85 40 80 Q35 75 30 70 Z" />
                    <path d="M45 50 Q50 45 55 50 Q60 45 65 50 Q70 55 65 65 Q60 70 50 65 Q40 60 45 50 Z" />
                    <circle cx="52" cy="52" r="2" />
                    <path d="M50 35 Q55 30 60 35 Q65 40 60 45 Q55 50 50 45 Q45 40 50 35 Z" />
                  </svg>
                </div>
                <p className="text-xl md:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 rounded-lg p-6 border border-red-400/20">
                  Official Uganda Investment Authority portal offering high-return investment opportunities with tax incentives, 
                  streamlined business registration through URSB, and comprehensive investment support across Agriculture, Tourism, Mining & ICT sectors.
                  <span className="block mt-2 text-lg text-red-200 font-medium">"Unlock Africa's Best Investment Opportunities" - $2.9B+ FDI Growth</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInvestorTour(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">🎯 Investment Tour</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRoleSelection(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started Now
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowTutorial(true)
                  setTutorialStep(0)
                }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Quick Tutorial
              </motion.button>
            </div>
          </motion.div>

          {/* Key Statistics with Uganda Flag Colors */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {keyStats.map((stat, index) => {
              const flagColors = [
                'bg-gradient-to-br from-black/20 to-gray-900/20 border-gray-400/30', // Black stripe
                'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30', // Red stripe  
                'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30', // Red stripe
                'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30' // Blue (symbolic)
              ]
              const colorClass = flagColors[index % flagColors.length]
              
              return (
                <div key={index} className={`${colorClass} backdrop-blur-sm rounded-xl p-6 border-2 relative overflow-hidden`}>
                  {index === 1 && (
                    <div className="absolute top-2 right-2 opacity-30">
                      <img 
                        src="/images/uganda-coat-of-arms.png" 
                        alt="Uganda Coat of Arms" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">{stat.value}</div>
                  <div className="text-gray-200 text-sm font-medium">{stat.label}</div>
                </div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pb-20"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-1 bg-gradient-to-r from-black via-red-500 via-yellow-400 to-black rounded-full mr-4"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Start Your Investment Journey
              </h2>
              <div className="w-8 h-1 bg-gradient-to-r from-black via-red-500 via-yellow-400 to-black rounded-full ml-4"></div>
            </div>
            <p className="text-gray-300 text-sm">Explore Uganda's opportunities with these essential services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className={`${action.highlight 
                  ? 'bg-gradient-to-br from-red-400/20 to-red-500/20 border-red-400/50 ring-2 ring-red-400/30' 
                  : 'bg-white/10 border-white/20'
                } backdrop-blur-sm rounded-xl p-6 border cursor-pointer hover:bg-white/20 transition-all relative overflow-hidden`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log(`Clicked on ${action.title}`)
                  action.action()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    action.action()
                  }
                }}
              >
                <div className="text-3xl mb-4">{action.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-gray-300 text-sm">{action.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center text-white/70">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Role Selection Modal */}
      <AnimatePresence>
        {showRoleSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
                <p className="text-gray-600">Select your role to get personalized content and features tailored to your needs.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {userRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center text-white text-2xl mr-4`}>
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                        {role.minInvestment && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mt-1">
                            💰 {role.minInvestment}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Premium Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {role.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowRoleSelection(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  onClick={() => {
                    if (selectedRole) {
                      const role = userRoles.find(r => r.id === selectedRole)
                      addNotification({
                        type: 'success',
                        title: 'Role Selected',
                        message: `Welcome ${role.title}! Your experience has been customized.`,
                        duration: 4000
                      })
                      
                      // Navigate based on role
                      switch (selectedRole) {
                        case 'investor':
                          navigate('/investments')
                          break
                        case 'entrepreneur':
                          navigate('/services')
                          break
                        case 'government':
                          // Would navigate to admin dashboard if available
                          navigate('/support')
                          break
                        default:
                          // Stay on home page for explorers
                          break
                      }
                      
                      setShowRoleSelection(false)
                    } else {
                      addNotification({
                        type: 'warning',
                        title: 'Please Select a Role',
                        message: 'Choose a role to get personalized content.',
                        duration: 3000
                      })
                    }
                  }}
                  disabled={!selectedRole}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedRole
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">🎓</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tutorialSteps[tutorialStep]?.title}</h3>
                    <p className="text-sm text-gray-500">Step {tutorialStep + 1} of {tutorialSteps.length}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">{tutorialSteps[tutorialStep]?.content}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === tutorialStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  {tutorialStep > 0 && (
                    <button
                      onClick={() => setTutorialStep(tutorialStep - 1)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  {tutorialStep < tutorialSteps.length - 1 ? (
                    <button
                      onClick={() => setTutorialStep(tutorialStep + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowTutorial(false)
                        addNotification({
                          type: 'success',
                          title: 'Tutorial Complete',
                          message: 'You\'re ready to explore OneStopCentre Uganda!',
                          duration: 4000
                        })
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Get Started
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Investor Tour Modal */}
      <InvestorTour 
        isOpen={showInvestorTour} 
        onClose={() => setShowInvestorTour(false)} 
      />
    </motion.section>
  )
}

export default Hero