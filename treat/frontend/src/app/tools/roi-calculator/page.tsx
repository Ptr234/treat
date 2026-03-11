import { Metadata } from 'next';
import ROICalculator from '../../../components/tools/ROICalculator';

export const metadata: Metadata = {
  title: 'ROI Calculator - OneStopCentre Uganda',
  description: 'Calculate return on investment for business opportunities in Uganda with sector-specific incentives and ATMS tax benefits.',
  keywords: ['ROI calculator', 'investment', 'Uganda', 'ATMS', 'tax incentives', 'business opportunities'],
};

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-black to-brand-darkGreen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-400">
              Investment ROI Calculator
            </h1>
            <p className="text-xl md:text-2xl text-yellow-100 mb-8">
              Calculate your return on investment for Uganda business opportunities with sector-specific incentives and ATMS tax benefits
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 hover:bg-yellow-900/30 hover:border-yellow-600/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold text-lg">ROI</span>
                </div>
                <h3 className="font-semibold mb-2 text-yellow-50">Accurate Calculations</h3>
                <p className="text-sm text-yellow-50">Comprehensive ROI analysis with Uganda-specific factors</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 hover:bg-yellow-900/30 hover:border-yellow-600/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold text-lg">TAX</span>
                </div>
                <h3 className="font-semibold mb-2 text-yellow-50">ATMS Incentives</h3>
                <p className="text-sm text-yellow-50">Factor in tax credits and investment incentives</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 hover:bg-yellow-900/30 hover:border-yellow-600/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold text-lg">SEC</span>
                </div>
                <h3 className="font-semibold mb-2 text-yellow-50">Sector Analysis</h3>
                <p className="text-sm text-yellow-50">Sector-specific multipliers and risk assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Calculator Component */}
      <div className="py-8">
        <ROICalculator />
      </div>

      {/* Additional Information */}
      <div className="bg-neutral-900 border-t border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-400 text-center mb-8">
              Why Use Our ROI Calculator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-800/40 group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">Uganda-Specific Data</h3>
                <p className="text-neutral-400">
                  Our calculator uses real Uganda market data, tax rates, and sector-specific growth multipliers to provide accurate projections.
                </p>
              </div>
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-800/40 group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">ATMS Tax Benefits</h3>
                <p className="text-neutral-400">
                  Automatically calculates tax incentives available under Uganda&apos;s Advance Tax Management System (ATMS) for qualified investments.
                </p>
              </div>
              <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-800/40 group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">Risk Assessment</h3>
                <p className="text-neutral-400">
                  Includes risk-adjusted returns based on investment location and sector volatility to give you realistic expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding ROI Section */}
      <div className="bg-neutral-950">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-8">Understanding ROI</h2>
            <div className="bg-neutral-900 rounded-lg p-6 shadow-sm border border-neutral-800">
              <p className="text-neutral-400 mb-6">
                Return on Investment (ROI) is a performance measure used to evaluate the efficiency of an investment.
                It measures the amount of return on an investment relative to the investment&apos;s cost.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-900/20 rounded-lg hover:bg-yellow-900/30 hover:scale-105 transition-all duration-300 cursor-default">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">Formula</div>
                  <p className="text-sm text-neutral-400">ROI = (Gain - Cost) / Cost × 100%</p>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-lg hover:bg-red-900/30 hover:scale-105 transition-all duration-300 cursor-default">
                  <div className="text-2xl font-bold text-red-400 mb-2">Good ROI</div>
                  <p className="text-sm text-neutral-400">15-25% annually in Uganda&apos;s growth sectors</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 hover:scale-105 transition-all duration-300 cursor-default">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">Factors</div>
                  <p className="text-sm text-neutral-400">Sector multipliers, tax incentives, location risk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
