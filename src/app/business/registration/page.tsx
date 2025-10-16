import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Registration',
  description: 'Streamlined business registration process with digital document submission and comprehensive support.',
};

export default function BusinessRegistrationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Business Registration
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamlined business registration process with digital document submission and comprehensive support.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Registration Process
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Choose Business Type
                </h3>
                <p className="text-gray-600">
                  Select your business structure: sole proprietorship, partnership, limited company, or cooperative.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Application
                </h3>
                <p className="text-gray-600">
                  Fill out the comprehensive business registration form with all required details.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Documents
                </h3>
                <p className="text-gray-600">
                  Submit required documents digitally including ID, certificates, and supporting materials.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Review & Submit
                </h3>
                <p className="text-gray-600">
                  Review your application, make any necessary corrections, and submit for processing.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Start Registration Process
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Registration wizard will be implemented in the next migration phase
          </p>
        </div>
      </div>
    </div>
  );
}