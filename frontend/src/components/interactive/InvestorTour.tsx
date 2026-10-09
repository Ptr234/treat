'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface InvestorProfile {
  tier: string;
  amount: string;
  icon: string;
  color: string;
  benefits: string[];
  successRate: string;
}

interface InvestmentStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  visual: string;
  keyPoints?: string[];
  profiles?: InvestorProfile[];
  action?: string;
  nextStep?: string;
}

interface InvestorTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InvestorTour({ isOpen, onClose }: InvestorTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<InvestorProfile | null>(null);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const investmentSteps: InvestmentStep[] = [
    {
      id: 1,
      title: "Welcome to Uganda Investment Authority",
      subtitle: "Your Premium Investment Journey Starts Here",
      description: "Uganda offers Africa's most investor-friendly environment with 97% fast-track approval rates, 10-year tax holidays, and direct government support.",
      visual: "🇺🇬",
      keyPoints: [
        "FDI grew 79.2% to $2.9B in 2023",
        "GDP growth 6.5% projected for 2024/25",
        "15-35% ROI potential across sectors",
        "Presidential committee access for $5M+ investments"
      ],
      action: "Start Your Investment Assessment",
      nextStep: "Let's determine your investor profile"
    },
    {
      id: 2,
      title: "Investment Profile Assessment",
      subtitle: "Choose Your Investment Tier",
      description: "Select your investment level to unlock tier-specific benefits and fast-track services.",
      visual: "💎",
      profiles: [
        {
          tier: "Major Investor",
          amount: "$5M+",
          icon: "🏦",
          color: "from-neutral-800 to-yellow-700",
          benefits: ["Presidential Committee Access", "15-day Guaranteed Approval", "Single Window Clearance", "Dedicated Task Force"],
          successRate: "97%"
        },
        {
          tier: "Premium Investor",
          amount: "$1M+",
          icon: "💎",
          color: "from-yellow-600 to-yellow-700",
          benefits: ["Dedicated Investment Officer", "Ministerial Liaison", "Fast-track Processing", "Monthly Reviews"],
          successRate: "95%"
        },
        {
          tier: "Standard Investor",
          amount: "$100K+",
          icon: "🚀",
          color: "from-yellow-500 to-yellow-600",
          benefits: ["Priority Processing", "Investment Guidance", "Sector Specialist", "Quarterly Updates"],
          successRate: "92%"
        },
        {
          tier: "Emerging Investor",
          amount: "$10K+",
          icon: "🌱",
          color: "from-yellow-400 to-yellow-500",
          benefits: ["Standard Processing", "General Support", "Online Resources", "Annual Review"],
          successRate: "87%"
        }
      ]
    },
    {
      id: 3,
      title: "Investment Sectors Overview",
      subtitle: "High-Growth Opportunities Await",
      description: "Explore Uganda's priority sectors with proven track records and government support.",
      visual: "🏭",
      keyPoints: [
        "Agriculture: 30% of GDP, huge export potential",
        "Tourism: $1.8B annual revenue, growing 15% yearly",
        "ICT: 40% growth rate, digital transformation hub",
        "Manufacturing: Value addition focus, export incentives",
        "Mining: Untapped mineral wealth, new discoveries",
        "Energy: 20,000 MW hydro potential, solar expansion"
      ]
    },
    {
      id: 4,
      title: "ATMS Investment Incentives",
      subtitle: "Maximize Your Returns with Government Support",
      description: "Uganda's Amended Tax Measures Scheme (ATMS) offers substantial tax benefits for qualified investments.",
      visual: "💰",
      keyPoints: [
        "5-10 years corporate tax holidays",
        "VAT exemption on machinery and equipment",
        "Withholding tax exemptions",
        "Accelerated depreciation allowances",
        "Duty-free importation of inputs",
        "Currency convertibility guarantees"
      ]
    }
  ];

  const nextStep = useCallback(() => {
    if (currentStep < investmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  }, [currentStep, investmentSteps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const selectProfile = useCallback((profile: InvestorProfile) => {
    setUserProfile(profile);
    nextStep();
  }, [nextStep]);

  const startInvestment = useCallback(() => {
    onClose();
    router.push('/investments');
  }, [onClose, router]);

  const scheduleConsultation = useCallback(() => {
    onClose();
    router.push('/support');
  }, [onClose, router]);

  if (!isOpen) return null;

  const currentStepData = investmentSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-neutral-100 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-t border-neutral-200 pt-5"
      >
        {/* Header */}
        <div className="p-6 -b text-black border-t border-neutral-200 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentStepData?.title}</h2>
              <p className="text-black mt-1">{currentStepData?.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-md"
              aria-label="Close tour"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {investmentSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentStep ? 'bg-yellow-300' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-black mt-2">
              Step {currentStep + 1} of {investmentSteps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* initial={false}: step 1 is already visible in the server-rendered
              HTML, so it must not depend on the mount animation to reveal it —
              a hydration mismatch elsewhere on the page (e.g. browser-injected
              autofill styling on a form input) can leave that animation stuck
              at opacity:0, permanently hiding the step. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{currentStepData?.visual}</div>
                <p className="text-xl text-neutral-800 leading-relaxed max-w-3xl mx-auto">
                  {currentStepData?.description}
                </p>
              </div>

              {/* Key Points */}
              {currentStepData?.keyPoints && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStepData?.keyPoints?.map((point, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-neutral-50 rounded-md">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-neutral-800 font-medium">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Profiles */}
              {currentStepData?.profiles && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentStepData?.profiles?.map((profile, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectProfile(profile)}
                        className={`cursor-pointer rounded-md p-6 text-white bg-gradient-to-br ${profile.color}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-3xl mb-2">{profile.icon}</div>
                            <h3 className="text-xl font-bold">{profile.tier}</h3>
                            <p className="text-lg opacity-90">{profile.amount}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{profile.successRate}</div>
                            <div className="text-sm opacity-75">Success Rate</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {profile.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 border-t border-neutral-200 pt-5"></div>
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results/Summary */}
              {showResults && userProfile && (
                <div className="mb-8 bg-yellow-50 p-6 border-t border-neutral-200 pt-5">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    🎉 Congratulations! You qualify for {userProfile.tier} status
                  </h3>
                  <p className="text-red-600 mb-4">
                    Based on your investment level, you have access to premium benefits and fast-track services.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-t border-neutral-200 pt-5">
                      <h4 className="font-semibold text-black mb-2">Your Benefits:</h4>
                      <ul className="space-y-1">
                        {userProfile.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-neutral-800 flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 border-t border-neutral-200 pt-5">
                      <h4 className="font-semibold text-black mb-2">Next Steps:</h4>
                      <ul className="space-y-1 text-sm text-neutral-800">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <span>Explore investment opportunities</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <span>Schedule consultation</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          <span>Submit application</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 -t border-t border-neutral-200 pt-5">
          {showResults ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startInvestment}
                className="gov-btn gov-btn--gold"
              >
                Start Investing Now
              </button>
              <button
                onClick={scheduleConsultation}
                className="px-8 py-3 bg-black text-white rounded-md font-semibold hover:bg-[#262522] transition-colors"
              >
                Schedule Consultation
              </button>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                  currentStep === 0 
                    ? 'text-neutral-500 cursor-not-allowed' 
                    : 'text-neutral-800 hover:bg-gray-200'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="text-neutral-700 hover:text-neutral-800 px-6 py-3 rounded-md hover:bg-gray-200 transition-all"
                >
                  Skip Tour
                </button>
                
                {currentStepData?.profiles ? (
                  <p className="text-neutral-700 px-6 py-3">
                    Select a tier to continue
                  </p>
                ) : (
                  <button
                    onClick={nextStep}
                    className="gov-btn"
                  >
                    <span>
                      {currentStep === investmentSteps.length - 1 ? 'Complete Tour' : 'Continue'}
                    </span>
                    {currentStep < investmentSteps.length - 1 && (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}