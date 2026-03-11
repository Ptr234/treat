'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WizardOption {
  id: string;
  title: string;
  description?: string;
  icon: string;
}

interface WizardStep {
  id: string;
  title: string;
  options: WizardOption[];
  condition?: (answers: Record<string, string>) => boolean;
}

interface ServiceWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceWizard({ isOpen, onClose }: ServiceWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const steps = useMemo<WizardStep[]>(() => [
    {
      id: 'purpose',
      title: 'What brings you to Uganda\'s investment platform?',
      options: [
        { 
          id: 'new-investment', 
          title: 'Start New Investment', 
          description: 'Explore sectors and begin your investment journey',
          icon: '💰'
        },
        { 
          id: 'existing-investment', 
          title: 'Manage Existing Investment', 
          description: 'Support services for current investors',
          icon: '📊'
        },
        { 
          id: 'start-business', 
          title: 'Business Registration', 
          description: 'Register your business and get required permits',
          icon: '🏢'
        },
        { 
          id: 'government-services', 
          title: 'Government Services', 
          description: 'Immigration, taxes, and regulatory compliance',
          icon: '📋'
        }
      ]
    },
    {
      id: 'business-type',
      title: 'What type of business?',
      condition: (answers) => answers.purpose === 'start-business',
      options: [
        { 
          id: 'company', 
          title: 'Private Limited Company', 
          description: 'Most common business structure for companies',
          icon: '🏢'
        },
        { 
          id: 'partnership', 
          title: 'Partnership', 
          description: 'Business owned by two or more people',
          icon: '🤝'
        },
        { 
          id: 'sole-proprietorship', 
          title: 'Sole Proprietorship', 
          description: 'Individual business ownership',
          icon: '👤'
        },
        { 
          id: 'ngo', 
          title: 'NGO/Non-Profit', 
          description: 'Non-governmental organization',
          icon: '🎯'
        }
      ]
    },
    {
      id: 'investment-sector',
      title: 'Which investment sector interests you?',
      condition: (answers) => answers.purpose === 'new-investment' || answers.purpose === 'start-business',
      options: [
        { id: 'agriculture', title: 'Agriculture & Agro-processing', icon: '🌾', description: 'Food security and export opportunities' },
        { id: 'tourism', title: 'Tourism & Hospitality', icon: '🏖️', description: '$1.8B annual revenue sector' },
        { id: 'manufacturing', title: 'Manufacturing & Industry', icon: '🏭', description: 'Value addition and job creation' },
        { id: 'ict', title: 'ICT & Digital Services', icon: '💻', description: 'Tech innovation and digital transformation' },
        { id: 'mining', title: 'Mining & Energy', icon: '⛏️', description: 'Natural resources and renewable energy' },
        { id: 'infrastructure', title: 'Infrastructure & Construction', icon: '🏗️', description: 'Roads, buildings, and development' }
      ]
    }
  ], []);

  const completeWizard = useCallback(() => {
    // Generate recommendations based on answers
    const { purpose, 'investment-sector': sector } = answers;
    
    let route = '/investments';
    if (purpose === 'new-investment') {
      route = sector ? `/investments?sector=${sector}` : '/investments';
    } else if (purpose === 'existing-investment') {
      route = '/services?category=Investment Support';
    } else if (purpose === 'start-business') {
      route = '/business/registration';
    } else if (purpose === 'government-services') {
      route = '/services';
    }
    
    onClose();
    router.push(route as '/investments' | '/services' | '/business/registration');
  }, [answers, router, onClose]);

  const handleAnswer = useCallback((stepId: string, answerId: string) => {
    const newAnswers = { ...answers, [stepId]: answerId };
    setAnswers(newAnswers);
    
    // Find next relevant step
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      const nextStepData = steps[nextStep];
      if (!nextStepData?.condition || nextStepData.condition(newAnswers)) {
        setCurrentStep(nextStep);
      } else {
        // Skip to next relevant step or finish
        completeWizard();
      }
    } else {
      completeWizard();
    }
  }, [currentStep, answers, steps, completeWizard]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const currentStepData = steps[currentStep];
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Investment Pathway Finder</h2>
              <p className="text-gray-600 mt-1">Let us guide you to the right investment opportunities and services</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close wizard"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentStep ? 'bg-yellow-700' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentStepData?.title}
              </h3>
              
              <div className="grid gap-3">
                {currentStepData?.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentStepData?.id || '', option.id)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 text-left group focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-yellow-700">
                          {option.title}
                        </h4>
                        {option.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-600" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            Skip & Browse All Services
          </button>
        </div>
      </motion.div>
    </div>
  );
}