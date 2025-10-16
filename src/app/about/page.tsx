import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about OneStopCentre Uganda and our mission to simplify government services and investment processes.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About OneStopCentre Uganda
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Simplifying government services and investment processes for a prosperous Uganda.
        </p>
        
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              OneStopCentre Uganda serves as the digital gateway to streamlined government services, 
              business registration, and investment opportunities. We are committed to making it easier 
              for entrepreneurs, investors, and businesses to navigate Uganda&apos;s regulatory landscape.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Registration</h3>
                <p className="text-gray-600">
                  Simplified digital business registration process with comprehensive support.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Support</h3>
                <p className="text-gray-600">
                  Access to investment opportunities and facilitation services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Government Services</h3>
                <p className="text-gray-600">
                  Direct access to various government agencies and their services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Tools</h3>
                <p className="text-gray-600">
                  Calculators, forms, and tools to help with business operations.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To be the leading digital platform that empowers economic growth in Uganda by 
              providing seamless access to government services and investment opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}