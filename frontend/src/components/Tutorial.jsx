import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const Tutorial = ({ isOpen, onClose, steps = [], autoStart = false }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [highlightElement, setHighlightElement] = useState(null)
  const { addNotification } = useNotification()

  const defaultSteps = [
    {
      id: 'welcome',
      title: 'Welcome to OneStopCentre uganda',
      content: 'Let us guide you through the features of Uganda\'s official investment and business services portal.',
      target: null,
      position: 'center'
    },
    {
      id: 'navigation',
      title: 'Navigation Menu',
      content: 'Use the header menu to navigate between Investments, Services, Tax Calculator, and other sections.',
      target: 'header',
      position: 'bottom'
    },
    {
      id: 'investments',
      title: 'Investment Opportunities',
      content: 'Explore ATMS sector investments with detailed information about ROI, incentives, and application processes.',
      target: '[href="/investments"]',
      position: 'bottom'
    },
    {
      id: 'services',
      title: 'Government Services',
      content: 'Access official government services for business registration, licensing, and compliance through URSB, URA, and other agencies.',
      target: '[href="/services"]',
      position: 'bottom'
    },
    {
      id: 'calculator',
      title: 'Tax Calculator',
      content: 'Calculate your tax obligations and explore investment incentives with our advanced tax calculator.',
      target: '[href="/calculator"]',
      position: 'bottom'
    },
    {
      id: 'search',
      title: 'Smart Search',
      content: 'Use the search feature to quickly find investments, services, or agencies that match your needs.',
      target: '[title="Search"]',
      position: 'bottom'
    }
  ]

  const tutorialSteps = steps.length > 0 ? steps : defaultSteps

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      if (autoStart) {
        setCurrentStep(0)
      }
    } else {
      setIsVisible(false)
      setHighlightElement(null)
    }
  }, [isOpen, autoStart])

  useEffect(() => {
    if (isVisible && tutorialSteps[currentStep]) {
      const step = tutorialSteps[currentStep]
      if (step.target) {
        const element = document.querySelector(step.target)
        if (element) {
          setHighlightElement(element)
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        setHighlightElement(null)
      }
    }
  }, [currentStep, isVisible, tutorialSteps])

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Tutorial completed
      setIsVisible(false)
      setHighlightElement(null)
      onClose()
      addNotification({
        type: 'success',
        title: 'Tutorial Completed!',
        message: 'You\'re ready to explore OneStopCentre Uganda. Welcome aboard!',
        duration: 5000
      })
    }
  }, [currentStep, tutorialSteps.length, onClose, addNotification])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(() => {
    setIsVisible(false)
    setHighlightElement(null)
    onClose()
    addNotification({
      type: 'info',
      title: 'Tutorial Skipped',
      message: 'You can restart the tutorial anytime from the help menu.',
      duration: 3000
    })
  }, [onClose, addNotification])

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.length) {
      setCurrentStep(stepIndex)
    }
  }, [tutorialSteps.length])

  const getTooltipPosition = (target, position) => {
    if (!target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const rect = target.getBoundingClientRect()
    const tooltipOffset = 20
    
    switch (position) {
      case 'top':
        return {
          top: rect.top - tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        }
      case 'bottom':
        return {
          top: rect.bottom + tooltipOffset,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        }
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - tooltipOffset,
          transform: 'translate(-100%, -50%)'
        }
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + tooltipOffset,
          transform: 'translate(0, -50%)'
        }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  if (!isVisible) return null

  const currentStepData = tutorialSteps[currentStep]
  const tooltipStyle = highlightElement ? 
    getTooltipPosition(highlightElement, currentStepData?.position) : 
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Dark overlay with cutout for highlighted element */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            
            {/* Highlight effect for target element */}
            {highlightElement && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: highlightElement.getBoundingClientRect().top - 8,
                  left: highlightElement.getBoundingClientRect().left - 8,
                  width: highlightElement.getBoundingClientRect().width + 16,
                  height: highlightElement.getBoundingClientRect().height + 16,
                  background: 'transparent',
                  border: '3px solid #3B82F6',
                  borderRadius: '12px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5)',
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </div>

          {/* Tutorial Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 pointer-events-auto"
            style={tooltipStyle}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-80 border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{currentStepData?.title}</h3>
                    <p className="text-xs text-gray-500">Step {currentStep + 1} of {tutorialSteps.length}</p>
                  </div>
                </div>
                <button
                  onClick={skipTutorial}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close tutorial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{currentStepData?.content}</p>
              </div>

              {/* Progress Indicators */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentStep 
                        ? 'bg-blue-600 scale-125' 
                        : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={skipTutorial}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    Skip
                  </button>
                  
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-1"
                  >
                    <span>{currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}</span>
                    {currentStep < tutorialSteps.length - 1 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Arrow pointer */}
            {highlightElement && currentStepData?.position !== 'center' && (
              <div
                className={`absolute w-0 h-0 ${
                  currentStepData?.position === 'top' ? 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white -bottom-2 left-1/2 transform -translate-x-1/2' :
                  currentStepData?.position === 'bottom' ? 'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white -top-2 left-1/2 transform -translate-x-1/2' :
                  currentStepData?.position === 'left' ? 'border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white -right-2 top-1/2 transform -translate-y-1/2' :
                  currentStepData?.position === 'right' ? 'border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white -left-2 top-1/2 transform -translate-y-1/2' :
                  ''
                }`}
              />
            )}
          </motion.div>

          {/* Tutorial Controls (Mini Toolbar) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200 flex items-center space-x-3">
              <div className="text-xs text-gray-500 font-medium">
                {currentStep + 1}/{tutorialSteps.length}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous step"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextStep}
                  className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  title={currentStep === tutorialSteps.length - 1 ? 'Finish tutorial' : 'Next step'}
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={skipTutorial}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-2 border-l border-gray-200 pl-3"
                  title="Skip tutorial"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Tutorial Hook for easy usage
export const useTutorial = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [steps, setSteps] = useState([])

  const startTutorial = useCallback((tutorialSteps = []) => {
    setSteps(tutorialSteps)
    setIsOpen(true)
  }, [])

  const closeTutorial = useCallback(() => {
    setIsOpen(false)
    setSteps([])
  }, [])

  return {
    isOpen,
    steps,
    startTutorial,
    closeTutorial,
    Tutorial: (props) => (
      <Tutorial
        isOpen={isOpen}
        onClose={closeTutorial}
        steps={steps}
        {...props}
      />
    )
  }
}

export default Tutorial