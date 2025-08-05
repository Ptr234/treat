import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRightIcon, PlayIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
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
      icon: '🌾',
      color: 'from-green-500 via-emerald-600 to-green-700',
      bgColor: 'from-green-500/10 to-emerald-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '120+', jobs: '45K+' },
      featured: true
    },
    {
      id: 'tourism',
      title: 'Tourism & Hospitality',
      description: 'Home to mountain gorillas, pristine lakes, and UNESCO world heritage sites',
      value: '$1.8B',
      growth: '+24.1%',
      icon: '🏔️',
      color: 'from-blue-500 via-cyan-600 to-blue-700',
      bgColor: 'from-blue-500/10 to-cyan-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '85+', jobs: '32K+' },
      featured: false
    },
    {
      id: 'minerals',
      title: 'Mining & Minerals',
      description: 'Rich deposits of gold, copper, cobalt and rare earth elements for global markets',
      value: '$1.2B',
      growth: '+8.7%',
      icon: '⛏️',
      color: 'from-amber-500 via-orange-600 to-amber-700',
      bgColor: 'from-amber-500/10 to-orange-600/5',
      image: '/images/Infrastucture.webp',
      stats: { projects: '65+', jobs: '28K+' },
      featured: false
    },
    {
      id: 'ict',
      title: 'ICT & Digital Innovation',
      description: 'Fastest growing fintech and digital innovation hub in East Africa',
      value: '$890M',
      growth: '+32.4%',
      icon: '💻',
      color: 'from-purple-500 via-indigo-600 to-purple-700',
      bgColor: 'from-purple-500/10 to-indigo-600/5',
      image: '/images/Pride.webp',
      stats: { projects: '200+', jobs: '15K+' },
      featured: true
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing & Industry',
      description: 'Strategic location for regional manufacturing and export processing zones',
      value: '$1.5B',
      growth: '+18.3%',
      icon: '🏭',
      color: 'from-red-500 via-rose-600 to-red-700',
      bgColor: 'from-red-500/10 to-rose-600/5',
      image: '/images/Tourism.webp',
      stats: { projects: '90+', jobs: '38K+' },
      featured: false
    },
    {
      id: 'energy',
      title: 'Renewable Energy',
      description: 'Abundant solar, hydro, and wind resources for sustainable energy production',
      value: '$2.3B',
      growth: '+28.6%',
      icon: '⚡',
      color: 'from-yellow-500 via-amber-600 to-yellow-700',
      bgColor: 'from-yellow-500/10 to-amber-600/5',
      image: '/images/Infrastucture.webp',
      stats: { projects: '45+', jobs: '22K+' },
      featured: true
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

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden mt-12">
          <AnimatePresence mode="wait" custom={currentSlide}>
            <motion.div
              key={currentSlide}
              custom={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <motion.div
                style={{ scale: heroScale }}
                className="relative w-full h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-black/60 to-red-800/80 z-10" />
                <img
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide].title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-20 text-center max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="space-y-8"
            >
              <motion.div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-400/30 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-red-200 font-medium">Uganda Investment Authority</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none">
                <span className="block bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                  {heroSlides[currentSlide].title}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWizardOpen(true)}
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 flex items-center space-x-3"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Find Investment Opportunity</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleServicesClick}
                  className="group bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
                >
                  <span>Browse All Services</span>
                  <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="bg-red-600/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-6 max-w-md mx-auto"
              >
                <div className="text-center">
                  <div className="text-sm text-red-200 font-medium mb-2">
                    {heroSlides[currentSlide].stats.label}
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    {heroSlides[currentSlide].stats.value}
                  </div>
                  <div className="text-green-400 text-sm font-semibold">
                    {heroSlides[currentSlide].stats.trend} this month
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Enhanced Prime Sectors */}
        <section className="py-32 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-3xl opacity-30"></div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <motion.div variants={itemVariants} className="text-center mb-20">
              <motion.div 
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 border border-red-400/30 rounded-full px-8 py-3 backdrop-blur-md mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <SparklesIcon className="w-5 h-5 text-red-400" />
                <span className="text-red-200 font-semibold text-lg">Investment Opportunities</span>
                <motion.div 
                  className="w-2 h-2 bg-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
                <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Prime Sectors
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Discover Uganda's fastest-growing investment sectors with <span className="text-green-400 font-semibold">guaranteed returns</span> and comprehensive government support
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investmentSectors.map((sector, index) => (
                <motion.div
                  key={sector.id}
                  variants={sector.featured ? featuredCardVariants : sectorCardVariants}
                  whileHover="hover"
                  className={`group relative backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${
                    sector.featured 
                      ? 'lg:col-span-1 md:row-span-1 border-2 ring-2 ring-yellow-400/50' 
                      : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))`,
                  }}
                >
                  {/* Featured Badge */}
                  {sector.featured && (
                    <motion.div 
                      className="absolute top-4 right-4 z-20"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        FEATURED
                      </div>
                    </motion.div>
                  )}

                  {/* Background Image with Enhanced Overlay */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                    <img
                      src={sector.image}
                      alt={sector.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      style={{ contentVisibility: 'auto' }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${sector.color} opacity-60`}></div>
                  </div>

                  <div className="relative z-10 p-8 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="text-6xl filter drop-shadow-lg transform transition-transform duration-200 hover:scale-110">
                        {sector.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-white drop-shadow-lg">
                          {sector.value}
                        </div>
                        <div className="text-green-400 text-lg font-bold flex items-center">
                          ↗ {sector.growth}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors duration-300">
                        {sector.title}
                      </h3>
                      
                      <p className="text-gray-200 text-base leading-relaxed mb-6">
                        {sector.description}
                      </p>

                      {/* Stats Section */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                          <div className="text-white font-bold text-lg">{sector.stats.projects}</div>
                          <div className="text-gray-300 text-sm">Projects</div>
                        </div>
                        <div className="text-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                          <div className="text-white font-bold text-lg">{sector.stats.jobs}</div>
                          <div className="text-gray-300 text-sm">Jobs Created</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-3 bg-black/20 rounded-full mb-6 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${sector.color} rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={() => handleSectorNavigation(sector.id)}
                      className={`w-full bg-gradient-to-r ${sector.color} hover:shadow-2xl text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95`}
                    >
                      Explore Opportunities →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action Section */}
            <motion.div 
              className="text-center mt-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/investments')}
                className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Investment Opportunities
              </motion.button>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Service Wizard Modal */}
      <ServiceWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </PageBackground>
  )
}

export default HomePage