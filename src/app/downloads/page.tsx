import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Download essential forms, guides, and resources for business registration and investment in Uganda.',
};

export default function DownloadsPage() {
  const downloadCategories = [
    {
      title: 'Business Registration Forms',
      description: 'Official forms for business registration and licensing',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      downloads: [
        { name: 'Company Registration Form', type: 'PDF', size: '2.1 MB', description: 'Form for registering a new company' },
        { name: 'Business License Application', type: 'PDF', size: '1.8 MB', description: 'Application for business operating license' },
        { name: 'Partnership Agreement Template', type: 'DOCX', size: '890 KB', description: 'Template for partnership agreements' },
        { name: 'Articles of Association Template', type: 'DOCX', size: '1.2 MB', description: 'Template for company articles' }
      ]
    },
    {
      title: 'Tax Registration',
      description: 'Tax-related forms and guides',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      downloads: [
        { name: 'TIN Registration Form', type: 'PDF', size: '1.5 MB', description: 'Tax Identification Number application' },
        { name: 'VAT Registration Guide', type: 'PDF', size: '3.2 MB', description: 'Complete guide to VAT registration' },
        { name: 'PAYE Declaration Form', type: 'XLSX', size: '654 KB', description: 'Monthly PAYE declaration template' },
        { name: 'Tax Compliance Certificate', type: 'PDF', size: '890 KB', description: 'Application for tax compliance certificate' }
      ]
    },
    {
      title: 'Investment Licenses',
      description: 'Investment and licensing documentation',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      downloads: [
        { name: 'Investment License Application', type: 'PDF', size: '2.8 MB', description: 'UIA investment license application' },
        { name: 'Business Plan Template', type: 'DOCX', size: '1.9 MB', description: 'Comprehensive business plan template' },
        { name: 'Foreign Exchange Permit', type: 'PDF', size: '1.3 MB', description: 'Application for foreign exchange permit' },
        { name: 'Investment Incentives Guide', type: 'PDF', size: '4.1 MB', description: 'Complete guide to investment incentives' }
      ]
    },
    {
      title: 'Guides & Resources',
      description: 'Comprehensive guides and helpful resources',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      downloads: [
        { name: 'Complete Business Setup Guide', type: 'PDF', size: '5.6 MB', description: 'Step-by-step business setup guide' },
        { name: 'Investment Opportunities in Uganda', type: 'PDF', size: '7.2 MB', description: 'Comprehensive investment opportunities guide' },
        { name: 'Legal Compliance Checklist', type: 'PDF', size: '2.1 MB', description: 'Essential legal compliance checklist' },
        { name: 'Sector-Specific Guidelines', type: 'ZIP', size: '12.8 MB', description: 'Guidelines for different business sectors' }
      ]
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'xlsx':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Downloads
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download essential forms, guides, and resources for business registration and investment in Uganda.
            All documents are official and up-to-date.
          </p>
        </div>

        <div className="space-y-12">
          {downloadCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {category.downloads.map((download, downloadIndex) => (
                    <div key={downloadIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 mr-3">
                          {getFileIcon(download.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {download.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {download.description}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className="bg-gray-200 px-2 py-1 rounded mr-2">{download.type}</span>
                            <span>{download.size}</span>
                          </div>
                        </div>
                      </div>
                      <button className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with Documents?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Our support team can help you understand which documents you need and guide you through the completion process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/tools/document-checklist"
              className="bg-primary-500 text-white border border-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              View Checklist
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700">
                Always ensure you&apos;re using the latest version of forms and documents. Requirements may change based on current regulations.
                When in doubt, contact the relevant government agency or our support team for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}