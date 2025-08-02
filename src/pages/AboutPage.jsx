import React from 'react'
import { motion } from 'framer-motion'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'

const AboutPage = () => {
  const stats = [
    { label: 'Foreign Direct Investment (2023)', value: '$2.9B+', change: '+79.2%', icon: '💰' },
    { label: 'GDP Growth Rate', value: '6.5%', change: 'Annual', icon: '📈' },
    { label: 'New Businesses Registered', value: '50,893', change: '2023', icon: '🏢' },
    { label: 'Government Services Available', value: '150+', change: 'Streamlined', icon: '🏛️' }
  ]

  const sectors = [
    {
      name: 'Agriculture, Tourism, Mining & ICT (ATMS)',
      description: 'Priority sectors driving Uganda\'s economic transformation',
      icon: '🌾',
      highlights: ['Food Security', 'Tourism Growth', 'Mineral Wealth', 'Digital Innovation']
    },
    {
      name: 'Manufacturing',
      description: 'Value addition and industrial development',
      icon: '🏭',
      highlights: ['Agro-processing', 'Textiles', 'Steel & Iron', 'Pharmaceuticals']
    },
    {
      name: 'Energy',
      description: 'Renewable energy and power generation',
      icon: '⚡',
      highlights: ['Hydroelectric', 'Solar Power', 'Oil & Gas', 'Grid Extension']
    },
    {
      name: 'Infrastructure',
      description: 'Transportation and connectivity projects',
      icon: '🛣️',
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

          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <span className="text-3xl mr-3">🇺🇬</span>
              <span className="text-white font-semibold">Pearl of Africa</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About Uganda's
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Investment Landscape
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Uganda stands as Africa's fastest-growing economy, offering unparalleled opportunities 
              in agriculture, tourism, mining, and ICT sectors. Discover why global investors 
              choose Uganda as their gateway to East Africa.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-yellow-400 font-semibold mb-1">{stat.change}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Vision & Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To transform Uganda into a modern, prosperous country within 30 years by leveraging 
                our natural resources, strategic location, and human capital to create sustainable 
                economic growth and improved livelihoods for all Ugandans.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To facilitate sustainable socio-economic development through strategic investments, 
                streamlined government services, and innovative solutions that position Uganda 
                as the preferred investment destination in East Africa.
              </p>
            </div>
          </motion.div>

          {/* Key Sectors */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Investment Sectors</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Explore the key sectors driving Uganda's economic transformation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectors.map((sector, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{sector.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{sector.name}</h4>
                      <p className="text-gray-300 mb-4">{sector.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {sector.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Uganda */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-12">Why Choose Uganda?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🌍</div>
                <h4 className="text-xl font-bold text-white mb-3">Strategic Location</h4>
                <p className="text-gray-300">
                  Gateway to East Africa with access to 300+ million people in the region
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">💎</div>
                <h4 className="text-xl font-bold text-white mb-3">Rich Resources</h4>
                <p className="text-gray-300">
                  Abundant natural resources including oil, minerals, fertile land, and water
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-xl font-bold text-white mb-3">Business-Friendly</h4>
                <p className="text-gray-300">
                  Streamlined processes, tax incentives, and strong government support
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default AboutPage