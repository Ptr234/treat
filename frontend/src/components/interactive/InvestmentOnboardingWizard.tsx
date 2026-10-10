'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAccountEmail } from '@/hooks/useAccountEmail';
import AccountEmailHint from '@/components/ui/AccountEmailHint';
import { motion, AnimatePresence } from 'framer-motion';
import { InvestmentData } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { apiFetch } from '@/lib/api-client';
import { useFormDraft } from '@/hooks/useFormDraft';

type InvestmentDraft = InvestmentData & { _step?: number };

export default function InvestmentOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { addNotification } = useNotification();
  const { loadedDraft, draftLoaded, saveDraft, clearDraft } = useFormDraft<InvestmentDraft>('investor_onboarding');
  const draftApplied = useRef(false);
  const accountEmail = useAccountEmail((email) => setInvestmentData((prev) => ({ ...prev, email })));
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

  // Restore a previously saved draft once (signed-in users, resumable across devices).
  useEffect(() => {
    if (draftApplied.current || !loadedDraft) return;
    draftApplied.current = true;
    const { _step, ...rest } = loadedDraft;
    setInvestmentData(prev => ({ ...prev, ...rest }));
    if (_step && _step >= 1 && _step <= totalSteps) setCurrentStep(_step);
    addNotification({
      type: 'info',
      title: 'Draft restored',
      message: 'We brought back your saved progress — continue where you left off.',
    });
  }, [loadedDraft, addNotification]);

  // Auto-save progress (debounced) after the initial draft has been read.
  useEffect(() => {
    if (!draftLoaded) return;
    saveDraft({ ...investmentData, _step: currentStep });
  }, [investmentData, currentStep, draftLoaded, saveDraft]);

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
  const [submitResult, setSubmitResult] = useState<{ referenceNumber?: string; existing: boolean } | null>(null);

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      const json = await apiFetch<{ referenceNumber?: string; existing: boolean }>('/api/investors/', {
        method: 'POST',
        body: JSON.stringify(investmentData),
      });

      if (!json.success) {
        throw new Error(json.error || 'Submission failed');
      }

      setSubmitResult({ referenceNumber: json.data!.referenceNumber, existing: json.data!.existing });
      clearDraft();

      addNotification({
        type: 'success',
        title: json.data!.existing
          ? 'Profile Already Exists'
          : 'Application Submitted Successfully!',
        message: json.data!.existing
          ? `We already have a profile on file for this email. We've emailed your reference number — our team will be in touch.`
          : `Your investor reference is ${json.data!.referenceNumber}. Our investment team will contact you within 24 hours.`,
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
            <h3 className="gov-title-m border-b-2 border-black pb-3">Investment Profile</h3>
            
            <div>
              <label className="gov-label mb-3">
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
                    className={`border-l-4 py-3 pl-4 pr-2 cursor-pointer transition-colors ${
                      investmentData.investorType === option.value
                        ? 'border-black bg-[#fffbea]'
                        : 'border-neutral-300 hover:border-black'
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
                        className="mr-3 h-5 w-5"
                      />
                      <div>
                        <div className="font-bold text-black">{option.label}</div>
                        <div className="text-sm text-[#5c5850]">{option.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="gov-label mb-3">
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
                    className={`border-l-4 py-3 pl-4 pr-2 cursor-pointer transition-colors ${
                      investmentData.experience === option.value
                        ? 'border-black bg-[#fffbea]'
                        : 'border-neutral-300 hover:border-black'
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
                        className="mr-3 h-5 w-5"
                      />
                      <div>
                        <div className="font-bold text-black">{option.label}</div>
                        <div className="text-sm text-[#5c5850]">{option.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="gov-label mb-3">
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
                    className={`border-l-4 py-3 pl-4 pr-2 cursor-pointer transition-colors ${
                      investmentData.investmentGoal === option.value
                        ? 'border-black bg-[#fffbea]'
                        : 'border-neutral-300 hover:border-black'
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
                        className="mr-3 h-5 w-5"
                      />
                      <div>
                        <div className="font-bold text-black">{option.label}</div>
                        <div className="text-sm text-[#5c5850]">{option.description}</div>
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
            <h3 className="gov-title-m border-b-2 border-black pb-3">Investment Capacity</h3>
            
            <div>
              <label className="gov-label">
                Investment Amount (USD)
              </label>
              <select
                value={investmentData.investmentAmount}
                onChange={(e) => updateData('investmentAmount', e.target.value)}
                className="gov-input"
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
              <label className="gov-label">
                Time Horizon
              </label>
              <select
                value={investmentData.timeHorizon}
                onChange={(e) => updateData('timeHorizon', e.target.value)}
                className="gov-input"
              >
                <option value="">Select time horizon</option>
                <option value="short-term">Short-term (1-3 years)</option>
                <option value="medium-term">Medium-term (3-7 years)</option>
                <option value="long-term">Long-term (7+ years)</option>
              </select>
            </div>

            <div>
              <label className="gov-label">
                Risk Tolerance
              </label>
              <select
                value={investmentData.riskTolerance}
                onChange={(e) => updateData('riskTolerance', e.target.value)}
                className="gov-input"
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
            <h3 className="gov-title-m border-b-2 border-black pb-3">Sector Interest</h3>
            
            <div>
              <label className="gov-label mb-3">
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
                    className={`border-l-4 py-3 pl-4 pr-2 cursor-pointer transition-colors ${
                      investmentData.primarySector === option.value
                        ? 'border-black bg-[#fffbea]'
                        : 'border-neutral-300 hover:border-black'
                    }`}
                    onClick={() => updateData('primarySector', option.value)}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <div>
                        <div className="font-bold text-black">{option.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="gov-label">
                Specific Interests (Optional)
              </label>
              <textarea
                value={investmentData.specificInterests}
                onChange={(e) => updateData('specificInterests', e.target.value)}
                className="gov-input"
                rows={4}
                placeholder="Describe your specific investment interests..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="gov-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={investmentData.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="gov-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="gov-label">
                  Email *
                </label>
                <input
                  type="email"
                  value={investmentData.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  readOnly={Boolean(accountEmail)}
                  aria-describedby={accountEmail ? 'investor-email-hint' : undefined}
                  className={`gov-input ${accountEmail ? 'bg-neutral-100' : ''}`}
                  placeholder="Enter your email"
                />
                {accountEmail && <AccountEmailHint id="investor-email-hint" />}
              </div>

              <div>
                <label className="gov-label">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={investmentData.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  className="gov-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="gov-label">
                  Nationality *
                </label>
                <input
                  type="text"
                  value={investmentData.nationality}
                  onChange={(e) => updateData('nationality', e.target.value)}
                  className="gov-input"
                  placeholder="Enter your nationality"
                />
              </div>

              <div>
                <label className="gov-label">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={investmentData.companyName}
                  onChange={(e) => updateData('companyName', e.target.value)}
                  className="gov-input"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="gov-label">
                  Position (Optional)
                </label>
                <input
                  type="text"
                  value={investmentData.position}
                  onChange={(e) => updateData('position', e.target.value)}
                  className="gov-input"
                  placeholder="Enter your position"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Investment Readiness</h3>
            
            <div>
              <label className="gov-label">
                Capital Source
              </label>
              <select
                value={investmentData.capitalSource}
                onChange={(e) => updateData('capitalSource', e.target.value)}
                className="gov-input"
              >
                <option value="">Select capital source</option>
                <option value="savings">Personal Savings</option>
                <option value="loan">Bank Loan</option>
                <option value="partnership">Partnership/Joint Venture</option>
                <option value="grant">Grant/Government Funding</option>
              </select>
            </div>

            <div>
              <label className="gov-label">
                Investment Timeframe
              </label>
              <select
                value={investmentData.timeframe}
                onChange={(e) => updateData('timeframe', e.target.value)}
                className="gov-input"
              >
                <option value="">Select timeframe</option>
                <option value="immediate">Immediate (Ready now)</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="1-year">Within 1 year</option>
              </select>
            </div>

            <div>
              <label className="gov-label mb-3">
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
                    className={`border-l-4 py-3 pl-4 pr-2 cursor-pointer transition-colors ${
                      investmentData.supportNeeded.includes(option.value)
                        ? 'border-black bg-[#fffbea]'
                        : 'border-neutral-300 hover:border-black'
                    }`}
                    onClick={() => updateArrayField('supportNeeded', option.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={investmentData.supportNeeded.includes(option.value)}
                        onChange={() => {}}
                        className="mr-3 h-5 w-5"
                      />
                      <div className="font-bold text-black">{option.label}</div>
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
                    ? 'border-black bg-black text-yellow-400'
                    : 'border-neutral-400 bg-white text-neutral-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-[#dcd8cf]">
            <div
              className="h-2 bg-black transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <p className="mt-3 text-base font-bold text-[#5c5850]">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step Content */}
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
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gov-btn gov-btn--secondary"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!validateCurrentStep()}
            className="gov-btn"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitApplication}
            disabled={!validateCurrentStep() || isSubmitting}
            className="gov-btn"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>

      {/* Success result */}
      {submitResult && (
        <div role="status" className="gov-panel mt-8 text-center">
          <h3 className="font-display text-3xl font-semibold text-white">
            {submitResult.existing ? 'Profile found' : 'Profile created'}
          </h3>
          {submitResult.referenceNumber ? (
            <>
              <p className="mt-4 text-white/85">Your investor reference number is</p>
              <p className="mt-1 font-mono text-3xl font-bold text-[#ffd700]">{submitResult.referenceNumber}</p>
            </>
          ) : (
            <p className="mt-4 text-white/85">We&apos;ve emailed your reference number to the address on file.</p>
          )}
          <p className="mt-4 text-sm text-white/75">
            Our investment team will contact you within 24 hours. Check your email for confirmation.
          </p>
        </div>
      )}
    </div>
  );
}