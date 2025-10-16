import { Metadata } from 'next';
import ROICalculator from '../../../components/tools/ROICalculator';

export const metadata: Metadata = {
  title: 'ROI Calculator - OneStopCentre Uganda',
  description: 'Calculate return on investment for business opportunities in Uganda with sector-specific incentives and ATMS tax benefits.',
  keywords: ['ROI calculator', 'investment', 'Uganda', 'ATMS', 'tax incentives', 'business opportunities'],
};

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Investment ROI Calculator
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Calculate your return on investment for Uganda business opportunities with sector-specific incentives and ATMS tax benefits
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Accurate Calculations</h3>
                <p className="text-sm text-blue-100">Comprehensive ROI analysis with Uganda-specific factors</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">🏛️</div>
                <h3 className="font-semibold mb-2">ATMS Incentives</h3>
                <p className="text-sm text-blue-100">Factor in tax credits and investment incentives</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">📊</div>
                <h3 className="font-semibold mb-2">Sector Analysis</h3>
                <p className="text-sm text-blue-100">Sector-specific multipliers and risk assessments</p>
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
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Why Use Our ROI Calculator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Uganda-Specific Data</h3>
                <p className="text-gray-600">
                  Our calculator uses real Uganda market data, tax rates, and sector-specific growth multipliers to provide accurate projections.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">ATMS Tax Benefits</h3>
                <p className="text-gray-600">
                  Automatically calculates tax incentives available under Uganda&apos;s Advance Tax Management System (ATMS) for qualified investments.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Assessment</h3>
                <p className="text-gray-600">
                  Includes risk-adjusted returns based on investment location and sector volatility to give you realistic expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding ROI Section */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Understanding ROI</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 mb-6">
                Return on Investment (ROI) is a performance measure used to evaluate the efficiency of an investment. 
                It measures the amount of return on an investment relative to the investment&apos;s cost.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Formula</div>
                  <p className="text-sm text-gray-600">ROI = (Gain - Cost) / Cost × 100%</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">Good ROI</div>
                  <p className="text-sm text-gray-600">15-25% annually in Uganda&apos;s growth sectors</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Factors</div>
                  <p className="text-sm text-gray-600">Sector multipliers, tax incentives, location risk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}