import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronRightIcon, 
  PlayIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  BeakerIcon,
  CameraIcon,
  CubeIcon,
  ComputerDesktopIcon,
  CogIcon,
  BoltIcon,
  ChartBarIcon,
  MapIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import ServiceWizard from '../components/ServiceWizard'

const HomePage = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [liveStats, setLiveStats] = useState({
    fdi: 2.9,
    gdp: 6.5,
    businesses: 50893,
    investments: 1247,
    sectors: 8
  })

  // Professional icon mapping for sectors
  const sectorIconMap = {
    'agriculture': BeakerIcon,
    'tourism': CameraIcon,
    'minerals': CubeIcon,
    'ict': ComputerDesktopIcon,
    'manufacturing': CogIcon,
    'energy': BoltIcon
  }

  const renderSectorIcon = (sectorId, className = "w-12 h-12") => {
    const IconComponent = sectorIconMap[sectorId]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1])

  // Enhanced hero slides - Investment-focused with improved UX
  const heroSlides = useMemo(() => [
    {
      id: 'investment-hub',
      image: '/images/uganda-kampala-city-view.webp',
      title: 'Uganda Investment Hub',
      subtitle: 'East Africa\'s premier investment destination with simplified processes',
      cta: 'Start Investing',
      stats: { label: 'Investment Growth', value: '6.5%', trend: 'Annual GDP' }
    },
    {
      id: 'tourism',
      image: '/images/Tourism.webp',
      title: 'Tourism & Hospitality Excellence',
      subtitle: '$1.8B annual tourism revenue with growing opportunities',
      cta: 'Explore Tourism Investments',
      stats: { label: 'Tourism Growth', value: '24%', trend: 'Year on Year' }
    },
    {
      id: 'infrastructure',
      image: '/images/Infrastucture.webp',
      title: 'Modern Infrastructure Development',
      subtitle: 'Strategic location connecting East African markets',
      cta: 'Infrastructure Opportunities',
      stats: { label: 'Active Projects', value: '342+', trend: 'Nationwide' }
    },
    {
      id: 'investment-success',
      image: '/images/Pride.webp',
      title: 'Proven Investment Success',
      subtitle: '60+ years of stable growth and investor-friendly policies',
      cta: 'View Success Stories',
      stats: { label: 'Investor Satisfaction', value: '97%', trend: 'Success Rate' }
    }
  ], [])

  // Live statistics with enhanced animations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        fdi: Math.max(2.5, Math.min(3.5, prev.fdi + (Math.random() - 0.5) * 0.02)),
        gdp: Math.max(6.0, Math.min(7.0, prev.gdp + (Math.random() - 0.5) * 0.05)),
        businesses: prev.businesses + Math.floor(Math.random() * 5),
        investments: prev.investments + Math.floor(Math.random() * 3),
        sectors: Math.max(8, Math.min(12, prev.sectors + (Math.random() > 0.98 ? 1 : 0)))
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  // Navigation functions
  const handleInvestmentClick = useCallback(() => {
    navigate('/investments')
  }, [navigate])

  const handleServicesClick = useCallback(() => {
    navigate('/services')
  }, [navigate])

  // Navigation handlers for different sectors
  const handleSectorNavigation = useCallback((sectorId) => {
    switch(sectorId) {
      case 'agriculture':
        navigate('/investments', { state: { filter: 'agriculture' } })
        break
      case 'tourism':
        navigate('/investments', { state: { filter: 'tourism' } })
        break
      case 'minerals':
        navigate('/investments', { state: { filter: 'mining' } })
        break
      case 'ict':
        navigate('/investments', { state: { filter: 'technology' } })
        break
      case 'manufacturing':
        navigate('/investments', { state: { filter: 'manufacturing' } })
        break
      case 'energy':
        navigate('/investments', { state: { filter: 'energy' } })
        break
      default:
        navigate('/investments')
    }
  }, [navigate])

  // Investment sectors data with enhanced structure
  const investmentSectors = useMemo(() => [
    {
      id: 'agriculture',
      title: 'Agriculture & Agro-processing',
      description: 'Leading Africa in coffee, tea, and sustainable farming with organic export opportunities',
      value: '$2.1B',
      growth: '+15.2%',
      color: 'from-green-500 via-emerald-600 to-green-700',
      bgColor: 'from-green-500/10 to-emerald-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '120+', jobs: '45K+' },
      featured: true,
      dataSource: 'Uganda Investment Authority 2024'
    },
    {
      id: 'tourism',
      title: 'Tourism & Hospitality',
      description: 'Home to mountain gorillas, pristine lakes, and UNESCO world heritage sites',
      value: '$1.8B',
      growth: '+24.1%',
      color: 'from-blue-500 via-cyan-600 to-blue-700',
      bgColor: 'from-blue-500/10 to-cyan-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '85+', jobs: '32K+' },
      featured: false,
      dataSource: 'Uganda Tourism Board 2024'
    },
    {
      id: 'minerals',
      title: 'Mining & Minerals',
      description: 'Rich deposits of gold, copper, cobalt and rare earth elements for global markets',
      value: '$1.2B',
      growth: '+8.7%',
      color: 'from-amber-500 via-orange-600 to-amber-700',
      bgColor: 'from-amber-500/10 to-orange-600/5',
      image: '/images/Infrastucture.webp',
      stats: { projects: '65+', jobs: '28K+' },
      featured: false,
      dataSource: 'Ministry of Energy & Minerals 2024'
    },
    {
      id: 'ict',
      title: 'ICT & Digital Innovation',
      description: 'Fastest growing fintech and digital innovation hub in East Africa',
      value: '$890M',
      growth: '+32.4%',
      color: 'from-purple-500 via-indigo-600 to-purple-700',
      bgColor: 'from-purple-500/10 to-indigo-600/5',
      image: '/images/Pride.webp',
      stats: { projects: '200+', jobs: '15K+' },
      featured: true,
      dataSource: 'Uganda Communications Commission 2024'
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing & Industry',
      description: 'Strategic location for regional manufacturing and export processing zones',
      value: '$1.5B',
      growth: '+18.3%',
      color: 'from-red-500 via-rose-600 to-red-700',
      bgColor: 'from-red-500/10 to-rose-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '90+', jobs: '38K+' },
      featured: false,
      dataSource: 'Uganda Manufacturers Association 2024'
    },
    {
      id: 'energy',
      title: 'Renewable Energy',
      description: 'Abundant solar, hydro, and wind resources for sustainable energy production',
      value: '$2.3B',
      growth: '+28.6%',
      color: 'from-yellow-500 via-amber-600 to-yellow-700',
      bgColor: 'from-yellow-500/10 to-amber-600/5',
      image: '/images/Infrastucture.webp',
      stats: { projects: '45+', jobs: '22K+' },
      featured: true,
      dataSource: 'Electricity Regulatory Authority 2024'
    }
  ], [])

  // Optimized animation variants for 60fps performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const sectorCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  const featuredCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: { 
      y: -12, 
      scale: 1.03,
      transition: {
        duration: 0.25,
        ease: "easeInOut"
      }
    }
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.8,
        ease: [0.55, 0.085, 0.68, 0.53]
      }
    })
  }

  return (
    <PageBackground>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white overflow-hidden">
        
        {/* Red Status Bar */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 z-50"
        />
        
        {/* Live Statistics Bar */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-1 left-0 right-0 bg-red-600/90 backdrop-blur-md text-white py-2 px-4 z-40"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs md:text-sm">
            <div className="flex space-x-6">
              <motion.div
                key={liveStats.fdi}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-1"
              >
                <SparklesIcon className="w-4 h-4 text-yellow-300" />
                <span className="font-medium">FDI: ${liveStats.fdi.toFixed(2)}B</span>
              </motion.div>
              <motion.div
                key={liveStats.gdp}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-medium">GDP Growth: {liveStats.gdp.toFixed(1)}%</span>
              </motion.div>
              <motion.div
                key={liveStats.businesses}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-medium">Businesses: {liveStats.businesses.toLocaleString()}</span>
              </motion.div>
            </div>
            <div className="text-yellow-300 font-semibold">
              🔴 LIVE: {liveStats.investments.toLocaleString()} Active Investments
            </div>
          </div>
        </motion.div>

        {/* Hero Section - Simplified and Focused */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900 to-black"></div>
          <div className="absolute inset-0">
            <img
              src="/images/uganda-kampala-city-view.webp"
              alt="Uganda Investment Hub"
              className="w-full h-full object-cover opacity-30"
              loading="eager"
            />
          </div>

          {/* Hero Content - Clean and Direct */}
          <div className="relative z-20 text-center max-w-5xl mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-400/30 rounded-full px-6 py-2 backdrop-blur-sm text-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-red-200 font-medium">Uganda Investment Authority</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="block bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                  East Africa's Premier
                </span>
                <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Investment Hub
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Unlock Uganda's investment potential with simplified processes, government support, and guaranteed returns in Africa's fastest-growing economy.
              </motion.p>

              {/* Primary CTA */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWizardOpen(true)}
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl transition-all duration-300 flex items-center space-x-3 text-lg"
                >
                  <span>Start Investing Today</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleServicesClick}
                  className="text-white font-semibold py-4 px-8 rounded-2xl border border-white/30 hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>View All Services</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex justify-center items-center space-x-8 pt-8 text-sm text-gray-300"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>GDP Growth: {liveStats.gdp.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>FDI: ${liveStats.fdi.toFixed(1)}B</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>{liveStats.investments.toLocaleString()} Active Investments</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="text-gray-600 text-lg font-medium mb-8">
                Trusted by leading organizations and investors across East Africa
              </p>
              
              {/* Client Logos */}
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
                <img src="/images/logos/UIA logo.png" alt="Uganda Investment Authority" className="h-12 object-contain" />
                <img src="/images/logos/BOU.jpeg" alt="Bank of Uganda" className="h-12 object-contain" />
                <img src="/images/logos/URA logo.png" alt="Uganda Revenue Authority" className="h-12 object-contain" />
                <img src="/images/logos/URSB logo.png" alt="Uganda Registration Services Bureau" className="h-12 object-contain" />
                <img src="/images/logos/NSSF logo.png" alt="National Social Security Fund" className="h-12 object-contain" />
                <img src="/images/logos/UTB.png" alt="Uganda Tourism Board" className="h-12 object-contain" />
              </div>
            </motion.div>

            {/* Key Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            >
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">$2.9B+</div>
                <div className="text-gray-600 font-medium">Foreign Direct Investment</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">1,200+</div>
                <div className="text-gray-600 font-medium">Active Investments</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">97%</div>
                <div className="text-gray-600 font-medium">Investor Satisfaction</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">6.5%</div>
                <div className="text-gray-600 font-medium">Annual GDP Growth</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                Why Invest in Uganda?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the advantages that make Uganda East Africa's most attractive investment destination
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {renderSectorIcon('ict', 'w-8 h-8 text-blue-600')}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gateway to East African markets with access to over 300 million consumers through regional trade agreements.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Government Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive incentives, tax holidays, and one-stop center services to streamline your investment journey.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ChartBarIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Stable Economy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Consistent GDP growth, stable currency, and diversified economy offering multiple investment opportunities.
                </p>
              </motion.div>
            </div>
          </div>
        </section>


        {/* About Uganda Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                  The Pearl of Africa Awaits Your Investment
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Uganda combines political stability, abundant natural resources, and a strategic location 
                  to offer unparalleled investment opportunities in East Africa's most dynamic economy.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">60+ years of political stability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Young, educated workforce (75% under 30)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Rich natural resources & fertile land</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <img
                  src="/images/uganda-kampala-city-view.webp"
                  alt="Kampala City View"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                  <div className="text-2xl font-black text-gray-900">45M+</div>
                  <div className="text-gray-600">Population</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
                Join thousands of successful investors who have already discovered Uganda's potential. 
                Get started today with our expert guidance and comprehensive support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWizardOpen(true)}
                  className="bg-white text-red-600 font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                >
                  Start Investment Assessment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/support')}
                  className="border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white hover:text-red-600 transition-all duration-300"
                >
                  Talk to an Expert
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Getting Started Navigation Flow */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-6 border border-green-500/30 backdrop-blur-sm">
              <MapIcon className="w-5 h-5 mr-2" />
              <span>Your Investment Journey Starts Here</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to 
              <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Start Investing?
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Follow our guided process to discover the perfect investment opportunity 
              and get started with Uganda's most promising sectors.
            </p>
          </div>

          {/* Interactive Flow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                title: 'Discover Opportunities',
                description: 'Explore investment sectors with 15-35% ROI potential',
                icon: LightBulbIcon,
                color: 'from-blue-500 to-cyan-600',
                action: () => navigate('/investments'),
                actionText: 'Browse Investments',
                highlights: ['8 Key Sectors', '1,200+ Opportunities', 'ROI Calculator']
              },
              {
                step: '02',
                title: 'Get Official Support',
                description: 'Access government services and agency assistance',
                icon: MapIcon,
                color: 'from-green-500 to-emerald-600',
                action: () => navigate('/services'),
                actionText: 'View Services',
                highlights: ['50+ Services', 'Fast-Track Processing', 'Expert Guidance']
              },
              {
                step: '03',
                title: 'Launch Your Investment',
                description: 'Complete applications and start your investment journey',
                icon: RocketLaunchIcon,
                color: 'from-purple-500 to-pink-600',
                action: () => navigate('/investment-onboarding'),
                actionText: 'Start Application',
                highlights: ['Step-by-Step Guide', '15-30 Day Process', 'Dedicated Support']
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={step.action}
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 relative overflow-hidden h-full">
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {step.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  <button className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r ${step.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                    <span>{step.actionText}</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/30 text-center"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-black text-yellow-400 mb-2">
                  {liveStats.fdi.toFixed(1)}B+
                </div>
                <div className="text-sm text-gray-300">FDI 2023 (USD)</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-400 mb-2">
                  {liveStats.gdp.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">GDP Growth Rate</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400 mb-2">
                  {liveStats.businesses.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">New Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-400 mb-2">
                  {liveStats.investments}+
                </div>
                <div className="text-sm text-gray-300">Active Opportunities</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Service Wizard Modal */}
      <ServiceWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </PageBackground>
  )
}

export default HomePage