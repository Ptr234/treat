import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const Calculator = () => {
  const [income, setIncome] = useState('')
  const [businessType, setBusinessType] = useState('individual')
  const [vatApplicable, setVatApplicable] = useState(false)
  const [investmentSector, setInvestmentSector] = useState('')
  const [annualTurnover, setAnnualTurnover] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [calculationType, setCalculationType] = useState('paye') // paye, corporate, investment
  const { addNotification } = useNotification()

  const calculateTax = () => {
    const grossIncome = parseFloat(income) || 0
    const turnover = parseFloat(annualTurnover) || 0
    
    let incomeTax = 0
    let corporateTax = 0
    let vat = 0
    let nssf = 0
    let withholdingTax = 0
    let lst = 0
    let investmentIncentive = 0
    let netIncome = 0

    if (calculationType === 'paye' && grossIncome > 0) {
      // PAYE calculation (updated 2024/2025 rates)
      if (grossIncome <= 235000) {
        incomeTax = 0
      } else if (grossIncome <= 335000) {
        incomeTax = (grossIncome - 235000) * 0.1
      } else if (grossIncome <= 410000) {
        incomeTax = 10000 + (grossIncome - 335000) * 0.2
      } else {
        incomeTax = 25000 + (grossIncome - 410000) * 0.3
      }

      // NSSF (5% employee contribution, max UGX 200,000)
      nssf = Math.min(grossIncome * 0.05, 200000)

      // VAT (18% if applicable)
      if (vatApplicable || turnover >= 150000000) {
        vat = grossIncome * 0.18
      }

      netIncome = grossIncome - incomeTax - nssf - vat
    } 
    else if (calculationType === 'corporate' && turnover > 0) {
      // Corporate Tax calculation
      corporateTax = turnover * 0.30 // 30% corporate tax rate
      
      // LST (Local Service Tax) - varies by location
      if (turnover >= 50000000) {
        lst = Math.min(turnover * 0.001, 100000) // 0.1% of turnover, max UGX 100,000
      } else if (turnover >= 10000000) {
        lst = Math.min(turnover * 0.0005, 50000) // 0.05% of turnover, max UGX 50,000
      } else {
        lst = 5000 // Minimum LST
      }

      // VAT registration mandatory if turnover > UGX 150M
      if (turnover >= 150000000) {
        vat = turnover * 0.18
      }

      // Withholding tax on various transactions (simplified at 6%)
      withholdingTax = turnover * 0.06

      netIncome = turnover - corporateTax - lst - vat - withholdingTax
    }
    else if (calculationType === 'investment' && turnover > 0) {
      // Investment incentive calculation
      const sectorIncentives = {
        'agriculture': 0.10,
        'tourism': 0.15,
        'manufacturing': 0.12,
        'ict': 0.20,
        'mining': 0.08,
        'energy': 0.18,
        'other': 0.05
      }

      const incentiveRate = sectorIncentives[investmentSector] || 0.05
      investmentIncentive = turnover * incentiveRate
      
      // Corporate tax with investment incentive
      corporateTax = Math.max(0, (turnover * 0.30) - investmentIncentive)
      
      // Other taxes still apply
      if (turnover >= 150000000) {
        vat = turnover * 0.18
      }
      
      lst = turnover >= 50000000 ? Math.min(turnover * 0.001, 100000) : 5000
      withholdingTax = turnover * 0.06
      
      netIncome = turnover - corporateTax - lst - vat - withholdingTax + investmentIncentive
    }

    const totalDeductions = incomeTax + corporateTax + nssf + vat + withholdingTax + lst
    const totalIncentives = investmentIncentive

    addNotification({
      type: 'success',
      title: 'Tax Calculation Complete',
      message: `Net ${calculationType === 'paye' ? 'income' : 'profit'}: UGX ${netIncome.toLocaleString()}`,
      duration: 5000
    })

    return {
      grossIncome: calculationType === 'paye' ? grossIncome : turnover,
      incomeTax,
      corporateTax,
      nssf,
      vat,
      withholdingTax,
      lst,
      investmentIncentive,
      netIncome,
      totalDeductions,
      totalIncentives,
      calculationType
    }
  }

  const [results, setResults] = useState(null)

  const handleCalculate = () => {
    const calculation = calculateTax()
    setResults(calculation)
  }

  return (
    <section id="calculator" className="py-20 px-4 relative">
      {/* Uganda National Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img 
            src="/images/uganda-business-bg.jpeg" 
            alt="Uganda business landscape" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
        
        {/* Crested Crane - Uganda's National Bird */}
        <div className="absolute top-20 right-10 opacity-15">
          <div className="w-32 h-32 text-yellow-300">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              {/* Crested Crane Body */}
              <path d="M30 70 Q35 65 40 70 Q45 60 55 65 Q60 55 70 60 Q75 65 70 75 Q65 80 55 75 Q50 85 40 80 Q35 75 30 70 Z" />
              {/* Crane Wings */}
              <path d="M45 50 Q50 45 55 50 Q60 45 65 50 Q70 55 65 65 Q60 70 50 65 Q40 60 45 50 Z" />
              {/* Crane Head */}
              <circle cx="52" cy="52" r="2" />
              {/* Crane Crest */}
              <path d="M50 35 Q55 30 60 35 Q65 40 60 45 Q55 50 50 45 Q45 40 50 35 Z" />
              {/* Crane Neck */}
              <path d="M52 52 Q54 40 58 35 Q60 32 62 35 Q60 38 58 40 Q56 45 54 52" stroke="currentColor" strokeWidth="1" fill="none" />
              {/* Crane Legs */}
              <path d="M45 75 L42 85 M55 75 L58 85" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        
        {/* Uganda Flag Corner */}
        <div className="absolute top-10 left-10 opacity-20">
          <img 
            src="/images/uganda-flag.png" 
            alt="Uganda flag" 
            className="w-16 h-12 object-cover rounded shadow-md"
          />
        </div>
        
        {/* Uganda Coat of Arms */}
        <div className="absolute bottom-20 left-10 opacity-15">
          <img 
            src="/images/uganda-coat-of-arms.png" 
            alt="Uganda Coat of Arms" 
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/uganda-flag.png" 
              alt="Uganda flag" 
              className="w-8 h-6 object-cover mr-3 rounded shadow-md"
            />
            <span className="inline-block px-4 py-2 bg-yellow-500/40 text-yellow-100 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-400/30">
              🧮 Official URA Tax Calculator
            </span>
            <img 
              src="/images/uganda-coat-of-arms.png" 
              alt="Uganda Coat of Arms" 
              className="w-8 h-8 object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Uganda Tax Calculator
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-300 text-2xl mt-2">
              "For God and My Country"
            </span>
          </h2>
          <p className="text-xl text-gray-200">
            Official Uganda Revenue Authority (URA) tax calculation portal. Calculate PAYE, VAT, NSSF, and investment incentives accurately.
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
              Tax Calculation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculation Type
                </label>
                <select
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="paye">PAYE (Individual Income Tax)</option>
                  <option value="corporate">Corporate Tax</option>
                  <option value="investment">Investment Incentives</option>
                </select>
              </div>

              {calculationType === 'paye' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income (UGX)
                    </label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="Enter your monthly income"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover (UGX)
                    </label>
                    <input
                      type="number"
                      value={annualTurnover}
                      onChange={(e) => setAnnualTurnover(e.target.value)}
                      placeholder="Enter annual business turnover"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      placeholder="Enter number of employees"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {calculationType === 'investment' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Sector (ATMS)
                      </label>
                      <select
                        value={investmentSector}
                        onChange={(e) => setInvestmentSector(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select sector</option>
                        <option value="agriculture">Agriculture & Agribusiness (10%)</option>
                        <option value="tourism">Tourism & Hospitality (15%)</option>
                        <option value="manufacturing">Manufacturing (12%)</option>
                        <option value="ict">ICT & Digital Services (20%)</option>
                        <option value="mining">Mining & Minerals (8%)</option>
                        <option value="energy">Energy & Utilities (18%)</option>
                        <option value="other">Other Sectors (5%)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vat"
                  checked={vatApplicable || parseFloat(annualTurnover) >= 150000000}
                  onChange={(e) => setVatApplicable(e.target.checked)}
                  disabled={parseFloat(annualTurnover) >= 150000000}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="vat" className="ml-2 block text-sm text-gray-700">
                  VAT Applicable {parseFloat(annualTurnover) >= 150000000 ? '(Mandatory - Turnover > UGX 150M)' : '(Annual turnover > UGX 150M)'}
                </label>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-yellow-500 to-red-600 text-black py-3 px-6 rounded-lg font-semibold hover:from-yellow-600 hover:to-red-700 transition-colors"
              >
                Calculate {calculationType === 'paye' ? 'PAYE Tax' : calculationType === 'corporate' ? 'Corporate Tax' : 'Investment Tax Benefits'}
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
              Tax Breakdown
            </h3>

            {results ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">{results.calculationType === 'paye' ? 'Gross Income:' : 'Annual Turnover:'}:</span>
                  <span className="font-semibold">UGX {results.grossIncome.toLocaleString()}</span>
                </div>
                
                {results.calculationType === 'paye' && (
                  <>
                    {results.incomeTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Income Tax (PAYE):</span>
                        <span className="font-semibold text-red-600">-UGX {results.incomeTax.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {results.nssf > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">NSSF (5%):</span>
                        <span className="font-semibold text-red-600">-UGX {results.nssf.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                
                {(results.calculationType === 'corporate' || results.calculationType === 'investment') && (
                  <>
                    {results.corporateTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Corporate Tax (30%):</span>
                        <span className="font-semibold text-red-600">-UGX {results.corporateTax.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {results.lst > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Local Service Tax:</span>
                        <span className="font-semibold text-red-600">-UGX {results.lst.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {results.withholdingTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Withholding Tax (6%):</span>
                        <span className="font-semibold text-red-600">-UGX {results.withholdingTax.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                
                {results.vat > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">VAT (18%):</span>
                    <span className="font-semibold text-red-600">-UGX {results.vat.toLocaleString()}</span>
                  </div>
                )}
                
                {results.investmentIncentive > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-green-200 bg-green-50">
                    <span className="text-green-700 font-medium">Investment Tax Credit:</span>
                    <span className="font-semibold text-green-600">+UGX {results.investmentIncentive.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 mt-4">
                  <span className="text-lg font-semibold text-gray-900">Net {results.calculationType === 'paye' ? 'Income' : 'Profit'}:</span>
                  <span className="text-lg font-bold text-green-600">UGX {results.netIncome.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <span className="text-sm text-gray-600 block">Total Deductions:</span>
                    <span className="text-sm font-semibold text-red-600">UGX {results.totalDeductions.toLocaleString()}</span>
                  </div>
                  {results.totalIncentives > 0 && (
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block">Tax Incentives:</span>
                      <span className="text-sm font-semibold text-green-600">UGX {results.totalIncentives.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {results.calculationType === 'investment' && results.investmentIncentive > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>💡 Investment Benefit:</strong> Your {investmentSector} investment qualifies for significant tax credits under Uganda's ATMS program, saving you UGX {results.investmentIncentive.toLocaleString()} annually.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Enter your {calculationType === 'paye' ? 'income' : 'business'} details and click "Calculate" to see the breakdown.</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-500/30 rounded-lg border border-yellow-500/50">
              <h4 className="font-semibold text-gray-800 mb-2">Official URA Tax Rates (2024/2025):</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Income up to UGX 235,000: 0% (Tax-free threshold)</li>
                <li>• UGX 235,001 - 335,000: 10%</li>
                <li>• UGX 335,001 - 410,000: 20%</li>
                <li>• Above UGX 410,000: 30%</li>
                <li>• NSSF: 5% employee (max UGX 200,000), 10% employer</li>
                <li>• VAT: 18% (threshold UGX 150M annual turnover)</li>
                <li>• LST: UGX 5,000 - 100,000 annually</li>
              </ul>
            </div>
          </motion.div>
        </div>
        {/* Investment Incentives Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">ATMS Investment Incentives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🌾 Agriculture</h4>
              <p className="text-sm opacity-90">10% tax credit on investments. Includes farming, livestock, and agro-processing ventures.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🏖️ Tourism</h4>
              <p className="text-sm opacity-90">15% tax credit on investments. Hotels, lodges, tour operations, and recreational facilities.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🏭 Manufacturing</h4>
              <p className="text-sm opacity-90">12% tax credit on investments. Industrial production, processing, and value addition.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💻 ICT</h4>
              <p className="text-sm opacity-90">20% tax credit on investments. Software development, telecommunications, and digital services.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">⛏️ Mining</h4>
              <p className="text-sm opacity-90">8% tax credit on investments. Mineral extraction, processing, and related activities.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💼 Other Sectors</h4>
              <p className="text-sm opacity-90">5% tax credit on qualified investments. Various other business sectors and activities.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm opacity-90">
              💡 <strong>Pro Tip:</strong> Combine multiple ATMS sectors to maximize your tax incentives and optimize your investment strategy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Calculator