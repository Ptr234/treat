'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvestmentData } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

export default function InvestmentOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { addNotification } = useNotification();
  const [investmentData, setInvestmentData] = useState<InvestmentData>({
    // Step 1: Investment Profile
    investorType: '', 
    experience: '', 
    investmentGoal: '', 
    
    // Step 2: Investment Capacity
    investmentAmount: '',
    timeHorizon: '', 
    riskTolerance: '', 
    
    // Step 3: Sector Interest
    primarySector: '', 
    secondarySectors: [],
    specificInterests: '',
    
    // Step 4: Personal/Entity Details
    name: '',
    email: '',
    phone: '',
    nationality: '',
    companyName: '',
    position: '',
    
    // Step 5: Investment Readiness
    capitalSource: '', 
    timeframe: '', 
    supportNeeded: [] 
  });

  const totalSteps = 5;

  const updateData = (field: keyof InvestmentData, value: string) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateArrayField = (field: 'secondarySectors' | 'supportNeeded', value: string) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return investmentData.investorType && investmentData.experience && investmentData.investmentGoal;
      case 2:
        return investmentData.investmentAmount && investmentData.timeHorizon && investmentData.riskTolerance;
      case 3:
        return investmentData.primarySector;
      case 4:
        return investmentData.name && investmentData.email && investmentData.phone && investmentData.nationality;
      case 5:
        return investmentData.capitalSource && investmentData.timeframe;
      default:
        return true;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ referenceNumber: string; existing: boolean } | null>(null);

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/investors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investmentData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Submission failed');
      }

      setSubmitResult({ referenceNumber: json.data.referenceNumber, existing: json.data.existing });

      addNotification({
        type: 'success',
        title: json.data.existing
          ? 'Profile Already Exists'
          : 'Application Submitted Successfully!',
        message: json.data.existing
          ? `We already have your profile on file (${json.data.referenceNumber}). Our team will be in touch.`
          : `Your investor reference is ${json.data.referenceNumber}. Our investment team will contact you within 24 hours.`,
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: err instanceof Error ? err.message : 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Investor Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'individual', label: 'Individual Investor', description: 'Personal investment' },
                  { value: 'institutional', label: 'Institutional Investor', description: 'Company or organization' },
                  { value: 'foreign', label: 'Foreign Investor', description: 'International investment' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      investmentData.investorType === option.value
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateData('investorType', option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="investorType"
                        value={option.value}
                        checked={investmentData.investorType === option.value}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Investment Experience
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'beginner', label: 'Beginner', description: 'New to investing' },
                  { value: 'intermediate', label: 'Intermediate', description: 'Some investment experience' },
                  { value: 'advanced', label: 'Advanced', description: 'Experienced investor' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      investmentData.experience === option.value
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateData('experience', option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={investmentData.experience === option.value}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Investment Goal
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'growth', label: 'Growth', description: 'Capital appreciation' },
                  { value: 'income', label: 'Income', description: 'Regular returns' },
                  { value: 'diversification', label: 'Diversification', description: 'Portfolio expansion' },
                  { value: 'strategic', label: 'Strategic', description: 'Business expansion' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      investmentData.investmentGoal === option.value
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateData('investmentGoal', option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="investmentGoal"
                        value={option.value}
                        checked={investmentData.investmentGoal === option.value}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Capacity</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USD)
              </label>
              <select
                value={investmentData.investmentAmount}
                onChange={(e) => updateData('investmentAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
              >
                <option value="">Select investment range</option>
                <option value="10000-50000">$10,000 - $50,000</option>
                <option value="50000-100000">$50,000 - $100,000</option>
                <option value="100000-500000">$100,000 - $500,000</option>
                <option value="500000-1000000">$500,000 - $1,000,000</option>
                <option value="1000000+">$1,000,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Horizon
              </label>
              <select
                value={investmentData.timeHorizon}
                onChange={(e) => updateData('timeHorizon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
              >
                <option value="">Select time horizon</option>
                <option value="short-term">Short-term (1-3 years)</option>
                <option value="medium-term">Medium-term (3-7 years)</option>
                <option value="long-term">Long-term (7+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Tolerance
              </label>
              <select
                value={investmentData.riskTolerance}
                onChange={(e) => updateData('riskTolerance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
              >
                <option value="">Select risk tolerance</option>
                <option value="conservative">Conservative (Low risk, stable returns)</option>
                <option value="moderate">Moderate (Balanced risk and return)</option>
                <option value="aggressive">Aggressive (High risk, high potential return)</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Sector Interest</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Sector
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'agriculture', label: 'Agriculture & Agro-processing', icon: '🌾' },
                  { value: 'tourism', label: 'Tourism & Hospitality', icon: '🏖️' },
                  { value: 'minerals', label: 'Mining & Minerals', icon: '⛏️' },
                  { value: 'ict', label: 'ICT & Digital Services', icon: '💻' },
                  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
                  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      investmentData.primarySector === option.value
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateData('primarySector', option.value)}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Interests (Optional)
              </label>
              <textarea
                value={investmentData.specificInterests}
                onChange={(e) => updateData('specificInterests', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                rows={4}
                placeholder="Describe your specific investment interests..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={investmentData.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={investmentData.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={investmentData.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <input
                  type="text"
                  value={investmentData.nationality}
                  onChange={(e) => updateData('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter your nationality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={investmentData.companyName}
                  onChange={(e) => updateData('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position (Optional)
                </label>
                <input
                  type="text"
                  value={investmentData.position}
                  onChange={(e) => updateData('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
                  placeholder="Enter your position"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Readiness</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Source
              </label>
              <select
                value={investmentData.capitalSource}
                onChange={(e) => updateData('capitalSource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
              >
                <option value="">Select capital source</option>
                <option value="savings">Personal Savings</option>
                <option value="loan">Bank Loan</option>
                <option value="partnership">Partnership/Joint Venture</option>
                <option value="grant">Grant/Government Funding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Timeframe
              </label>
              <select
                value={investmentData.timeframe}
                onChange={(e) => updateData('timeframe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black min-h-[44px]"
              >
                <option value="">Select timeframe</option>
                <option value="immediate">Immediate (Ready now)</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="1-year">Within 1 year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Support Needed (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'legal', label: 'Legal Support' },
                  { value: 'financial', label: 'Financial Advisory' },
                  { value: 'technical', label: 'Technical Assistance' },
                  { value: 'marketing', label: 'Marketing Support' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      investmentData.supportNeeded.includes(option.value)
                        ? 'border-yellow-600 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateArrayField('supportNeeded', option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={investmentData.supportNeeded.includes(option.value)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div className="font-medium text-gray-900">{option.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between min-w-[280px]">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 text-sm sm:text-base ${
                  currentStep >= step
                    ? 'border-yellow-600 bg-yellow-600 text-black'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!validateCurrentStep()}
            className="px-6 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitApplication}
            disabled={!validateCurrentStep() || isSubmitting}
            className="px-6 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>

      {/* Success result */}
      {submitResult && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-green-800 font-bold text-lg mb-2">
            {submitResult.existing ? 'Profile Found' : 'Profile Created Successfully'}
          </div>
          <p className="text-green-700 mb-2">
            Your investor reference number is:
          </p>
          <p className="text-2xl font-mono font-bold text-green-900 mb-4">
            {submitResult.referenceNumber}
          </p>
          <p className="text-sm text-green-600">
            Our investment team will contact you within 24 hours. Check your email for confirmation.
          </p>
        </div>
      )}
    </div>
  );
}