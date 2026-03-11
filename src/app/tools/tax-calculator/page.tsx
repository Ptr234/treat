'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalculatorIcon, 
  DocumentTextIcon, 
  InformationCircleIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Uganda Tax Rates 2024 (Based on URA official rates)
const TAX_RATES = {
  individual: [
    { min: 0, max: 3180000, rate: 0 }, // Tax-free threshold UGX 3.18M annually
    { min: 3180000, max: 13800000, rate: 10 }, // 10% on income above 3.18M
    { min: 13800000, max: 22800000, rate: 20 }, // 20% on income above 13.8M
    { min: 22800000, max: 120000000, rate: 30 }, // 30% on income above 22.8M
    { min: 120000000, max: Infinity, rate: 40 } // 40% on income above 120M
  ],
  corporate: {
    standard: 30, // Standard corporate tax rate
    small: 20, // Small business rate (turnover < UGX 150M)
    mining: 30, // Mining companies
    telecom: 30 // Telecommunications
  },
  vat: {
    standard: 18, // Standard VAT rate
    threshold: 150000000 // VAT registration threshold UGX 150M
  },
  withholding: {
    services: 6,
    goods: 1.5,
    commission: 10,
    rent: 20,
    interest: 15,
    professional: 6
  }
};

interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  marginalRate: number;
  effectiveRate: number;
  vatLiability?: number;
  withholdingTax?: number;
}

