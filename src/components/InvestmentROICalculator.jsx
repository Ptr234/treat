import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const InvestmentROICalculator = () => {
  const [investment, setInvestment] = useState({
    initialInvestment: '',
    sector: '',
    projectDuration: '5',
    annualRevenue: '',
    operatingCosts: '',
    employeeCount: '',
    location: '',
    isATMSQualified: false
  })
  const [results, setResults] = useState(null)
  const { addNotification } = useNotification()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setInvestment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const calculateROI = () => {
    const initial = parseFloat(investment.initialInvestment) || 0
    const duration = parseInt(investment.projectDuration) || 5
    const revenue = parseFloat(investment.annualRevenue) || 0
    const costs = parseFloat(investment.operatingCosts) || 0
    const employees = parseInt(investment.employeeCount) || 0

    if (initial === 0 || revenue === 0) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please enter initial investment and expected annual revenue',
        duration: 3000
      })
      return
    }

    // Sector-specific multipliers and incentives
    const sectorData = {
      'agriculture': { multiplier: 1.2, taxCredit: 0.10, description: 'Agriculture & Agribusiness' },
      'tourism': { multiplier: 1.4, taxCredit: 0.15, description: 'Tourism & Hospitality' },
      'manufacturing': { multiplier: 1.3, taxCredit: 0.12, description: 'Manufacturing' },
      'ict': { multiplier: 1.6, taxCredit: 0.20, description: 'ICT & Digital Services' },
      'mining': { multiplier: 1.1, taxCredit: 0.08, description: 'Mining & Minerals' },
      'energy': { multiplier: 1.5, taxCredit: 0.18, description: 'Energy & Renewables' },
      'healthcare': { multiplier: 1.25, taxCredit: 0.12, description: 'Healthcare & Pharmaceuticals' },
      'education': { multiplier: 1.15, taxCredit: 0.10, description: 'Education & Training' },
      'other': { multiplier: 1.0, taxCredit: 0.05, description: 'Other Sectors' }
    }

    const sector = sectorData[investment.sector] || sectorData.other
    const adjustedRevenue = revenue * sector.multiplier

    // Calculate tax benefits
    const corporateTaxRate = 0.30
    const annualProfit = adjustedRevenue - costs
    const normalTax = annualProfit * corporateTaxRate
    const taxCredit = investment.isATMSQualified ? initial * sector.taxCredit : 0
    const actualTax = Math.max(0, normalTax - (taxCredit / duration))

    // Calculate cash flows
    const netAnnualCashFlow = annualProfit - actualTax
    const totalCashFlow = netAnnualCashFlow * duration
    const totalProfit = totalCashFlow - initial
    const roi = (totalProfit / initial) * 100
    const annualROI = roi / duration
    const paybackPeriod = initial / netAnnualCashFlow

    // Employment impact
    const jobsCreated = employees
    const economicImpact = jobsCreated * 2400000 * duration // Average annual salary impact

    // Risk assessment based on sector and location
    const riskFactors = {
      'kampala': 0.1,
      'central': 0.15,
      'western': 0.2,
      'eastern': 0.25,
      'northern': 0.3,
      'other': 0.2
    }
    const riskAdjustment = riskFactors[investment.location] || 0.2
    const riskAdjustedROI = annualROI * (1 - riskAdjustment)

    setResults({
      sector,
      initial,
      duration,
      annualRevenue: adjustedRevenue,
      annualProfit,
      netAnnualCashFlow,
      totalCashFlow,
      totalProfit,
      roi,
      annualROI,
      riskAdjustedROI,
      paybackPeriod,
      taxCredit,
      taxSavings: taxCredit,
      jobsCreated,
      economicImpact,
      normalTax: normalTax * duration,
      actualTax: actualTax * duration
    })

    addNotification({
      type: 'success',
      title: 'ROI Analysis Complete',
      message: `Projected ROI: ${roi.toFixed(1)}% over ${duration} years`,
      duration: 5000
    })
  }

  const sectors = [
    { value: 'agriculture', label: 'Agriculture & Agribusiness (20% growth potential)' },
    { value: 'tourism', label: 'Tourism & Hospitality (40% growth potential)' },
    { value: 'manufacturing', label: 'Manufacturing (30% growth potential)' },
    { value: 'ict', label: 'ICT & Digital Services (60% growth potential)' },
    { value: 'mining', label: 'Mining & Minerals (10% growth potential)' },
    { value: 'energy', label: 'Energy & Renewables (50% growth potential)' },
    { value: 'healthcare', label: 'Healthcare & Pharmaceuticals (25% growth potential)' },
    { value: 'education', label: 'Education & Training (15% growth potential)' },
    { value: 'other', label: 'Other Sectors' }
  ]

  const locations = [
    { value: 'kampala', label: 'Kampala (Lowest Risk)' },
    { value: 'central', label: 'Central Region' },
    { value: 'western', label: 'Western Region' },
    { value: 'eastern', label: 'Eastern Region' },
    { value: 'northern', label: 'Northern Region' },
    { value: 'other', label: 'Other Location' }
  ]

  return (
    <section id="roi-calculator" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Investment ROI Calculator
          </h2>
          <p className="text-xl text-gray-600">
            Analyze potential returns and tax benefits for investments in Uganda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Investment Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Investment (UGX) *
                </label>
                <input
                  type="number"
                  name="initialInvestment"
                  value={investment.initialInvestment}
                  onChange={handleInputChange}
                  placeholder="e.g., 500,000,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Sector *
                </label>
                <select
                  name="sector"
                  value={investment.sector}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select sector</option>
                  {sectors.map(sector => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
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
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                  <option value="7">7 Years</option>
                  <option value="10">10 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Revenue (UGX) *
                </label>
                <input
                  type="number"
                  name="annualRevenue"
                  value={investment.annualRevenue}
                  onChange={handleInputChange}
                  placeholder="e.g., 200,000,000"
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
                  placeholder="e.g., 120,000,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employees to be Hired
                </label>
                <input
                  type="number"
                  name="employeeCount"
                  value={investment.employeeCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
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
                  {locations.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="atms"
                  name="isATMSQualified"
                  checked={investment.isATMSQualified}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="atms" className="ml-2 block text-sm text-gray-700">
                  Qualifies for ATMS Investment Incentives
                </label>
              </div>

              <button
                onClick={calculateROI}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors"
              >
                Calculate ROI
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              ROI Analysis
            </h3>

            {results ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.roi.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Total ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.annualROI.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Annual ROI</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Initial Investment:</span>
                    <span className="font-semibold">UGX {results.initial.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Annual Profit:</span>
                    <span className="font-semibold text-green-600">UGX {results.annualProfit.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Total Profit ({results.duration} years):</span>
                    <span className="font-semibold text-green-600">UGX {results.totalProfit.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Payback Period:</span>
                    <span className="font-semibold">{results.paybackPeriod.toFixed(1)} years</span>
                  </div>

                  {results.taxSavings > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-green-200 bg-green-50">
                      <span className="text-green-700 font-medium">ATMS Tax Savings:</span>
                      <span className="font-semibold text-green-600">UGX {results.taxSavings.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Risk-Adjusted ROI:</span>
                    <span className="font-semibold text-orange-600">{results.riskAdjustedROI.toFixed(1)}% annually</span>
                  </div>
                </div>

                {results.jobsCreated > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Economic Impact</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 block">Jobs Created:</span>
                        <span className="font-semibold">{results.jobsCreated} positions</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block">Economic Value:</span>
                        <span className="font-semibold">UGX {results.economicImpact.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Investment Summary</h4>
                  <p className="text-sm text-gray-700">
                    Your {results.sector.description.toLowerCase()} investment shows strong potential with a {results.roi.toFixed(1)}% total return over {results.duration} years. 
                    {results.taxSavings > 0 && ` ATMS incentives provide UGX ${results.taxSavings.toLocaleString()} in tax benefits.`}
                    {results.jobsCreated > 0 && ` This project will create ${results.jobsCreated} jobs, contributing significantly to Uganda's economic development.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>Enter your investment details to see detailed ROI analysis with tax benefits and economic impact.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Investment Sectors Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Uganda Investment Sectors - Growth Potential</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💻 ICT Sector</h4>
              <p className="text-sm opacity-90">Highest growth potential (60%) with 20% ATMS tax credits. Digital transformation driving demand.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">⚡ Energy Sector</h4>
              <p className="text-sm opacity-90">50% growth potential with 18% tax credits. Renewable energy focus creates opportunities.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🏖️ Tourism Sector</h4>
              <p className="text-sm opacity-90">40% growth potential with 15% tax credits. Post-COVID recovery driving strong returns.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🏭 Manufacturing</h4>
              <p className="text-sm opacity-90">30% growth potential with 12% tax credits. Value addition focus supports local production.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💊 Healthcare</h4>
              <p className="text-sm opacity-90">25% growth potential with 12% tax credits. Growing middle class increases healthcare demand.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🌾 Agriculture</h4>
              <p className="text-sm opacity-90">20% growth potential with 10% tax credits. Food security focus creates stable returns.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm opacity-90">
              💡 <strong>Pro Tip:</strong> Combine multiple sectors or focus on high-growth areas like ICT and Energy for maximum ROI potential.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InvestmentROICalculator