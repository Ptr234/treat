'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessData {
  // Step 1: Business Type
  businessType: string;
  businessStructure: string;
  
  // Step 2: Business Details
  businessName: string;
  businessDescription: string;
  sector: string;
  location: string;
  
  // Step 3: Ownership
  owners: Array<{
    name: string;
    nationality: string;
    idNumber: string;
    percentage: string;
  }>;
  
  // Step 4: Financial Information
  initialCapital: string;
  projectedTurnover: string;
  
  // Step 5: Registration Requirements
  requirements: Array<{
    item: string;
    cost: number;
    authority: string;
  }>;
  estimatedCost: number;
  timeframe: string;
}

export default function BusinessRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    // Step 1: Business Type
    businessType: '',
    businessStructure: '',
    
    // Step 2: Business Details
    businessName: '',
    businessDescription: '',
    sector: '',
    location: '',
    
    // Step 3: Ownership
    owners: [{ name: '', nationality: '', idNumber: '', percentage: '' }],
    
    // Step 4: Financial Information
    initialCapital: '',
    projectedTurnover: '',
    
    // Step 5: Registration Requirements
    requirements: [],
    estimatedCost: 0,
    timeframe: ''
  });

  const businessTypes = [
    { value: 'sole-proprietorship', label: 'Sole Proprietorship', description: 'Individual business ownership' },
    { value: 'partnership', label: 'Partnership', description: 'Two or more partners' },
    { value: 'limited-company', label: 'Limited Company', description: 'Separate legal entity' },
    { value: 'ngo', label: 'NGO/Foundation', description: 'Non-profit organization' },
    { value: 'cooperative', label: 'Cooperative', description: 'Member-owned organization' }
  ];

  const businessStructures: Record<string, Array<{ value: string; label: string }>> = {
    'sole-proprietorship': [
      { value: 'individual', label: 'Individual Business' }
    ],
    'partnership': [
      { value: 'general', label: 'General Partnership' },
      { value: 'limited', label: 'Limited Partnership' }
    ],
    'limited-company': [
      { value: 'private', label: 'Private Limited Company' },
      { value: 'public', label: 'Public Limited Company' },
      { value: 'guarantee', label: 'Company Limited by Guarantee' }
    ],
    'ngo': [
      { value: 'ngo', label: 'Non-Governmental Organization' },
      { value: 'foundation', label: 'Foundation' },
      { value: 'trust', label: 'Trust' }
    ],
    'cooperative': [
      { value: 'primary', label: 'Primary Cooperative' },
      { value: 'secondary', label: 'Secondary Cooperative' }
    ]
  };

  const sectors = [
    'Agriculture & Agribusiness',
    'Tourism & Hospitality',
    'Manufacturing',
    'ICT & Digital Services',
    'Mining & Minerals',
    'Energy & Utilities',
    'Healthcare',
    'Education',
    'Trade & Commerce',
    'Financial Services',
    'Transport & Logistics',
    'Construction & Real Estate',
    'Other'
  ];

  const locations = [
    'Kampala',
    'Entebbe',
    'Jinja',
    'Mbale',
    'Gulu',
    'Mbarara',
    'Fort Portal',
    'Masaka',
    'Soroti',
    'Arua',
    'Other'
  ];

  const handleInputChange = (field: keyof BusinessData, value: unknown, index: number | null = null) => {
    if (field === 'owners' && index !== null) {
      const newOwners = [...businessData.owners];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const updateValue = value as Partial<BusinessData['owners'][0]>;
        newOwners[index] = { 
          name: updateValue.name ?? newOwners[index]?.name ?? '',
          nationality: updateValue.nationality ?? newOwners[index]?.nationality ?? '',
          idNumber: updateValue.idNumber ?? newOwners[index]?.idNumber ?? '',
          percentage: updateValue.percentage ?? newOwners[index]?.percentage ?? ''
        };
      } else {
        newOwners[index] = value as BusinessData['owners'][0];
      }
      setBusinessData(prev => ({ ...prev, owners: newOwners }));
    } else {
      setBusinessData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addOwner = () => {
    setBusinessData(prev => ({
      ...prev,
      owners: [...prev.owners, { name: '', nationality: '', idNumber: '', percentage: '' }]
    }));
  };

  const removeOwner = (index: number) => {
    if (businessData.owners.length > 1) {
      setBusinessData(prev => ({
        ...prev,
        owners: prev.owners.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateRequirements = () => {
    const requirements: Array<{ item: string; cost: number; authority: string }> = [];
    let cost = 0;
    let timeframe = '';

    // Base requirements based on business type
    if (businessData.businessType === 'sole-proprietorship') {
      requirements.push(
        { item: 'Business License', cost: 150000, authority: 'KCCA/Local Council' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'Trading License', cost: 100000, authority: 'Local Government' }
      );
      timeframe = '5-7 business days';
    } else if (businessData.businessType === 'partnership') {
      requirements.push(
        { item: 'Partnership Agreement', cost: 200000, authority: 'Legal Practitioner' },
        { item: 'Business License', cost: 150000, authority: 'KCCA/Local Council' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'Partnership Registration', cost: 50000, authority: 'URSB' }
      );
      timeframe = '7-10 business days';
    } else if (businessData.businessType === 'limited-company') {
      requirements.push(
        { item: 'Company Registration', cost: 250000, authority: 'URSB' },
        { item: 'Memorandum & Articles', cost: 300000, authority: 'Legal Practitioner' },
        { item: 'Tax Registration (TIN)', cost: 0, authority: 'URA' },
        { item: 'VAT Registration', cost: 0, authority: 'URA (if required)' },
        { item: 'NSSF Registration', cost: 0, authority: 'NSSF' },
        { item: 'Workers Compensation', cost: 100000, authority: 'Insurance Company' }
      );
      timeframe = '14-21 business days';
    }

    cost = requirements.reduce((total, req) => total + req.cost, 0);

    setBusinessData(prev => ({
      ...prev,
      requirements,
      estimatedCost: cost,
      timeframe
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      if (currentStep === 4) {
        calculateRequirements();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Business Type & Structure</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose your business type:
              </label>
              <div className="grid grid-cols-1 gap-4">
                {businessTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      businessData.businessType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleInputChange('businessType', type.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="businessType"
                        value={type.value}
                        checked={businessData.businessType === type.value}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {businessData.businessType && businessStructures[businessData.businessType as keyof typeof businessStructures] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose your business structure:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {businessStructures[businessData.businessType as keyof typeof businessStructures]?.map((structure) => (
                    <div
                      key={structure.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        businessData.businessStructure === structure.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleInputChange('businessStructure', structure.value)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="businessStructure"
                          value={structure.value}
                          checked={businessData.businessStructure === structure.value}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div className="font-medium text-gray-900">{structure.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Business Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={businessData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={businessData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe what your business does"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Sector
              </label>
              <select
                value={businessData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Location
              </label>
              <select
                value={businessData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Ownership Information</h3>
            
            {businessData.owners.map((owner, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Owner {index + 1}
                  </h4>
                  {businessData.owners.length > 1 && (
                    <button
                      onClick={() => removeOwner(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={owner.name}
                      onChange={(e) => handleInputChange('owners', { name: e.target.value }, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={owner.nationality}
                      onChange={(e) => handleInputChange('owners', { nationality: e.target.value }, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter nationality"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={owner.idNumber}
                      onChange={(e) => handleInputChange('owners', { idNumber: e.target.value }, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter ID number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Percentage
                    </label>
                    <input
                      type="number"
                      value={owner.percentage}
                      onChange={(e) => handleInputChange('owners', { percentage: e.target.value }, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter percentage"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addOwner}
              className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Add Another Owner
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Financial Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Capital (UGX)
              </label>
              <input
                type="number"
                value={businessData.initialCapital}
                onChange={(e) => handleInputChange('initialCapital', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter initial capital"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projected Annual Turnover (UGX)
              </label>
              <input
                type="number"
                value={businessData.projectedTurnover}
                onChange={(e) => handleInputChange('projectedTurnover', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter projected turnover"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Registration Requirements</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                Estimated Cost: UGX {businessData.estimatedCost.toLocaleString()}
              </h4>
              <p className="text-blue-700">
                Estimated Timeframe: {businessData.timeframe}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Required Documents & Licenses:</h4>
              <div className="space-y-3">
                {businessData.requirements.map((req, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{req.item}</h5>
                        <p className="text-sm text-gray-600">{req.authority}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {req.cost === 0 ? 'Free' : `UGX ${req.cost.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-green-900 mb-2">Next Steps</h4>
              <ol className="list-decimal list-inside space-y-2 text-green-700">
                <li>Prepare all required documents</li>
                <li>Visit the respective authorities or apply online</li>
                <li>Pay the required fees</li>
                <li>Wait for processing and approval</li>
                <li>Collect your certificates and licenses</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Start Registration Process
          </button>
        )}
      </div>
    </div>
  );
}