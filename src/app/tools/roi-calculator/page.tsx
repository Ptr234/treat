import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROI Calculator',
  description: 'Calculate return on investment for various business opportunities and make informed investment decisions.',
};

export default function ROICalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          ROI Calculator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Calculate return on investment for various business opportunities and make informed investment decisions.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Investment Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Investment Amount (UGX)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10,000,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Period (Years)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Sector
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select a sector</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="tourism">Tourism</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="ict">ICT</option>
                  <option value="mining">Mining</option>
                  <option value="energy">Energy</option>
                </select>
              </div>
              
              <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Calculate ROI
              </button>
            </div>
          </div>

          {/* Results Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Results</h2>
            
            <div className="space-y-6">
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <p>Enter investment details to see ROI calculations</p>
                <p className="text-sm mt-2">Interactive calculator will be implemented in Phase 3</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding ROI</h3>
          <p className="text-gray-600 mb-4">
            Return on Investment (ROI) is a performance measure used to evaluate the efficiency of an investment. 
            It measures the amount of return on an investment relative to the investment&apos;s cost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">Formula</div>
              <p className="text-sm text-gray-600">ROI = (Gain - Cost) / Cost × 100%</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">Good ROI</div>
              <p className="text-sm text-gray-600">Typically 10-15% annually</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">Factors</div>
              <p className="text-sm text-gray-600">Sector, risk, market conditions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}