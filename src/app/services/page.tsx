import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Comprehensive government services and investment support for Uganda business operations.',
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Government Services
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive government services and investment support for Uganda business operations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Business Registration
            </h3>
            <p className="text-gray-600 mb-4">
              Complete business registration and licensing services.
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Learn More →
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tax Services
            </h3>
            <p className="text-gray-600 mb-4">
              Tax registration, compliance, and consultation services.
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Learn More →
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Investment Support
            </h3>
            <p className="text-gray-600 mb-4">
              Comprehensive investment facilitation and support services.
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}