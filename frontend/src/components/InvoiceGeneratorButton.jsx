// Professional Invoice Generator Button - Floating Action Button
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProfessionalInvoiceGenerator from './ProfessionalInvoiceGenerator'

const InvoiceGeneratorButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed top-1/2 right-4 -translate-y-1/2 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => {
            try {
              setIsOpen(true)
            } catch (error) {
              console.error('Failed to open invoice generator:', error)
            }
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-yellow-500 to-red-500 text-black p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Button Icon */}
          <motion.div
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </motion.div>

          {/* Ripple Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={isHovered ? { scale: 1.5, opacity: 0 } : { scale: 0, opacity: 0.6 }}
            transition={{ duration: 0.6 }}
          />

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 whitespace-nowrap"
              >
                <div className="bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                  Generate Professional Invoice
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-yellow-400 to-red-400 opacity-75 -z-10"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 blur-lg opacity-50 -z-20 scale-110"></div>
        </motion.button>

        {/* Secondary Action Buttons */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full mb-4 right-0 space-y-3"
            >
              {/* Quick Invoice Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  try {
                    setIsOpen(true)
                  } catch (error) {
                    console.error('Failed to open quick invoice:', error)
                  }
                }}
                className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors group/quick"
                title="Quick Invoice"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.button>

              {/* Template Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  try {
                    setIsOpen(true)
                  } catch (error) {
                    console.error('Failed to open invoice templates:', error)
                  }
                }}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors group/template"
                title="Invoice Templates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <motion.div
          className="absolute -top-2 -left-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            NEW
          </div>
        </motion.div>
      </motion.div>

      {/* Professional Invoice Generator Modal */}
      <ProfessionalInvoiceGenerator
        isOpen={isOpen}
        onClose={() => {
          try {
            setIsOpen(false)
          } catch (error) {
            console.error('Failed to close invoice generator:', error)
          }
        }}
      />
    </>
  )
}

export default InvoiceGeneratorButton