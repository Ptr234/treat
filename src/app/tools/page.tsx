import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Investment Tools',
  description: 'Comprehensive tools and calculators to support your business and investment decisions in Uganda.',
};

export default function ToolsPage() {
  const tools = [
    {
      title: 'Tax Calculator',
      description: 'Calculate your business tax obligations with our comprehensive tax calculator.',
      href: '/tools/tax-calculator',
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      available: true
    },
    {
      title: 'ROI Calculator',
      description: 'Calculate return on investment for various business opportunities.',
      href: '/tools/roi-calculator',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      ),
      available: true
    },
    {
      title: 'Invoice Generator',
      description: 'Generate professional invoices for your business transactions.',
      href: '/tools/invoice-generator',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      available: true
    },
    {
      title: 'Document Checklist',
      description: 'Comprehensive checklist for business registration and licensing documents.',
      href: '/tools/document-checklist',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      available: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Investment Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools and calculators to support your business and investment decisions in Uganda.
            Make informed choices with our professional-grade utilities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href as never}
              className="group bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg mb-4 group-hover:bg-primary-50 transition-colors">
                {tool.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {tool.description}
              </p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Use Tool</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing the Right Tool?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Our investment advisors can help you select the best tools for your specific business needs 
            and guide you through the calculation process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/business/registration"
              className="bg-primary-500 text-white border border-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Start Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}