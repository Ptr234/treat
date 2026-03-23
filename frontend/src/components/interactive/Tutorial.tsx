'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string | null;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TutorialStep[];
  autoStart?: boolean;
}

export default function Tutorial({ isOpen, onClose, steps = [], autoStart = false }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  const defaultSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to OneStopCentre Uganda',
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
      id: 'tools',
      title: 'Business Tools',
      content: 'Calculate taxes, analyze ROI, and generate professional invoices with our comprehensive business tools.',
      target: '[href="/tools"]',
      position: 'bottom'
    },
    {
      id: 'complete',
      title: 'Tutorial Complete!',
      content: 'You\'re now ready to explore Uganda\'s investment opportunities. Click anywhere to start your journey.',
      target: null,
      position: 'center'
    }
  ];

  const tutorialSteps = steps.length > 0 ? steps : defaultSteps;

  useEffect(() => {
    if (isOpen && autoStart) {
      setIsVisible(true);
    }
  }, [isOpen, autoStart]);

  const highlightTarget = useCallback((target: string | null) => {
    if (!target) {
      setHighlightElement(null);
      return;
    }

    const element = document.querySelector(target) as HTMLElement;
    if (element) {
      setHighlightElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    if (isVisible && tutorialSteps[currentStep]) {
      highlightTarget(tutorialSteps[currentStep].target || null);
    }
  }, [currentStep, isVisible, highlightTarget, tutorialSteps]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    setIsVisible(false);
    setHighlightElement(null);
    onClose();
  };

  const skipTutorial = () => {
    closeTutorial();
  };

  if (!isOpen && !isVisible) return null;

  const currentStepData = tutorialSteps[currentStep];
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={skipTutorial} />
      
      {/* Highlight */}
      {highlightElement && (
        <div
          className="fixed border-4 border-yellow-500 rounded-lg pointer-events-none z-[60] animate-pulse"
          style={{
            top: highlightElement.offsetTop - 4,
            left: highlightElement.offsetLeft - 4,
            width: highlightElement.offsetWidth + 8,
            height: highlightElement.offsetHeight + 8,
          }}
        />
      )}

      {/* Tutorial Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-[70] bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 ${
              currentStepData?.position === 'center' 
                ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                : 'top-20 right-4'
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentStepData?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </p>
                </div>
                <button
                  onClick={closeTutorial}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close tutorial"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {currentStepData?.content}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentStep === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={skipTutorial}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Skip
                </button>
              </div>
              
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700 transition-all"
              >
                <span>
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </span>
                {currentStep < tutorialSteps.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}