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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setInvestment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateROI = () => {
    const initial = parseFloat(investment.initialInvestment) || 0;
    const duration = parseInt(investment.projectDuration) || 5;
    const revenue = parseFloat(investment.annualRevenue) || 0;
    const costs = parseFloat(investment.operatingCosts) || 0;
    const employees = parseInt(investment.employeeCount) || 0;

    if (initial === 0 || revenue === 0) {
      alert('Please enter initial investment and expected annual revenue');
      return;
    }

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

    const sector = sectorData[investment.sector as keyof typeof sectorData] || sectorData.other || { multiplier: 1.0, taxCredit: 0.05, description: 'Other Sectors' };
    const adjustedRevenue = revenue * sector.multiplier;

    // Calculate tax benefits
    const corporateTaxRate = 0.30;
    const annualProfit = adjustedRevenue - costs;
    const normalTax = annualProfit * corporateTaxRate;
    const taxCredit = investment.isATMSQualified ? initial * sector.taxCredit : 0;
    const actualTax = Math.max(0, normalTax - (taxCredit / duration));

    // Calculate cash flows
    const netAnnualCashFlow = annualProfit - actualTax;
    const totalCashFlow = netAnnualCashFlow * duration;
    const totalProfit = totalCashFlow - initial;
    const roi = (totalProfit / initial) * 100;
    const annualROI = roi / duration;
    const paybackPeriod = initial / netAnnualCashFlow;

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
    const riskAdjustment = riskFactors[investment.location] || 0.2;
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Investment ROI Calculator
        </h2>
        <p className="text-xl text-gray-600">
          Calculate your return on investment for Uganda business opportunities with sector-specific incentives.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Investment Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Investment (UGX)
              </label>
              <input
                type="number"
                name="initialInvestment"
                value={investment.initialInvestment}
                onChange={handleInputChange}
                placeholder="Enter initial investment amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Sector
              </label>
              <select
                name="sector"
                value={investment.sector}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Duration (Years)
              </label>
              <select
                name="projectDuration"
                value={investment.projectDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Annual Revenue (UGX)
              </label>
              <input
                type="number"
                name="annualRevenue"
                value={investment.annualRevenue}
                onChange={handleInputChange}
                placeholder="Enter expected annual revenue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Operating Costs (UGX)
              </label>
              <input
                type="number"
                name="operatingCosts"
                value={investment.operatingCosts}
                onChange={handleInputChange}
                placeholder="Enter annual operating costs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                name="employeeCount"
                value={investment.employeeCount}
                onChange={handleInputChange}
                placeholder="Enter number of employees"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Location
              </label>
              <select
                name="location"
                value={investment.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select location</option>
                <option value="kampala">Kampala (Central)</option>
                <option value="central">Central Region</option>
                <option value="western">Western Region</option>
                <option value="eastern">Eastern Region</option>
                <option value="northern">Northern Region</option>
                <option value="other">Other Location</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isATMSQualified"
                checked={investment.isATMSQualified}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Qualifies for ATMS Investment Incentives
              </label>
            </div>

            <button
              onClick={calculateROI}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Calculate ROI
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Investment Analysis
          </h3>

          {results ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.roi.toFixed(1)}%</div>
                  <div className="text-sm text-green-700">Total ROI</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.annualROI.toFixed(1)}%</div>
                  <div className="text-sm text-blue-700">Annual ROI</div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Initial Investment:</span>
                  <span className="font-semibold">UGX {results.initial.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Annual Revenue (Adjusted):</span>
                  <span className="font-semibold text-green-600">UGX {results.annualRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Annual Profit:</span>
                  <span className="font-semibold text-green-600">UGX {results.annualProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Net Annual Cash Flow:</span>
                  <span className="font-semibold text-green-600">UGX {results.netAnnualCashFlow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total Profit ({results.duration} years):</span>
                  <span className="text-lg font-bold text-green-600">UGX {results.totalProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Investment Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Investment Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Payback Period:</span>
                    <span className="font-medium">{results.paybackPeriod.toFixed(1)} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk-Adjusted ROI:</span>
                    <span className="font-medium">{results.riskAdjustedROI.toFixed(1)}% annually</span>
                  </div>
                  {results.taxBenefits > 0 && (
                    <div className="flex justify-between">
                      <span>ATMS Tax Benefits:</span>
                      <span className="font-medium text-green-600">UGX {results.taxBenefits.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Economic Impact */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Economic Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Jobs Created:</span>
                    <span className="font-medium">{results.jobsCreated} positions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economic Impact:</span>
                    <span className="font-medium">UGX {results.economicImpact.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Sector Benefits */}
              {investment.sector && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Sector Benefits</h4>
                  <p className="text-sm text-yellow-800">
                    <strong>{results.sector.description}</strong> sector provides a {((results.sector.multiplier - 1) * 100).toFixed(0)}% revenue multiplier
                    {investment.isATMSQualified && ` and ${(results.sector.taxCredit * 100).toFixed(0)}% tax credit under ATMS`}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Enter your investment details and click &quot;Calculate ROI&quot; to see the analysis.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Investment Sectors Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-6 text-center">Uganda Investment Sectors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">🌾 Agriculture</h4>
            <p className="text-sm opacity-90">20% growth multiplier, 10% ATMS tax credit. Farming, livestock, agro-processing.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">🏖️ Tourism</h4>
            <p className="text-sm opacity-90">40% growth multiplier, 15% ATMS tax credit. Hotels, tours, recreation.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">🏭 Manufacturing</h4>
            <p className="text-sm opacity-90">30% growth multiplier, 12% ATMS tax credit. Production, processing.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">💻 ICT</h4>
            <p className="text-sm opacity-90">60% growth multiplier, 20% ATMS tax credit. Software, telecommunications.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">⛏️ Mining</h4>
            <p className="text-sm opacity-90">10% growth multiplier, 8% ATMS tax credit. Mineral extraction.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">⚡ Energy</h4>
            <p className="text-sm opacity-90">50% growth multiplier, 18% ATMS tax credit. Renewable energy.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}