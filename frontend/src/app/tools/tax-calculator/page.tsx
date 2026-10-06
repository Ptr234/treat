'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CalculatorIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Uganda Tax Rates 2026 (verify against current URA schedules)
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

  const inputClass =
    'w-full rounded-md border border-neutral-400 bg-white px-3 py-2.5 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1';
  const labelClass = 'mb-2 block text-sm font-bold text-black';

  const CALCULATOR_OPTIONS = [
    { type: 'individual', icon: UserIcon, label: 'Individual tax' },
    { type: 'corporate', icon: BuildingOfficeIcon, label: 'Corporate tax' },
    { type: 'vat', icon: DocumentTextIcon, label: 'VAT' },
  ] as const;

  const resultRow = 'flex items-baseline justify-between gap-4 py-3';

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li>
              <Link href="/tools" className="text-red-600 hover:underline underline-offset-4">Business tools</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Tax calculator</li>
          </ol>
        </nav>
      </div>

      {/* Title and rates */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Uganda tax calculator 2026</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Calculate your tax obligations using official URA rates. Individual income tax, corporate tax, and VAT calculations.
        </p>
        <dl className="mt-10 grid grid-cols-1 gap-6 border-y border-neutral-200 py-6 sm:grid-cols-3">
          <div className=" pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Individual tax</dt>
            <dd className="mt-1 text-xl font-bold">0–40%</dd>
          </div>
          <div className=" pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Corporate tax</dt>
            <dd className="mt-1 text-xl font-bold">20–30%</dd>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">VAT rate</dt>
            <dd className="mt-1 text-xl font-bold">18%</dd>
          </div>
        </dl>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Inputs */}
        <section className="lg:col-span-2" aria-labelledby="tax-inputs-heading">
          <h2 id="tax-inputs-heading" className="border-b border-neutral-200 pb-3 text-xl font-bold sm:text-2xl">Tax calculator</h2>

          {/* Calculator type */}
          <div role="group" aria-label="Calculator type" className="mt-6 grid grid-cols-3 gap-2">
            {CALCULATOR_OPTIONS.map((option) => {
              const isActive = calculatorType === option.type;
              return (
                <button
                  key={option.type}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCalculatorType(option.type)}
                  className={`flex flex-col items-center gap-2 border-b-4 px-3 py-4 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                    isActive ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-700 hover:text-red-600'
                  }`}
                >
                  <option.icon className="h-6 w-6" aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Currency */}
          <div className="mt-8">
            <p className={labelClass}>Currency</p>
            <div role="group" aria-label="Currency" className="flex gap-2">
              {(['UGX', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  aria-pressed={currency === curr}
                  onClick={() => setCurrency(curr)}
                  className={`min-w-[5rem] border-2 px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                    currency === curr ? 'border-black bg-black text-yellow-400' : 'border-black bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Fields by calculator type */}
          {calculatorType === 'individual' && (
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="tax-income" className={labelClass}>Annual gross income ({currency})</label>
                <input
                  id="tax-income"
                  type="number"
                  value={grossIncome || ''}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  placeholder={currency === 'UGX' ? '50,000,000' : '13,500'}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tax-deductions" className={labelClass}>Allowable deductions ({currency})</label>
                <input
                  id="tax-deductions"
                  type="number"
                  value={deductions || ''}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  placeholder={currency === 'UGX' ? '5,000,000' : '1,350'}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {calculatorType === 'corporate' && (
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="tax-revenue" className={labelClass}>Annual revenue ({currency})</label>
                <input
                  id="tax-revenue"
                  type="number"
                  value={grossIncome || ''}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  placeholder={currency === 'UGX' ? '100,000,000' : '27,000'}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tax-business" className={labelClass}>Business type</label>
                <select
                  id="tax-business"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as 'standard' | 'small' | 'mining' | 'telecom')}
                  className={inputClass}
                >
                  <option value="standard">Standard business (30%)</option>
                  <option value="small">Small business – turnover &lt; UGX 150M (20%)</option>
                  <option value="mining">Mining company (30%)</option>
                  <option value="telecom">Telecommunications (30%)</option>
                </select>
              </div>
              <div>
                <label htmlFor="tax-expenses" className={labelClass}>Business expenses ({currency})</label>
                <input
                  id="tax-expenses"
                  type="number"
                  value={deductions || ''}
                  onChange={(e) => setDeductions(Number(e.target.value))}
                  placeholder={currency === 'UGX' ? '20,000,000' : '5,400'}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {calculatorType === 'vat' && (
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="tax-turnover" className={labelClass}>Annual turnover ({currency})</label>
                <input
                  id="tax-turnover"
                  type="number"
                  value={vatTurnover || ''}
                  onChange={(e) => setVatTurnover(Number(e.target.value))}
                  placeholder={currency === 'UGX' ? '200,000,000' : '54,000'}
                  className={inputClass}
                />
              </div>
              <div className="flex items-start gap-3 pl-4 text-sm">
                <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
                <div>
                  <p className="font-bold text-black">VAT registration threshold</p>
                  <p className="mt-1 leading-6 text-neutral-700">
                    Businesses with annual turnover of UGX 150M+ must register for VAT.
                    Current VAT rate is 18% on taxable supplies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Results and information */}
        <aside className="space-y-12" aria-label="Results and information">
          {calculation && (
            <section aria-labelledby="tax-results-heading">
              <h2 id="tax-results-heading" className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-lg font-bold">
                <CalculatorIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
                Tax calculation results
              </h2>
              <dl className="mt-2 divide-y divide-neutral-200 text-sm">
                <div className={resultRow}>
                  <dt className="text-neutral-700">Gross income</dt>
                  <dd className="font-semibold text-black">{formatCurrency(calculation.grossIncome)}</dd>
                </div>
                {calculatorType !== 'vat' && (
                  <>
                    <div className={resultRow}>
                      <dt className="text-neutral-700">Taxable income</dt>
                      <dd className="font-semibold text-black">{formatCurrency(calculation.taxableIncome)}</dd>
                    </div>
                    <div className={resultRow}>
                      <dt className="text-neutral-700">Income tax</dt>
                      <dd className="font-semibold text-black">{formatCurrency(calculation.incomeTax)}</dd>
                    </div>
                  </>
                )}
                {calculation.vatLiability !== undefined && (
                  <div className={resultRow}>
                    <dt className="text-neutral-700">VAT liability</dt>
                    <dd className="font-semibold text-black">{formatCurrency(calculation.vatLiability)}</dd>
                  </div>
                )}
                <div className={resultRow}>
                  <dt className="text-neutral-700">Net income</dt>
                  <dd className="font-bold text-black">{formatCurrency(calculation.netIncome)}</dd>
                </div>
                <div className={resultRow}>
                  <dt className="text-neutral-700">Effective rate</dt>
                  <dd className="font-semibold text-red-600">{calculation.effectiveRate.toFixed(2)}%</dd>
                </div>
              </dl>
            </section>
          )}

          <section aria-labelledby="tax-info-heading">
            <h2 id="tax-info-heading" className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-lg font-bold">
              <InformationCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
              Tax information
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              {calculatorType === 'individual' && (
                <>
                  <li><strong className="text-black">Tax-free threshold:</strong> UGX 3.18M annually</li>
                  <li><strong className="text-black">Tax brackets:</strong> 0%, 10%, 20%, 30%, 40%</li>
                  <li><strong className="text-black">Due date:</strong> 15th of following month</li>
                </>
              )}
              {calculatorType === 'corporate' && (
                <>
                  <li><strong className="text-black">Standard rate:</strong> 30% on chargeable income</li>
                  <li><strong className="text-black">Small business:</strong> 20% (turnover &lt; UGX 150M)</li>
                  <li><strong className="text-black">Due date:</strong> 6 months after year-end</li>
                </>
              )}
              {calculatorType === 'vat' && (
                <>
                  <li><strong className="text-black">Registration threshold:</strong> UGX 150M annually</li>
                  <li><strong className="text-black">Standard rate:</strong> 18% on taxable supplies</li>
                  <li><strong className="text-black">Return due:</strong> 15th of following month</li>
                </>
              )}
            </ul>
          </section>

          <section aria-labelledby="ura-heading" className=" pt-6">
            <h2 id="ura-heading" className="text-lg font-bold">Need tax assistance?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">Contact Uganda Revenue Authority for official tax guidance.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2"><dt className="font-bold text-black">Phone:</dt><dd className="text-neutral-700">+256 417 444 602</dd></div>
              <div className="flex gap-2"><dt className="font-bold text-black">Toll free:</dt><dd className="text-neutral-700">0800 117 000</dd></div>
              <div className="flex gap-2"><dt className="font-bold text-black">Email:</dt><dd><a href="mailto:info@ura.go.ug" className="font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600">info@ura.go.ug</a></dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
