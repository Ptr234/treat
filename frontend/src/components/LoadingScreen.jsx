import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('Initializing')

  const loadingSteps = useMemo(() => [
    'Initializing investment platform',
    'Loading market data',
    'Connecting to investment services',
    'Preparing dashboard',
    'Ready to invest'
  ], [])

  useEffect(() => {
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length - 1) {
        currentStep++
        setLoadingText(loadingSteps[currentStep])
      }
    }, 800)

    return () => clearInterval(interval)
  }, [loadingSteps])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)'
      }}
    >
      <div className="text-center text-white max-w-md mx-auto px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          {/* Professional Logo with 3D Effects */}
          <motion.div 
            className="relative w-24 h-24 mx-auto mb-6"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div 
              className="w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-2xl"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)',
                boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
              }}
            >
              <img 
                src="/images/oneStopCenter-logo.jpeg" 
                alt="OneStopCentre Uganda" 
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-xl items-center justify-center text-white font-bold text-xl">
                UG
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              OneStopCentre
            </h1>
            <p className="text-xl font-semibold text-blue-400 mb-2">Uganda</p>
            <p className="text-sm text-gray-300">Professional Investment Platform</p>
          </motion.div>
        </motion.div>

        {/* Enhanced Loading Animation */}
        <motion.div className="mb-8">
          <motion.div
            className="flex justify-center space-x-1 mb-4"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </motion.div>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
        
        {/* Dynamic Loading Text */}
        <motion.div
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-300 mb-6"
        >
          {loadingText}...
        </motion.div>

        {/* Feature Icons */}
        <motion.div 
          className="flex justify-center space-x-8 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <SparklesIcon className="w-5 h-5" />
          </motion.div>
          <motion.div
            animate={{ y: [2, -2, 2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <ChartBarIcon className="w-5 h-5" />
          </motion.div>
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <CurrencyDollarIcon className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen