import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Checklist',
  description: 'Comprehensive checklist for business registration and licensing documents required in Uganda.',
};

export default function DocumentChecklistPage() {
  const checklists = [
    {
      title: 'Business Registration Documents',
      category: 'registration',
      documents: [
        { name: 'National ID or Passport (Copy)', required: true, description: 'Valid identification document of the business owner' },
        { name: 'Memorandum of Association', required: true, description: 'For limited companies only' },
        { name: 'Articles of Association', required: true, description: 'For limited companies only' },
        { name: 'Board Resolution', required: true, description: 'Appointing directors and secretary' },
        { name: 'Statutory Declaration', required: true, description: 'Declaration of compliance with legal requirements' },
        { name: 'Certificate of Name Reservation', required: false, description: 'If you reserved a business name' },
        { name: 'Proof of Physical Address', required: true, description: 'Utility bill or tenancy agreement' },
        { name: 'Business License Application', required: true, description: 'Completed application form' }
      ]
    },
    {
      title: 'Tax Registration Documents',
      category: 'tax',
      documents: [
        { name: 'Certificate of Incorporation', required: true, description: 'Business registration certificate' },
        { name: 'National ID (Original & Copy)', required: true, description: 'Business owner identification' },
        { name: 'Bank Account Opening Letter', required: true, description: 'From your chosen bank' },
        { name: 'TIN Application Form', required: true, description: 'Completed URA form' },
        { name: 'Proof of Business Address', required: true, description: 'Utility bill or lease agreement' },
        { name: 'Partnership Agreement', required: false, description: 'For partnerships only' },
        { name: 'Trading License', required: true, description: 'From local government' }
      ]
    },
    {
      title: 'Investment License Documents',
      category: 'investment',
      documents: [
        { name: 'Investment Application Form', required: true, description: 'UIA investment application' },
        { name: 'Business Plan', required: true, description: 'Detailed 3-5 year business plan' },
        { name: 'Financial Projections', required: true, description: 'Cash flow and profit projections' },
        { name: 'Source of Funds Evidence', required: true, description: 'Bank statements or funding letters' },
        { name: 'Technical Feasibility Study', required: false, description: 'For technical projects' },
        { name: 'Environmental Impact Assessment', required: false, description: 'For projects affecting environment' },
        { name: 'Land Title or Lease Agreement', required: false, description: 'If land is involved' },
        { name: 'Curriculum Vitae', required: true, description: 'CVs of key management personnel' }
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'registration': return 'bg-blue-50 border-blue-200';
      case 'tax': return 'bg-green-50 border-green-200';
      case 'investment': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'registration':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'tax':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'investment':
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Document Checklist
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive checklist for business registration and licensing documents required in Uganda. 
            Make sure you have all necessary documents before starting your application.
          </p>
        </div>
        
        <div className="space-y-8">
          {checklists.map((checklist) => (
            <div key={checklist.category} className={`rounded-xl p-6 border-2 ${getCategoryColor(checklist.category)}`}>
              <div className="flex items-center mb-6">
                {getCategoryIcon(checklist.category)}
                <h2 className="text-2xl font-bold text-gray-900 ml-3">{checklist.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {checklist.documents.map((document, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        document.required 
                          ? 'border-primary-600 bg-primary-600' 
                          : 'border-gray-300'
                      }`}>
                        {document.required && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          document.required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {document.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{document.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Application?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Once you have gathered all the required documents, you can begin your business registration 
            process through our streamlined online platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Registration
            </button>
            <button className="bg-primary-500 text-white border border-primary-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
              Download Checklist
            </button>
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
                Document requirements may vary depending on your specific business type and circumstances. 
                It&apos;s recommended to consult with our support team or visit the relevant government agency 
                for the most up-to-date requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}