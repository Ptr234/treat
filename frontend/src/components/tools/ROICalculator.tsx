'use client';

import React, { useState } from 'react';

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
    import('@/lib/track').then(({ trackEvent }) =>
      trackEvent('tool_usage', 'roi-calculator', { sector: investment.sector })
    );
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-md border bg-white px-3 py-2.5 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 ${
      hasError ? 'border-red-600' : 'border-neutral-400'
    }`;
  const labelClass = 'mb-2 block text-sm font-bold text-black';
  const errorClass = 'mt-1 text-sm font-semibold text-red-600';

  const SECTORS = [
    { name: 'Agriculture', detail: '20% growth multiplier, 10% ATMS tax credit. Farming, livestock, agro-processing.' },
    { name: 'Tourism', detail: '40% growth multiplier, 15% ATMS tax credit. Hotels, tours, recreation.' },
    { name: 'Manufacturing', detail: '30% growth multiplier, 12% ATMS tax credit. Production, processing.' },
    { name: 'ICT', detail: '60% growth multiplier, 20% ATMS tax credit. Software, telecommunications.' },
    { name: 'Mining', detail: '10% growth multiplier, 8% ATMS tax credit. Mineral extraction.' },
    { name: 'Energy', detail: '50% growth multiplier, 18% ATMS tax credit. Renewable energy.' },
  ];

  return (
    <div className="mx-auto max-w-6xl text-black">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Input form */}
        <section aria-labelledby="roi-inputs-heading">
          <h2 id="roi-inputs-heading" className="border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">
            Investment details
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="roi-initial" className={labelClass}>
                Initial investment (UGX) <span className="text-red-600">*</span>
              </label>
              <input
                id="roi-initial"
                type="number"
                name="initialInvestment"
                value={investment.initialInvestment}
                onChange={handleInputChange}
                placeholder="Enter initial investment amount"
                aria-invalid={!!errors.initialInvestment}
                className={inputClass(!!errors.initialInvestment)}
              />
              {errors.initialInvestment && <p className={errorClass}>{errors.initialInvestment}</p>}
            </div>

            <div>
              <label htmlFor="roi-sector" className={labelClass}>
                Investment sector <span className="text-red-600">*</span>
              </label>
              <select
                id="roi-sector"
                name="sector"
                value={investment.sector}
                onChange={handleInputChange}
                aria-invalid={!!errors.sector}
                className={inputClass(!!errors.sector)}
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
              {errors.sector && <p className={errorClass}>{errors.sector}</p>}
            </div>

            <div>
              <label htmlFor="roi-duration" className={labelClass}>Project duration (years)</label>
              <select
                id="roi-duration"
                name="projectDuration"
                value={investment.projectDuration}
                onChange={handleInputChange}
                className={inputClass()}
              >
                <option value="1">1 year</option>
                <option value="3">3 years</option>
                <option value="5">5 years</option>
                <option value="10">10 years</option>
                <option value="15">15 years</option>
                <option value="20">20 years</option>
              </select>
            </div>

            <div>
              <label htmlFor="roi-revenue" className={labelClass}>
                Expected annual revenue (UGX) <span className="text-red-600">*</span>
              </label>
              <input
                id="roi-revenue"
                type="number"
                name="annualRevenue"
                value={investment.annualRevenue}
                onChange={handleInputChange}
                placeholder="Enter expected annual revenue"
                aria-invalid={!!errors.annualRevenue}
                className={inputClass(!!errors.annualRevenue)}
              />
              {errors.annualRevenue && <p className={errorClass}>{errors.annualRevenue}</p>}
            </div>

            <div>
              <label htmlFor="roi-costs" className={labelClass}>
                Annual operating costs (UGX) <span className="text-red-600">*</span>
              </label>
              <input
                id="roi-costs"
                type="number"
                name="operatingCosts"
                value={investment.operatingCosts}
                onChange={handleInputChange}
                placeholder="Enter annual operating costs"
                aria-invalid={!!errors.operatingCosts}
                className={inputClass(!!errors.operatingCosts)}
              />
              {errors.operatingCosts && <p className={errorClass}>{errors.operatingCosts}</p>}
            </div>

            <div>
              <label htmlFor="roi-employees" className={labelClass}>Number of employees</label>
              <input
                id="roi-employees"
                type="number"
                name="employeeCount"
                value={investment.employeeCount}
                onChange={handleInputChange}
                placeholder="Enter number of employees"
                className={inputClass()}
              />
            </div>

            <div>
              <label htmlFor="roi-location" className={labelClass}>
                Investment location <span className="text-red-600">*</span>
              </label>
              <select
                id="roi-location"
                name="location"
                value={investment.location}
                onChange={handleInputChange}
                aria-invalid={!!errors.location}
                className={inputClass(!!errors.location)}
              >
                <option value="">Select location</option>
                <option value="kampala">Kampala (Central)</option>
                <option value="central">Central Region</option>
                <option value="western">Western Region</option>
                <option value="eastern">Eastern Region</option>
                <option value="northern">Northern Region</option>
                <option value="other">Other Location</option>
              </select>
              {errors.location && <p className={errorClass}>{errors.location}</p>}
            </div>

            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="isATMSQualified"
                checked={investment.isATMSQualified}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>Qualifies for ATMS investment incentives</span>
            </label>

            <button
              type="button"
              onClick={calculateROI}
              className="w-full rounded-md bg-black px-6 py-3 text-sm font-bold text-yellow-400 transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Calculate ROI
            </button>

            {Object.keys(errors).length > 0 && (
              <div className="border-l-4 border-red-600 bg-neutral-50 p-4" role="alert">
                <p className="text-sm font-bold text-red-700">Please fix the following errors:</p>
                <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section aria-labelledby="roi-results-heading">
          <h2 id="roi-results-heading" className="border-b-2 border-black pb-3 text-xl font-bold sm:text-2xl">
            Investment analysis
          </h2>

          {results ? (
            <div className="mt-6 space-y-8">
              {/* Key metrics */}
              <dl className="grid grid-cols-1 gap-6 border-y border-neutral-200 py-6 sm:grid-cols-2">
                <div className="border-l-4 border-yellow-400 pl-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Total ROI</dt>
                  <dd className="mt-1 text-3xl font-bold text-black">{results.roi.toFixed(1)}%</dd>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-neutral-600">Annual ROI</dt>
                  <dd className="mt-1 text-3xl font-bold text-red-600">{results.annualROI.toFixed(1)}%</dd>
                </div>
              </dl>

              {/* Financial breakdown */}
              <dl className="divide-y divide-neutral-200 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-700">Initial investment</dt>
                  <dd className="font-semibold text-black">UGX {results.initial.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-700">Annual revenue (adjusted)</dt>
                  <dd className="font-semibold text-black">UGX {results.annualRevenue.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-700">Annual profit</dt>
                  <dd className="font-semibold text-black">UGX {results.annualProfit.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-neutral-700">Net annual cash flow</dt>
                  <dd className="font-semibold text-black">UGX {results.netAnnualCashFlow.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t-2 border-black py-4">
                  <dt className="font-bold text-black">Total profit ({results.duration} years)</dt>
                  <dd className="font-bold text-black">UGX {results.totalProfit.toLocaleString()}</dd>
                </div>
              </dl>

              {/* Investment metrics */}
              <section aria-labelledby="roi-metrics-heading">
                <h3 id="roi-metrics-heading" className="mb-3 text-base font-bold text-black">Investment metrics</h3>
                <dl className="divide-y divide-neutral-200 text-sm">
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-neutral-700">Payback period</dt>
                    <dd className={`font-semibold ${results.paybackPeriod === Infinity ? 'text-red-600' : 'text-black'}`}>
                      {results.paybackPeriod === Infinity ? 'Never (negative cash flow)' : `${results.paybackPeriod.toFixed(1)} years`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-neutral-700">Risk-adjusted ROI</dt>
                    <dd className="font-semibold text-black">{results.riskAdjustedROI.toFixed(1)}% annually</dd>
                  </div>
                  {results.taxBenefits > 0 && (
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-neutral-700">ATMS tax benefits</dt>
                      <dd className="font-semibold text-black">UGX {results.taxBenefits.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Economic impact */}
              <section aria-labelledby="roi-impact-heading" className="border-l-4 border-red-600 pl-4">
                <h3 id="roi-impact-heading" className="mb-3 text-base font-bold text-black">Economic impact</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-700">Jobs created</dt>
                    <dd className="font-semibold text-black">{results.jobsCreated} positions</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-700">Economic impact</dt>
                    <dd className="font-semibold text-black">UGX {results.economicImpact.toLocaleString()}</dd>
                  </div>
                </dl>
              </section>

              {/* Sector benefits */}
              {investment.sector && (
                <p className="border-t border-neutral-200 pt-6 text-sm leading-6 text-neutral-700">
                  <strong className="text-black">{results.sector.description}</strong> sector provides a {((results.sector.multiplier - 1) * 100).toFixed(0)}% revenue multiplier
                  {investment.isATMSQualified && ` and ${(results.sector.taxCredit * 100).toFixed(0)}% tax credit under ATMS`}.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-base text-neutral-700">Enter your investment details to see a comprehensive ROI analysis.</p>
              <div className="mt-6 border-l-4 border-yellow-400 pl-4">
                <h3 className="font-bold text-black">Pro tips</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
                  <li>Use realistic revenue and cost projections.</li>
                  <li>Consider ATMS incentives for qualifying projects.</li>
                  <li>Factor in local market conditions.</li>
                  <li>Review sector-specific multipliers.</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Investment sectors */}
      <section className="mt-16 border-t border-neutral-200 pt-10" aria-labelledby="roi-sectors-heading">
        <h2 id="roi-sectors-heading" className="text-xl font-bold sm:text-2xl">Uganda investment sectors</h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((sector) => (
            <li key={sector.name} className="border-t-2 border-yellow-400 pt-4">
              <h3 className="font-bold">{sector.name}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{sector.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
