'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TaxResults {
  grossIncome: number;
  incomeTax: number;
  corporateTax: number;
  nssf: number;
  vat: number;
  withholdingTax: number;
  lst: number;
  investmentIncentive: number;
  netIncome: number;
  totalDeductions: number;
  totalIncentives: number;
  calculationType: string;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [businessType, setBusinessType] = useState('individual');
  const [vatApplicable, setVatApplicable] = useState(false);
  const [investmentSector, setInvestmentSector] = useState('');
  const [annualTurnover, setAnnualTurnover] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [calculationType, setCalculationType] = useState<'paye' | 'corporate' | 'investment'>('paye');
  const [results, setResults] = useState<TaxResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  // Input validation
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (calculationType === 'paye') {
      if (!income || parseFloat(income) <= 0) {
        newErrors.income = 'Please enter a valid monthly income';
      }
    } else {
      if (!annualTurnover || parseFloat(annualTurnover) <= 0) {
        newErrors.annualTurnover = 'Please enter a valid annual turnover';
      }

      if (calculationType === 'investment' && !investmentSector) {
        newErrors.investmentSector = 'Please select an investment sector';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-calculate on input change
  const handleInputChange = (field: string, value: string) => {
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Update the field
    switch (field) {
      case 'income':
        setIncome(value);
        break;
      case 'annualTurnover':
        setAnnualTurnover(value);
        break;
      case 'investmentSector':
        setInvestmentSector(value);
        break;
      case 'businessType':
        setBusinessType(value);
        break;
      case 'employeeCount':
        setEmployeeCount(value);
        break;
    }

    // Auto-calculate with delay
    if (value && !isAutoCalculating) {
      setIsAutoCalculating(true);
      setTimeout(() => {

        if (calculationType === 'paye' && (!income && field !== 'income' || !value && field === 'income')) {
          return;
        }
        if ((calculationType === 'corporate' || calculationType === 'investment') &&
            (!annualTurnover && field !== 'annualTurnover' || !value && field === 'annualTurnover')) {
          return;
        }

        // Only auto-calculate if basic required fields are filled
        const shouldCalculate = (
          (calculationType === 'paye' && (income || field === 'income' && value)) ||
          ((calculationType === 'corporate' || calculationType === 'investment') &&
           (annualTurnover || field === 'annualTurnover' && value))
        );

        if (shouldCalculate) {
          calculateTaxWithValues(field, value);
        }
        setIsAutoCalculating(false);
      }, 500);
    }
  };

  const calculateTaxWithValues = (changedField?: string, changedValue?: string): TaxResults | null => {
    const grossIncome = parseFloat(changedField === 'income' ? changedValue || '0' : income) || 0;
    const turnover = parseFloat(changedField === 'annualTurnover' ? changedValue || '0' : annualTurnover) || 0;

    const currentSector = changedField === 'investmentSector' ? changedValue || '' : investmentSector;

    let incomeTax = 0;
    let corporateTax = 0;
    let vat = 0;
    let nssf = 0;
    let withholdingTax = 0;
    let lst = 0;
    let investmentIncentive = 0;
    let netIncome = 0;

    if (calculationType === 'paye' && grossIncome > 0) {
      // PAYE calculation (updated 2024/2025 rates)
      if (grossIncome <= 235000) {
        incomeTax = 0;
      } else if (grossIncome <= 335000) {
        incomeTax = (grossIncome - 235000) * 0.1;
      } else if (grossIncome <= 410000) {
        incomeTax = 10000 + (grossIncome - 335000) * 0.2;
      } else {
        incomeTax = 25000 + (grossIncome - 410000) * 0.3;
      }

      // NSSF (5% employee contribution, max UGX 200,000)
      nssf = Math.min(grossIncome * 0.05, 200000);

      // VAT (18% if applicable)
      if (vatApplicable || turnover >= 150000000) {
        vat = grossIncome * 0.18;
      }

      netIncome = grossIncome - incomeTax - nssf - vat;
    }
    else if (calculationType === 'corporate' && turnover > 0) {
      // Corporate Tax calculation with progressive rates for small businesses
      if (turnover <= 50000000) {
        corporateTax = turnover * 0.20; // 20% for small businesses
      } else {
        corporateTax = turnover * 0.30; // 30% standard rate
      }

      // LST (Local Service Tax) - varies by location and business size
      if (turnover >= 50000000) {
        lst = Math.min(turnover * 0.001, 100000); // 0.1% of turnover, max UGX 100,000
      } else if (turnover >= 10000000) {
        lst = Math.min(turnover * 0.0005, 50000); // 0.05% of turnover, max UGX 50,000
      } else {
        lst = 5000; // Minimum LST
      }

      // VAT registration mandatory if turnover > UGX 150M
      if (turnover >= 150000000) {
        vat = turnover * 0.18;
      }

      // Withholding tax on various transactions (simplified at 6%)
      withholdingTax = turnover * 0.06;

      netIncome = turnover - corporateTax - lst - vat - withholdingTax;
    }
    else if (calculationType === 'investment' && turnover > 0) {
      // Investment incentive calculation with enhanced sector benefits
      const sectorIncentives: Record<string, number> = {
        'agriculture': 0.15, // Enhanced from 10% to 15%
        'tourism': 0.20,    // Enhanced from 15% to 20%
        'manufacturing': 0.18, // Enhanced from 12% to 18%
        'ict': 0.25,        // Enhanced from 20% to 25%
        'mining': 0.10,     // Enhanced from 8% to 10%
        'energy': 0.22,     // Enhanced from 18% to 22%
        'other': 0.08       // Enhanced from 5% to 8%
      };

      const incentiveRate = sectorIncentives[currentSector] || 0.08;
      investmentIncentive = turnover * incentiveRate;

      // Corporate tax with investment incentive (progressive rates)
      const baseCorporateTax = turnover <= 50000000 ? turnover * 0.20 : turnover * 0.30;
      corporateTax = Math.max(0, baseCorporateTax - investmentIncentive);

      // Other taxes still apply but with potential reductions
      if (turnover >= 150000000) {
        vat = turnover * 0.18;
      }

      lst = turnover >= 50000000 ? Math.min(turnover * 0.001, 100000) : 5000;
      withholdingTax = turnover * 0.05; // Reduced from 6% to 5% for investments

      netIncome = turnover - corporateTax - lst - vat - withholdingTax + investmentIncentive;
    }

    const totalDeductions = incomeTax + corporateTax + nssf + vat + withholdingTax + lst;
    const totalIncentives = investmentIncentive;

    const result = {
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
    };

    setResults(result);
    return result;
  };

  const calculateTax = (): TaxResults => {
    if (!validateInputs()) {
      return {
        grossIncome: 0, incomeTax: 0, corporateTax: 0, nssf: 0, vat: 0,
        withholdingTax: 0, lst: 0, investmentIncentive: 0, netIncome: 0,
        totalDeductions: 0, totalIncentives: 0, calculationType
      };
    }

    return calculateTaxWithValues() || {
      grossIncome: 0, incomeTax: 0, corporateTax: 0, nssf: 0, vat: 0,
      withholdingTax: 0, lst: 0, investmentIncentive: 0, netIncome: 0,
      totalDeductions: 0, totalIncentives: 0, calculationType
    };
  };

  const handleCalculate = () => {
    const calculation = calculateTax();
    setResults(calculation);
  };

  return (
    <section className="py-20 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <Image
            src="/images/uganda-business-bg.jpeg"
            alt="Uganda business landscape"
            fill
            className="object-cover opacity-5"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/uganda-flag.png"
              alt="Uganda flag"
              width={32}
              height={24}
              className="object-cover mr-3 rounded shadow-md"
            />
            <span className="inline-block px-4 py-2 bg-yellow-500/40 text-yellow-100 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-400/30">
              🧮 Official URA Tax Calculator
            </span>
            <Image
              src="/images/uganda-coat-of-arms.png"
              alt="Uganda Coat of Arms"
              width={32}
              height={32}
              className="object-contain ml-3 opacity-80"
            />
          </div>
          <h2 className="text-4xl font-bold text-yellow-50 mb-4">
            Uganda Tax Calculator
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-300 text-2xl mt-2">
              &quot;For God and My Country&quot;
            </span>
          </h2>
          <p className="text-xl text-neutral-200">
            Official Uganda Revenue Authority (URA) tax calculation portal. Calculate PAYE, VAT, NSSF, and investment incentives accurately.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
          >
            <h3 className="text-2xl font-semibold text-yellow-400 mb-6">
              Tax Calculation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                  Calculation Type
                </label>
                <select
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value as 'paye' | 'corporate' | 'investment')}
                  className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-neutral-800 text-yellow-100"
                >
                  <option value="paye">PAYE (Individual Income Tax)</option>
                  <option value="corporate">Corporate Tax</option>
                  <option value="investment">Investment Incentives</option>
                </select>
              </div>

              {calculationType === 'paye' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Monthly Income (UGX) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => handleInputChange('income', e.target.value)}
                      placeholder="Enter your monthly income"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500 ${
                        errors.income
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-neutral-600 focus:ring-yellow-500'
                      }`}
                    />
                    {errors.income && (
                      <p className="text-red-400 text-sm mt-1">{errors.income}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-neutral-800 text-yellow-100"
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
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Annual Turnover (UGX) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={annualTurnover}
                      onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                      placeholder="Enter annual business turnover"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500 ${
                        errors.annualTurnover
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-neutral-600 focus:ring-yellow-500'
                      }`}
                    />
                    {errors.annualTurnover && (
                      <p className="text-red-400 text-sm mt-1">{errors.annualTurnover}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      value={employeeCount}
                      onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                      placeholder="Enter number of employees"
                      className="w-full px-4 py-2 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-neutral-800 text-yellow-100 placeholder:text-neutral-500"
                    />
                  </div>

                  {calculationType === 'investment' && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-200/80 mb-2">
                        Investment Sector (ATMS) <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={investmentSector}
                        onChange={(e) => handleInputChange('investmentSector', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-neutral-800 text-yellow-100 ${
                          errors.investmentSector
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-neutral-600 focus:ring-yellow-500'
                        }`}
                      >
                        <option value="">Select sector</option>
                        <option value="agriculture">Agriculture & Agribusiness (15%)</option>
                        <option value="tourism">Tourism & Hospitality (20%)</option>
                        <option value="manufacturing">Manufacturing (18%)</option>
                        <option value="ict">ICT & Digital Services (25%)</option>
                        <option value="mining">Mining & Minerals (10%)</option>
                        <option value="energy">Energy & Utilities (22%)</option>
                        <option value="other">Other Sectors (8%)</option>
                      </select>
                      {errors.investmentSector && (
                        <p className="text-red-400 text-sm mt-1">{errors.investmentSector}</p>
                      )}
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
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-neutral-500 rounded"
                />
                <label htmlFor="vat" className="ml-2 block text-sm text-neutral-300">
                  VAT Applicable {parseFloat(annualTurnover) >= 150000000 ? '(Mandatory - Turnover > UGX 150M)' : '(Annual turnover > UGX 150M)'}
                </label>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-yellow-500 to-red-600 text-black py-3 px-6 rounded-lg font-semibold hover:from-yellow-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {isAutoCalculating ? 'Auto-Calculating...' :
                 `Calculate ${calculationType === 'paye' ? 'PAYE Tax' :
                              calculationType === 'corporate' ? 'Corporate Tax' :
                              'Investment Tax Benefits'}`}
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-900 rounded-xl shadow-lg border border-yellow-900/30 p-6"
          >
            <h3 className="text-2xl font-semibold text-yellow-400 mb-6">
              Tax Breakdown
            </h3>

            {results ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                  <span className="text-neutral-400">{results.calculationType === 'paye' ? 'Gross Income:' : 'Annual Turnover:'}:</span>
                  <span className="font-semibold text-yellow-300">UGX {results.grossIncome.toLocaleString()}</span>
                </div>

                {results.calculationType === 'paye' && (
                  <>
                    {results.incomeTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                        <span className="text-neutral-400">Income Tax (PAYE):</span>
                        <span className="font-semibold text-red-400">-UGX {results.incomeTax.toLocaleString()}</span>
                      </div>
                    )}

                    {results.nssf > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                        <span className="text-neutral-400">NSSF (5%):</span>
                        <span className="font-semibold text-red-400">-UGX {results.nssf.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}

                {(results.calculationType === 'corporate' || results.calculationType === 'investment') && (
                  <>
                    {results.corporateTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                        <span className="text-neutral-400">Corporate Tax (30%):</span>
                        <span className="font-semibold text-red-400">-UGX {results.corporateTax.toLocaleString()}</span>
                      </div>
                    )}

                    {results.lst > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                        <span className="text-neutral-400">Local Service Tax:</span>
                        <span className="font-semibold text-red-400">-UGX {results.lst.toLocaleString()}</span>
                      </div>
                    )}

                    {results.withholdingTax > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                        <span className="text-neutral-400">Withholding Tax (6%):</span>
                        <span className="font-semibold text-red-400">-UGX {results.withholdingTax.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}

                {results.vat > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                    <span className="text-neutral-400">VAT (18%):</span>
                    <span className="font-semibold text-red-400">-UGX {results.vat.toLocaleString()}</span>
                  </div>
                )}

                {results.investmentIncentive > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-700 bg-yellow-900/20">
                    <span className="text-yellow-300 font-medium">Investment Tax Credit:</span>
                    <span className="font-semibold text-yellow-400">+UGX {results.investmentIncentive.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-t-2 border-neutral-700 mt-4">
                  <span className="text-lg font-semibold text-neutral-300">Net {results.calculationType === 'paye' ? 'Income' : 'Profit'}:</span>
                  <span className="text-lg font-bold text-yellow-400">UGX {results.netIncome.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <span className="text-sm text-neutral-400 block">Total Deductions:</span>
                    <span className="text-sm font-semibold text-red-400">UGX {results.totalDeductions.toLocaleString()}</span>
                  </div>
                  {results.totalIncentives > 0 && (
                    <div className="text-center">
                      <span className="text-sm text-neutral-400 block">Tax Incentives:</span>
                      <span className="text-sm font-semibold text-yellow-400">UGX {results.totalIncentives.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {results.calculationType === 'investment' && results.investmentIncentive > 0 && (
                  <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                    <p className="text-sm text-yellow-200/80">
                      <strong>💡 Investment Benefit:</strong> Your {investmentSector} investment qualifies for significant tax credits under Uganda&apos;s ATMS program, saving you UGX {results.investmentIncentive.toLocaleString()} annually.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧮</span>
                  </div>
                  <p className="text-lg">Enter your {calculationType === 'paye' ? 'income' : 'business'} details to see comprehensive tax breakdown</p>
                </div>

                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/30 text-left">
                  <h4 className="font-semibold text-yellow-300 mb-2">💡 Tax Tips:</h4>
                  <ul className="text-sm text-yellow-200/80 space-y-1">
                    {calculationType === 'paye' ? (
                      <>
                        <li>• First UGX 235,000 monthly is tax-free</li>
                        <li>• NSSF contributions are capped at UGX 200,000</li>
                        <li>{'• VAT applies if business turnover > UGX 150M annually'}</li>
                      </>
                    ) : (
                      <>
                        <li>{'• Small businesses (< UGX 50M) pay 20% corporate tax'}</li>
                        <li>• Investment incentives can significantly reduce taxes</li>
                        <li>• Local Service Tax varies by business size</li>
                        <li>{'• VAT registration mandatory if turnover > UGX 150M'}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
              <h4 className="font-semibold text-yellow-300 mb-2">Official URA Tax Rates (2024/2025):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-yellow-300 mb-1">PAYE Rates:</h5>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li>• Up to UGX 235,000: 0%</li>
                    <li>• UGX 235,001 - 335,000: 10%</li>
                    <li>• UGX 335,001 - 410,000: 20%</li>
                    <li>• Above UGX 410,000: 30%</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-yellow-300 mb-1">Corporate Rates:</h5>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li>• Small Business (&lt; UGX 50M): 20%</li>
                    <li>• Standard Rate: 30%</li>
                    <li>• VAT: 18% (UGX 150M+ turnover)</li>
                    <li>• LST: UGX 5K - 100K annually</li>
                  </ul>
                </div>
              </div>
              {calculationType === 'investment' && (
                <div className="mt-3 pt-3 border-t border-yellow-700/30">
                  <h5 className="font-medium text-yellow-300 mb-1">Enhanced ATMS Investment Incentives:</h5>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li>• ICT & Digital Services: 25% tax credit</li>
                    <li>• Energy & Utilities: 22% tax credit</li>
                    <li>• Tourism & Hospitality: 20% tax credit</li>
                    <li>• Manufacturing: 18% tax credit</li>
                    <li>• Agriculture & Agribusiness: 15% tax credit</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