export default function TaxCalculatorPage() {
  const [calculatorType, setCalculatorType] = useState<'individual' | 'corporate' | 'vat'>('individual');
  const [grossIncome, setGrossIncome] = useState<number>(0);
  const [businessType, setBusinessType] = useState<'standard' | 'small' | 'mining' | 'telecom'>('standard');
  const [deductions, setDeductions] = useState<number>(0);
  const [vatTurnover, setVatTurnover] = useState<number>(0);
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [exchangeRate] = useState(3700); // UGX to USD rate

  // Calculate individual income tax
  const calculateIndividualTax = useCallback((income: number): TaxCalculation => {
    const taxableIncome = Math.max(0, income - deductions);
    let tax = 0;
    let marginalRate = 0;

    for (const bracket of TAX_RATES.individual) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        tax += taxableInBracket * (bracket.rate / 100);
        marginalRate = bracket.rate;
      }
    }

    return {
      grossIncome: income,
      taxableIncome,
      incomeTax: tax,
      netIncome: income - tax,
      marginalRate,
      effectiveRate: income > 0 ? (tax / income) * 100 : 0
    };
  }, [deductions]);

  // Calculate corporate tax
  const calculateCorporateTax = useCallback((revenue: number): TaxCalculation => {
    const taxableIncome = Math.max(0, revenue - deductions);
    const rate = TAX_RATES.corporate[businessType];
    const tax = taxableIncome * (rate / 100);

    return {
      grossIncome: revenue,
      taxableIncome,
      incomeTax: tax,
      netIncome: revenue - tax,
      marginalRate: rate,
      effectiveRate: revenue > 0 ? (tax / revenue) * 100 : 0
    };
  }, [deductions, businessType]);

  // Calculate VAT
  const calculateVAT = useCallback((turnover: number): TaxCalculation => {
    const vatLiability = turnover >= TAX_RATES.vat.threshold 
      ? turnover * (TAX_RATES.vat.standard / 100)
      : 0;

    return {
      grossIncome: turnover,
      taxableIncome: turnover,
      incomeTax: 0,
      netIncome: turnover - vatLiability,
      marginalRate: turnover >= TAX_RATES.vat.threshold ? TAX_RATES.vat.standard : 0,
      effectiveRate: turnover > 0 ? (vatLiability / turnover) * 100 : 0,
      vatLiability
    };
  }, []);

  // Update calculation when inputs change
  useEffect(() => {
    if (grossIncome > 0 || vatTurnover > 0) {
      let result: TaxCalculation;
      
      switch (calculatorType) {
        case 'individual':
          result = calculateIndividualTax(grossIncome);
          break;
        case 'corporate':
          result = calculateCorporateTax(grossIncome);
          break;
        case 'vat':
          result = calculateVAT(vatTurnover);
          break;
        default:
          result = calculateIndividualTax(grossIncome);
      }
      
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [calculatorType, grossIncome, businessType, deductions, vatTurnover, calculateIndividualTax, calculateCorporateTax, calculateVAT]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (currency === 'USD') {
      return `$${(amount / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `UGX ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-black to-brand-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Uganda Tax Calculator 2024
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Calculate your tax obligations using official URA rates. Individual income tax, corporate tax, and VAT calculations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="font-semibold">Individual Tax: </span>0-40%
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="font-semibold">Corporate Tax: </span>20-30%
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="font-semibold">VAT Rate: </span>18%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calculator Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              {/* Calculator Type Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tax Calculator</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { type: 'individual', icon: UserIcon, label: 'Individual Tax' },
                    { type: 'corporate', icon: BuildingOfficeIcon, label: 'Corporate Tax' },
                    { type: 'vat', icon: DocumentTextIcon, label: 'VAT Calculator' }
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setCalculatorType(option.type as 'individual' | 'corporate' | 'vat')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        calculatorType === option.type
                          ? 'border-brand-red bg-brand-red/5 text-brand-red'
                          : 'border-gray-200 hover:border-brand-yellow'
                      }`}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <div className="flex space-x-4">
                  {['UGX', 'USD'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr as 'UGX' | 'USD')}
                      className={`px-4 py-2 rounded-lg border ${
                        currency === curr
                          ? 'border-brand-red bg-brand-red text-white'
                          : 'border-gray-300 hover:border-brand-yellow'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields Based on Calculator Type */}
              {calculatorType === 'individual' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Gross Income ({currency})
                    </label>
                    <input
                      type="number"
                      value={grossIncome || ''}
                      onChange={(e) => setGrossIncome(Number(e.target.value))}
                      placeholder={currency === 'UGX' ? '50,000,000' : '13,500'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowable Deductions ({currency})
                    </label>
                    <input
                      type="number"
                      value={deductions || ''}
                      onChange={(e) => setDeductions(Number(e.target.value))}
                      placeholder={currency === 'UGX' ? '5,000,000' : '1,350'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>
              )}

              {calculatorType === 'corporate' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Revenue ({currency})
                    </label>
                    <input
                      type="number"
                      value={grossIncome || ''}
                      onChange={(e) => setGrossIncome(Number(e.target.value))}
                      placeholder={currency === 'UGX' ? '100,000,000' : '27,000'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as 'standard' | 'small' | 'mining' | 'telecom')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    >
                      <option value="standard">Standard Business (30%)</option>
                      <option value="small">Small Business - Turnover &lt; UGX 150M (20%)</option>
                      <option value="mining">Mining Company (30%)</option>
                      <option value="telecom">Telecommunications (30%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Expenses ({currency})
                    </label>
                    <input
                      type="number"
                      value={deductions || ''}
                      onChange={(e) => setDeductions(Number(e.target.value))}
                      placeholder={currency === 'UGX' ? '20,000,000' : '5,400'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>
              )}

              {calculatorType === 'vat' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover ({currency})
                    </label>
                    <input
                      type="number"
                      value={vatTurnover || ''}
                      onChange={(e) => setVatTurnover(Number(e.target.value))}
                      placeholder={currency === 'UGX' ? '200,000,000' : '54,000'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">VAT Registration Threshold</p>
                        <p className="text-gray-600 mt-1">
                          Businesses with annual turnover of UGX 150M+ must register for VAT. 
                          Current VAT rate is 18% on taxable supplies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            
            {/* Tax Calculation Results */}
            {calculation && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CalculatorIcon className="w-5 h-5 mr-2 text-brand-red" />
                  Tax Calculation Results
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gross Income:</span>
                    <span className="font-semibold">{formatCurrency(calculation.grossIncome)}</span>
                  </div>
                  
                  {calculatorType !== 'vat' && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Taxable Income:</span>
                        <span className="font-semibold">{formatCurrency(calculation.taxableIncome)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Income Tax:</span>
                        <span className="font-semibold text-brand-red">{formatCurrency(calculation.incomeTax)}</span>
                      </div>
                    </>
                  )}
                  
                  {calculation.vatLiability !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">VAT Liability:</span>
                      <span className="font-semibold text-brand-red">{formatCurrency(calculation.vatLiability)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Net Income:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(calculation.netIncome)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Effective Rate:</span>
                    <span className="font-semibold">{calculation.effectiveRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2 text-brand-yellow" />
                Tax Information
              </h3>
              
              <div className="space-y-3 text-sm">
                {calculatorType === 'individual' && (
                  <>
                    <p><strong>Tax-Free Threshold:</strong> UGX 3.18M annually</p>
                    <p><strong>Tax Brackets:</strong> 0%, 10%, 20%, 30%, 40%</p>
                    <p><strong>Due Date:</strong> 15th of following month</p>
                  </>
                )}
                
                {calculatorType === 'corporate' && (
                  <>
                    <p><strong>Standard Rate:</strong> 30% on chargeable income</p>
                    <p><strong>Small Business:</strong> 20% (turnover &lt; UGX 150M)</p>
                    <p><strong>Due Date:</strong> 6 months after year-end</p>
                  </>
                )}
                
                {calculatorType === 'vat' && (
                  <>
                    <p><strong>Registration Threshold:</strong> UGX 150M annually</p>
                    <p><strong>Standard Rate:</strong> 18% on taxable supplies</p>
                    <p><strong>Return Due:</strong> 15th of following month</p>
                  </>
                )}
              </div>
            </div>

            {/* Contact URA */}
            <div className="bg-brand-red text-white rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">Need Tax Assistance?</h3>
              <p className="text-sm mb-4">Contact Uganda Revenue Authority for official tax guidance.</p>
              <div className="space-y-2 text-sm">
                <p><strong>Phone:</strong> +256 417 444 602</p>
                <p><strong>Toll Free:</strong> 0800 117 000</p>
                <p><strong>Email:</strong> info@ura.go.ug</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}