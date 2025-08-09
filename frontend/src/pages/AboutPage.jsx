import React from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  BuildingLibraryIcon,
  BeakerIcon,
  CogIcon,
  BoltIcon,
  TruckIcon,
  GlobeAltIcon,
  CubeIcon,
  UserGroupIcon,
  FlagIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const AboutPage = () => {
  const stats = [
    { label: 'Foreign Direct Investment (2023)', value: '$2.9B+', change: '+79.2%', icon: CurrencyDollarIcon, color: 'text-green-500' },
    { label: 'GDP Growth Rate', value: '6.5%', change: 'Annual', icon: ChartBarIcon, color: 'text-blue-500' },
    { label: 'New Businesses Registered', value: '50,893', change: '2023', icon: BuildingOfficeIcon, color: 'text-purple-500' },
    { label: 'Government Services Available', value: '150+', change: 'Streamlined', icon: BuildingLibraryIcon, color: 'text-red-500' }
  ]

  const sectors = [
    {
      name: 'Agriculture, Tourism, Mining & ICT (ATMS)',
      description: 'Priority sectors driving Uganda\'s economic transformation',
      icon: BeakerIcon,
      color: 'text-green-500',
      highlights: ['Food Security', 'Tourism Growth', 'Mineral Wealth', 'Digital Innovation']
    },
    {
      name: 'Manufacturing',
      description: 'Value addition and industrial development',
      icon: CogIcon,
      color: 'text-blue-500',
      highlights: ['Agro-processing', 'Textiles', 'Steel & Iron', 'Pharmaceuticals']
    },
    {
      name: 'Energy',
      description: 'Renewable energy and power generation',
      icon: BoltIcon,
      color: 'text-yellow-500',
      highlights: ['Hydroelectric', 'Solar Power', 'Oil & Gas', 'Grid Extension']
    },
    {
      name: 'Infrastructure',
      description: 'Transportation and connectivity projects',
      icon: TruckIcon,
      color: 'text-indigo-500',
      highlights: ['Roads & Railways', 'Airports', 'Ports', 'Digital Infrastructure']
    }
  ]

  return (
    <PageBackground page="about">
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumb />
          </div>

          {/* Hero Section - Modern Layout */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center bg-red-600/20 backdrop-blur-sm rounded-full px-8 py-3 mb-8 border border-red-400/30">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-red-200 font-semibold text-lg">Pearl of Africa</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
                About Uganda's
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Investment Ecosystem
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-12">
                Uganda stands as Africa's fastest-growing economy, offering unparalleled opportunities 
                in agriculture, tourism, mining, and ICT sectors. Discover why global investors 
                choose Uganda as their gateway to East Africa.
              </p>
              
              {/* Quick Stats Inline */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>6.5% GDP Growth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>45M+ Population</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>East Africa Gateway</span>
                </div>
              </div>
            </motion.div>

          {/* Stats Grid - Professional Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  style={{
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-black text-white mb-3">{stat.value}</div>
                  <div className="text-sm text-yellow-400 font-bold mb-2">{stat.change}</div>
                  <div className="text-sm text-gray-300 leading-relaxed">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Vision & Mission - Modern Layout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-24"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 group hover:bg-white/15 transition-all duration-300"
              whileHover={{ y: -8 }}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FlagIcon className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To transform Uganda into a modern, prosperous country within 30 years by leveraging 
                our natural resources, strategic location, and human capital to create sustainable 
                economic growth and improved livelihoods for all Ugandans.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 group hover:bg-white/15 transition-all duration-300"
              whileHover={{ y: -8 }}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <RocketLaunchIcon className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To facilitate sustainable socio-economic development through strategic investments, 
                streamlined government services, and innovative solutions that position Uganda 
                as the preferred investment destination in East Africa.
              </p>
            </motion.div>
          </motion.div>

          {/* Key Sectors - Enhanced Layout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Investment Sectors</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore the key sectors driving Uganda's economic transformation and sustainable growth
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sectors.map((sector, index) => {
                const IconComponent = sector.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -8 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start space-x-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className={`w-8 h-8 ${sector.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-4">{sector.name}</h4>
                        <p className="text-gray-300 mb-6 leading-relaxed">{sector.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {sector.highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-500/30"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Why Choose Uganda - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Why Choose Uganda?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
              Discover the competitive advantages that make Uganda the premier investment destination in East Africa
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ y: -8 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GlobeAltIcon className="w-10 h-10 text-blue-400" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Strategic Location</h4>
                <p className="text-gray-300 leading-relaxed">
                  Gateway to East Africa with access to 300+ million people in the region through established trade agreements
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                whileHover={{ y: -8 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CubeIcon className="w-10 h-10 text-green-400" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Rich Resources</h4>
                <p className="text-gray-300 leading-relaxed">
                  Abundant natural resources including oil, minerals, fertile agricultural land, and renewable energy sources
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="w-10 h-10 text-red-400" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Business-Friendly</h4>
                <p className="text-gray-300 leading-relaxed">
                  Streamlined processes, comprehensive tax incentives, and dedicated government support for investors
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default AboutPage