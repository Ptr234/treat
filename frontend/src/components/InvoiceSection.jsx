import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InvoiceGenerator from './InvoiceGenerator'

const InvoiceSection = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleInvoiceGenerator = () => {
    setIsOpen(!isOpen)
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Clickable Invoice Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div
            onClick={toggleInvoiceGenerator}
            className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-yellow-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    📄 Invoice Generator
                  </h3>
                  <p className="text-black/80 text-lg">
                    Create professional invoices for government services instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <div className="text-black font-semibold">
                    ✨ Free Tool
                  </div>
                  <div className="text-black/70 text-sm">
                    Generate & Download PDF
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            </div>
            
            {/* Features preview */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-black font-medium text-sm">Instant Generation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-black font-medium text-sm">UGX Currency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📱</div>
                <div className="text-black font-medium text-sm">Mobile Friendly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🏛️</div>
                <div className="text-black font-medium text-sm">Gov Services</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 rounded-full text-sm font-medium">
                {isOpen ? '👆 Click to Hide' : '👇 Click to Open'} Invoice Generator
              </span>
            </div>
          </div>
        </motion.div>

        {/* Animated Invoice Generator */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 p-2">
                <InvoiceGenerator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats when closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📊</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600">Invoices Generated</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="text-3xl mr-4">⏱️</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">&lt;2 min</div>
                  <div className="text-gray-600">Average Generation Time</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-black">
              <div className="flex items-center">
                <div className="text-3xl mr-4">💯</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">Free</div>
                  <div className="text-gray-600">No Hidden Charges</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default InvoiceSection