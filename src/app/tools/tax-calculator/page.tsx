import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Calculator',
  description: 'Calculate your business tax obligations with our comprehensive tax calculator tool.',
};

export default function TaxCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Tax Calculator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Calculate your business tax obligations with our comprehensive tax calculator tool.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Tax Calculator Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              The tax calculator component will be migrated in the next phase of the migration process.
            </p>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Get Notified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}