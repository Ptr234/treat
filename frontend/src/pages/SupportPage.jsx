import React from 'react'
import { motion } from 'framer-motion'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Support from '../components/Support'

const SupportPage = () => {
  const supportOptions = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help with our AI-powered chat assistant',
      icon: '💬',
      availability: '24/7',
      response: 'Instant'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our expert consultants',
      icon: '📞',
      availability: 'Mon-Fri 8AM-6PM',
      response: 'Immediate'
    },
    {
      title: 'Email Support',
      description: 'Detailed responses to complex inquiries',
      icon: '✉️',
      availability: '24/7',
      response: 'Within 2 hours'
    },
    {
      title: 'Video Consultation',
      description: 'One-on-one guidance for investment planning',
      icon: '🎥',
      availability: 'By Appointment',
      response: 'Scheduled'
    }
  ]

  const faqs = [
    {
      question: 'How long does it take to register a business in Uganda?',
      answer: 'Business registration through URSB typically takes 3-5 working days for online applications and 7-10 days for manual applications. Our streamlined process can help expedite this.'
    },
    {
      question: 'What are the minimum capital requirements for foreign investors?',
      answer: 'Foreign investors must invest a minimum of USD 100,000 for businesses involving Ugandans, or USD 500,000 for wholly foreign-owned enterprises, excluding land and working capital.'
    },
    {
      question: 'Which sectors offer the best tax incentives?',
      answer: 'ATMS sectors (Agriculture, Tourism, Mining, ICT) offer the most attractive incentives including corporate tax holidays, import duty exemptions, and accelerated depreciation allowances.'
    },
    {
      question: 'How do I obtain a work permit for foreign employees?',
      answer: 'Work permits are processed through the Ministry of Internal Affairs. Requirements include proof of qualifications, job offer letter, and evidence of skills transfer to Ugandans.'
    }
  ]

  return (
    <PageBackground page="support">
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
              <span className="text-3xl mr-3">🤝</span>
              <span className="text-white font-semibold">Expert Support</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get Expert Help
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Every Step of the Way
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Our team of investment consultants and government relations experts are here to guide 
              you through every aspect of doing business in Uganda. From initial planning to ongoing operations.
            </p>
          </motion.div>

          {/* Support Options */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                <p className="text-gray-300 mb-4 text-sm">{option.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-yellow-400">{option.availability}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Response:</span>
                    <span className="text-green-400">{option.response}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-300">
                Quick answers to common investment and business questions
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                    <span className="text-yellow-400 mr-2">Q:</span>
                    {faq.question}
                  </h4>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    <span className="text-green-400 mr-2">A:</span>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main Support Component */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Support />
          </motion.div>
        </div>
      </div>
    </PageBackground>
  )
}

export default SupportPage