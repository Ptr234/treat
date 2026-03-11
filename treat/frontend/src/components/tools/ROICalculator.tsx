'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InvestmentData {
  initialInvestment: string;
  sector: string;
  projectDuration: string;
  annualRevenue: string;
  operatingCosts: string;
  employeeCount: string;
  location: string;
  isATMSQualified: boolean;
}

interface ROIResults {
  sector: {
    multiplier: number;
    taxCredit: number;
    description: string;
  };
  initial: number;
  duration: number;
  annualRevenue: number;
  annualProfit: number;
  netAnnualCashFlow: number;
  totalCashFlow: number;
  totalProfit: number;
  roi: number;
  annualROI: number;
  paybackPeriod: number;
  jobsCreated: number;
  economicImpact: number;
  riskAdjustedROI: number;
  taxBenefits: number;
}

export default function ROICalculator() {
  const [investment, setInvestment] = useState<InvestmentData>({
    initialInvestment: '',
    sector: '',
    projectDuration: '5',
    annualRevenue: '',
    operatingCosts: '',
    employeeCount: '',
    location: '',
    isATMSQualified: false
  });
  const [results, setResults] = useState<ROIResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setInvestment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-calculate when all required fields are filled
    if (type !== 'checkbox') {
      const updatedInvestment = {
        ...investment,
        [name]: value
      };

      if (updatedInvestment.initialInvestment &&
          updatedInvestment.annualRevenue &&
          updatedInvestment.operatingCosts &&
          updatedInvestment.sector) {
        // Trigger calculation with delay for better UX
        setTimeout(() => calculateROIWithData(updatedInvestment), 300);
      }
    }
  };

  const validateInputs = (data: InvestmentData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.initialInvestment || parseFloat(data.initialInvestment) <= 0) {
      newErrors.initialInvestment = 'Please enter a valid initial investment amount';
    }

    if (!data.annualRevenue || parseFloat(data.annualRevenue) <= 0) {
      newErrors.annualRevenue = 'Please enter expected annual revenue';
    }

    if (!data.operatingCosts || parseFloat(data.operatingCosts) < 0) {
      newErrors.operatingCosts = 'Please enter valid operating costs';
    }

    if (!data.sector) {
      newErrors.sector = 'Please select an investment sector';
    }

    if (!data.location) {
      newErrors.location = 'Please select a location';
    }

    // Validate revenue vs costs
    const revenue = parseFloat(data.annualRevenue) || 0;
    const costs = parseFloat(data.operatingCosts) || 0;
    if (revenue > 0 && costs >= revenue) {
      newErrors.operatingCosts = 'Operating costs cannot exceed annual revenue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateROIWithData = (data: InvestmentData) => {
    if (!validateInputs(data)) return;

    const initial = parseFloat(data.initialInvestment) || 0;
    const duration = parseInt(data.projectDuration) || 5;
    const revenue = parseFloat(data.annualRevenue) || 0;
    const costs = parseFloat(data.operatingCosts) || 0;
    const employees = parseInt(data.employeeCount) || 0;

    // Sector-specific multipliers and incentives
    const sectorData: Record<string, { multiplier: number; taxCredit: number; description: string }> = {
      'agriculture': { multiplier: 1.2, taxCredit: 0.10, description: 'Agriculture & Agribusiness' },
      'tourism': { multiplier: 1.4, taxCredit: 0.15, description: 'Tourism & Hospitality' },
      'manufacturing': { multiplier: 1.3, taxCredit: 0.12, description: 'Manufacturing' },
      'ict': { multiplier: 1.6, taxCredit: 0.20, description: 'ICT & Digital Services' },
      'mining': { multiplier: 1.1, taxCredit: 0.08, description: 'Mining & Minerals' },
      'energy': { multiplier: 1.5, taxCredit: 0.18, description: 'Energy & Renewables' },
      'healthcare': { multiplier: 1.25, taxCredit: 0.12, description: 'Healthcare & Pharmaceuticals' },
      'education': { multiplier: 1.15, taxCredit: 0.10, description: 'Education & Training' },
      'other': { multiplier: 1.0, taxCredit: 0.05, description: 'Other Sectors' }
    };

    const sector = sectorData[data.sector as keyof typeof sectorData] || sectorData.other || { multiplier: 1.0, taxCredit: 0.05, description: 'Other Sectors' };
    const adjustedRevenue = revenue * sector.multiplier;

    // Calculate tax benefits
    const corporateTaxRate = 0.30;
    const annualProfit = adjustedRevenue - costs;
    const normalTax = annualProfit > 0 ? annualProfit * corporateTaxRate : 0;
    const taxCredit = data.isATMSQualified ? initial * sector.taxCredit : 0;
    const actualTax = Math.max(0, normalTax - (taxCredit / duration));

    // Calculate cash flows
    const netAnnualCashFlow = annualProfit - actualTax;
    const totalCashFlow = netAnnualCashFlow * duration;
    const totalProfit = totalCashFlow - initial;
    const roi = initial > 0 ? (totalProfit / initial) * 100 : 0;
    const annualROI = roi / duration;
    const paybackPeriod = netAnnualCashFlow > 0 ? initial / netAnnualCashFlow : Infinity;

    // Employment impact
    const jobsCreated = employees;
    const economicImpact = jobsCreated * 2400000 * duration; // Average annual salary impact

    // Risk assessment based on location
    const riskFactors: Record<string, number> = {
      'kampala': 0.1,
      'central': 0.15,
      'western': 0.2,
      'eastern': 0.25,
      'northern': 0.3,
      'other': 0.2
    };
    const riskAdjustment = riskFactors[data.location] || 0.2;
    const riskAdjustedROI = annualROI * (1 - riskAdjustment);

    setResults({
      sector: sector,
      initial,
      duration,
      annualRevenue: adjustedRevenue,
      annualProfit,
      netAnnualCashFlow,
      totalCashFlow,
      totalProfit,
      roi,
      annualROI,
      paybackPeriod,
      jobsCreated,
      economicImpact,
      riskAdjustedROI,
      taxBenefits: taxCredit
    });
  };

  const calculateROI = () => {
    calculateROIWithData(investment);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-black min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 sm:mb-8 lg:mb-12"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-4">
          Investment ROI Calculator
        </h2>
        <p className="text-xl text-neutral-400">
          Calculate your return on investment for Uganda business opportunities with sector-specific incentives.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-6">
            Investment Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Initial Investment (UGX) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="initialInvestment"
                value={investment.initialInvestment}
                onChange={handleInputChange}
                placeholder="Enter initial investment amount"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500 ${
                  errors.initialInvestment
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-600 focus:ring-yellow-500'
                }`}
              />
              {errors.initialInvestment && (
                <p className="text-red-400 text-sm mt-1">{errors.initialInvestment}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Investment Sector <span className="text-red-400">*</span>
              </label>
              <select
                name="sector"
                value={investment.sector}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 ${
                  errors.sector
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-600 focus:ring-yellow-500'
                }`}
              >
                <option value="">Select a sector</option>
                <option value="agriculture">Agriculture & Agribusiness</option>
                <option value="tourism">Tourism & Hospitality</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="ict">ICT & Digital Services</option>
                <option value="mining">Mining & Minerals</option>
                <option value="energy">Energy & Renewables</option>
                <option value="healthcare">Healthcare & Pharmaceuticals</option>
                <option value="education">Education & Training</option>
                <option value="other">Other Sectors</option>
              </select>
              {errors.sector && (
                <p className="text-red-400 text-sm mt-1">{errors.sector}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Project Duration (Years)
              </label>
              <select
                name="projectDuration"
                value={investment.projectDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-neutral-800 text-yellow-100"
              >
                <option value="1">1 Year</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
                <option value="10">10 Years</option>
                <option value="15">15 Years</option>
                <option value="20">20 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Expected Annual Revenue (UGX) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="annualRevenue"
                value={investment.annualRevenue}
                onChange={handleInputChange}
                placeholder="Enter expected annual revenue"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500 ${
                  errors.annualRevenue
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-600 focus:ring-yellow-500'
                }`}
              />
              {errors.annualRevenue && (
                <p className="text-red-400 text-sm mt-1">{errors.annualRevenue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Annual Operating Costs (UGX) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="operatingCosts"
                value={investment.operatingCosts}
                onChange={handleInputChange}
                placeholder="Enter annual operating costs"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500 ${
                  errors.operatingCosts
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-600 focus:ring-yellow-500'
                }`}
              />
              {errors.operatingCosts && (
                <p className="text-red-400 text-sm mt-1">{errors.operatingCosts}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                name="employeeCount"
                value={investment.employeeCount}
                onChange={handleInputChange}
                placeholder="Enter number of employees"
                className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                Investment Location <span className="text-red-400">*</span>
              </label>
              <select
                name="location"
                value={investment.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 ${
                  errors.location
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-600 focus:ring-yellow-500'
                }`}
              >
                <option value="">Select location</option>
                <option value="kampala">Kampala (Central)</option>
                <option value="central">Central Region</option>
                <option value="western">Western Region</option>
                <option value="eastern">Eastern Region</option>
                <option value="northern">Northern Region</option>
                <option value="other">Other Location</option>
              </select>
              {errors.location && (
                <p className="text-red-400 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isATMSQualified"
                checked={investment.isATMSQualified}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-neutral-500 rounded"
              />
              <label className="ml-2 block text-sm text-neutral-300">
                Qualifies for ATMS Investment Incentives
              </label>
            </div>

            <button
              onClick={calculateROI}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Calculate ROI
            </button>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mt-4">
                <p className="text-red-400 text-sm font-medium">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-red-400 text-sm mt-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-6">
            Investment Analysis
          </h3>

          {results ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{results.roi.toFixed(1)}%</div>
                  <div className="text-sm text-yellow-300">Total ROI</div>
                </div>
                <div className="bg-red-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{results.annualROI.toFixed(1)}%</div>
                  <div className="text-sm text-red-300">Annual ROI</div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Initial Investment:</span>
                  <span className="font-semibold text-yellow-300">UGX {results.initial.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Annual Revenue (Adjusted):</span>
                  <span className="font-semibold text-yellow-300">UGX {results.annualRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Annual Profit:</span>
                  <span className="font-semibold text-yellow-300">UGX {results.annualProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Net Annual Cash Flow:</span>
                  <span className="font-semibold text-yellow-300">UGX {results.netAnnualCashFlow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-700 pt-2">
                  <span className="text-lg font-semibold text-neutral-300">Total Profit ({results.duration} years):</span>
                  <span className="text-lg font-bold text-yellow-400">UGX {results.totalProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Investment Metrics */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-300 mb-3">Investment Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Payback Period:</span>
                    <span className={`font-medium text-yellow-200 ${results.paybackPeriod === Infinity ? 'text-red-400' : ''}`}>
                      {results.paybackPeriod === Infinity ? 'Never (Negative cashflow)' : `${results.paybackPeriod.toFixed(1)} years`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Risk-Adjusted ROI:</span>
                    <span className="font-medium text-yellow-200">{results.riskAdjustedROI.toFixed(1)}% annually</span>
                  </div>
                  {results.taxBenefits > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">ATMS Tax Benefits:</span>
                      <span className="font-medium text-yellow-400">UGX {results.taxBenefits.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Economic Impact */}
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/30">
                <h4 className="font-semibold text-red-300 mb-3">Economic Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Jobs Created:</span>
                    <span className="font-medium text-yellow-200">{results.jobsCreated} positions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Economic Impact:</span>
                    <span className="font-medium text-yellow-200">UGX {results.economicImpact.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Sector Benefits */}
              {investment.sector && (
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
                  <h4 className="font-semibold text-yellow-300 mb-2">Sector Benefits</h4>
                  <p className="text-sm text-yellow-200/80">
                    <strong>{results.sector.description}</strong> sector provides a {((results.sector.multiplier - 1) * 100).toFixed(0)}% revenue multiplier
                    {investment.isATMSQualified && ` and ${(results.sector.taxCredit * 100).toFixed(0)}% tax credit under ATMS`}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-lg">Enter your investment details to see comprehensive ROI analysis</p>
              </div>

              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/30 text-left">
                <h4 className="font-semibold text-yellow-300 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-yellow-200/80 space-y-1">
                  <li>• Use realistic revenue and cost projections</li>
                  <li>• Consider ATMS incentives for qualifying projects</li>
                  <li>• Factor in local market conditions</li>
                  <li>• Review sector-specific multipliers</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Investment Sectors Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 sm:mt-8 lg:mt-12 bg-gradient-to-r from-yellow-700 via-red-800 to-neutral-900 rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-6 text-center">Uganda Investment Sectors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">🌾 Agriculture</h4>
            <p className="text-sm text-yellow-200/80">20% growth multiplier, 10% ATMS tax credit. Farming, livestock, agro-processing.</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">🏖️ Tourism</h4>
            <p className="text-sm text-yellow-200/80">40% growth multiplier, 15% ATMS tax credit. Hotels, tours, recreation.</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">🏭 Manufacturing</h4>
            <p className="text-sm text-yellow-200/80">30% growth multiplier, 12% ATMS tax credit. Production, processing.</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">💻 ICT</h4>
            <p className="text-sm text-yellow-200/80">60% growth multiplier, 20% ATMS tax credit. Software, telecommunications.</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">⛏️ Mining</h4>
            <p className="text-sm text-yellow-200/80">10% growth multiplier, 8% ATMS tax credit. Mineral extraction.</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 border border-yellow-800/20 hover:bg-black/50 hover:border-yellow-600/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
            <h4 className="font-semibold text-yellow-300 mb-2">⚡ Energy</h4>
            <p className="text-sm text-yellow-200/80">50% growth multiplier, 18% ATMS tax credit. Renewable energy.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
