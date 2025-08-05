import React from 'react'
import { motion } from 'framer-motion'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import AgencyDirectory from '../components/AgencyDirectory'

const AgenciesPage = () => {
  return (
    <PageBackground page="agencies">
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <span className="text-3xl mr-3">🏛️</span>
              <span className="text-white font-semibold">Government Agencies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Uganda Government
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Agency Directory
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Complete directory of all Uganda government agencies, regulatory bodies, and institutions. 
              Find contacts, services, and requirements for your business needs.
            </p>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-2">🏢</div>
              <div className="text-2xl font-bold text-white">25+</div>
              <div className="text-sm text-gray-300">Key Agencies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-sm text-gray-300">Services Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-300">Online Access</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-2xl font-bold text-white">15</div>
              <div className="text-sm text-gray-300">Languages Supported</div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AgencyDirectory />
          </motion.div>
        </div>
      </div>
    </PageBackground>
  )
}

export default AgenciesPage