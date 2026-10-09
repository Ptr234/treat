'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api-client';

interface BusinessData {
  // Step 1: Business Type
  businessType: string;
  businessStructure: string;

  // Step 2: Business Details
  businessName: string;
  businessDescription: string;
  sector: string;
  location: string;

  // Step 2: Contact — who is filing, and where their confirmation and
  // status updates go. Real values only: this is what lets an applicant
  // track their own submission afterward.
  contactName: string;
  contactEmail: string;
  contactPhone: string;

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

interface ValidationErrors {
  [key: string]: string;
}

export default function BusinessRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>({
    // Step 1: Business Type
    businessType: '',
    businessStructure: '',
    
    // Step 2: Business Details
    businessName: '',
    businessDescription: '',
    sector: '',
    location: '',

    // Step 2: Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',

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

  // Live business-name availability, checked against URSB's registry as the
  // applicant types — mirrors what a real registrar's name-reservation search
  // does, rather than only discovering a conflict after full submission.
  const [nameCheck, setNameCheck] = useState<
    { checking: boolean; available: boolean | null; conflictRef: string | null }
  >({ checking: false, available: null, conflictRef: null });
  const nameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const name = businessData.businessName.trim();
    if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current);
    if (name.length < 3) {
      setNameCheck({ checking: false, available: null, conflictRef: null });
      return;
    }
    setNameCheck((prev) => ({ ...prev, checking: true }));
    nameCheckTimer.current = setTimeout(async () => {
      const res = await apiFetch<{ available: boolean; conflictingReferenceNumber: string | null }>(
        `/api/business-registrations/check-name?name=${encodeURIComponent(name)}`
      );
      if (res.success && res.data) {
        setNameCheck({
          checking: false,
          available: res.data.available,
          conflictRef: res.data.conflictingReferenceNumber,
        });
      } else {
        setNameCheck({ checking: false, available: null, conflictRef: null });
      }
    }, 500);
    return () => {
      if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current);
    };
  }, [businessData.businessName]);

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

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!businessData.businessType) {
          newErrors.businessType = 'Please select a business type';
        }
        if (!businessData.businessStructure) {
          newErrors.businessStructure = 'Please select a business structure';
        }
        break;

      case 2:
        if (!businessData.businessName.trim()) {
          newErrors.businessName = 'Business name is required';
        } else if (nameCheck.available === false) {
          newErrors.businessName = 'This business name is not available — choose a different name';
        }
        if (!businessData.businessDescription.trim()) {
          newErrors.businessDescription = 'Business description is required';
        }
        if (!businessData.sector) {
          newErrors.sector = 'Please select a business sector';
        }
        if (!businessData.location) {
          newErrors.location = 'Please select a business location';
        }
        if (!businessData.contactName.trim()) {
          newErrors.contactName = 'Your name is required';
        }
        if (!businessData.contactEmail.trim()) {
          newErrors.contactEmail = 'An email address is required so you can track this registration';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessData.contactEmail.trim())) {
          newErrors.contactEmail = 'Enter a valid email address';
        }
        break;

      case 3:
        businessData.owners.forEach((owner, index) => {
          if (!owner.name.trim()) {
            newErrors[`owner_${index}_name`] = 'Owner name is required';
          }
          if (!owner.nationality.trim()) {
            newErrors[`owner_${index}_nationality`] = 'Nationality is required';
          }
          if (!owner.idNumber.trim()) {
            newErrors[`owner_${index}_idNumber`] = 'ID number is required';
          }
          if (!owner.percentage.trim()) {
            newErrors[`owner_${index}_percentage`] = 'Percentage is required';
          } else {
            const percentage = parseFloat(owner.percentage);
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
              newErrors[`owner_${index}_percentage`] = 'Percentage must be between 1 and 100';
            }
          }
        });

        // Check if total percentage equals 100%
        const totalPercentage = businessData.owners.reduce((sum, owner) => {
          const percentage = parseFloat(owner.percentage) || 0;
          return sum + percentage;
        }, 0);
        
        if (Math.abs(totalPercentage - 100) > 0.01) {
          newErrors.totalPercentage = 'Total ownership percentage must equal 100%';
        }
        break;

      case 4:
        if (!businessData.initialCapital.trim()) {
          newErrors.initialCapital = 'Initial capital is required';
        } else {
          const capital = parseFloat(businessData.initialCapital);
          if (isNaN(capital) || capital <= 0) {
            newErrors.initialCapital = 'Initial capital must be a positive number';
          }
        }
        if (!businessData.projectedTurnover.trim()) {
          newErrors.projectedTurnover = 'Projected turnover is required';
        } else {
          const turnover = parseFloat(businessData.projectedTurnover);
          if (isNaN(turnover) || turnover <= 0) {
            newErrors.projectedTurnover = 'Projected turnover must be a positive number';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

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
    if (validateStep(currentStep)) {
      clearErrors();
      if (currentStep < 5) {
        if (currentStep === 4) {
          calculateRequirements();
        }
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      clearErrors();
      setCurrentStep(currentStep - 1);
    }
  };

  const [submitResult, setSubmitResult] = useState<{ referenceNumber: string } | null>(null);

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    if (nameCheck.available === false) {
      setErrors({ submit: 'That business name is not available. Go back and choose a different name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // A real registration transaction — its own tracked record with a name-
      // availability check and a certificate on completion, not a support ticket.
      const payload = {
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        businessStructure: businessData.businessStructure,
        businessDescription: businessData.businessDescription,
        sector: businessData.sector,
        location: businessData.location,
        owners: businessData.owners.map((o) => ({
          name: o.name, nationality: o.nationality, idNumber: o.idNumber, percentage: o.percentage,
        })),
        initialCapital: businessData.initialCapital ? `UGX ${businessData.initialCapital}` : null,
        projectedTurnover: businessData.projectedTurnover ? `UGX ${businessData.projectedTurnover}` : null,
        contactName: businessData.contactName,
        contactEmail: businessData.contactEmail,
        contactPhone: businessData.contactPhone || null,
      };

      const res = await apiFetch<{ referenceNumber: string }>('/api/business-registrations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.success) throw new Error(res.error);
      const refNumber = res.data?.referenceNumber || `REG-${Date.now()}`;
      setSubmitResult({ referenceNumber: refNumber });

      // Reset form
      setCurrentStep(1);
      setBusinessData({
        businessType: '',
        businessStructure: '',
        businessName: '',
        businessDescription: '',
        sector: '',
        location: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        owners: [{ name: '', nationality: '', idNumber: '', percentage: '' }],
        initialCapital: '',
        projectedTurnover: '',
        requirements: [],
        estimatedCost: 0,
        timeframe: ''
      });

    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Business Type & Structure</h3>
            
            <div>
              <label className="gov-label">
                Choose your business type:
              </label>
              {errors.businessType && (
                <p className="text-red-600 text-sm mb-2">{errors.businessType}</p>
              )}
              <div className="grid grid-cols-1 gap-4">
                {businessTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border-2 p-4 cursor-pointer transition-colors ${
                      businessData.businessType === type.value
                        ? 'border-black bg-[#fffbea] shadow-[inset_6px_0_0_#ffd700]'
                        : 'border-[#dcd8cf] hover:border-black'
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
                        <div className="font-medium text-black">{type.label}</div>
                        <div className="text-sm text-neutral-700">{type.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {businessData.businessType && businessStructures[businessData.businessType as keyof typeof businessStructures] && (
              <div>
                <label className="gov-label">
                  Choose your business structure:
                </label>
                {errors.businessStructure && (
                  <p className="text-red-600 text-sm mb-2">{errors.businessStructure}</p>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {businessStructures[businessData.businessType as keyof typeof businessStructures]?.map((structure) => (
                    <div
                      key={structure.value}
                      className={`border-2 p-3 cursor-pointer transition-colors ${
                        businessData.businessStructure === structure.value
                          ? 'border-black bg-[#fffbea] shadow-[inset_6px_0_0_#ffd700]'
                          : 'border-[#dcd8cf] hover:border-black'
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
                        <div className="font-medium text-black">{structure.label}</div>
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
            <h3 className="gov-title-m border-b-2 border-black pb-3">Business Details</h3>

            <div>
              <label className="gov-label">
                Business Name
              </label>
              <input
                type="text"
                value={businessData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={`gov-input ${
                  errors.businessName ? '!border-[#ce1126]' : ''
                }`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>
              )}
              {!errors.businessName && businessData.businessName.trim().length >= 3 && (
                <p className={`text-sm mt-1 ${
                  nameCheck.checking ? 'text-neutral-600'
                    : nameCheck.available === false ? 'text-red-600'
                    : nameCheck.available === true ? 'text-black' : 'text-neutral-600'
                }`}>
                  {nameCheck.checking
                    ? 'Checking availability against the URSB registry…'
                    : nameCheck.available === false
                      ? `Not available — already registered as ${nameCheck.conflictRef}`
                      : nameCheck.available === true
                        ? 'Available'
                        : ''}
                </p>
              )}
            </div>

            <div>
              <label className="gov-label">
                Business Description
              </label>
              <textarea
                value={businessData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className={`gov-input ${
                  errors.businessDescription ? '!border-[#ce1126]' : ''
                }`}
                rows={4}
                placeholder="Describe what your business does"
              />
              {errors.businessDescription && (
                <p className="text-red-600 text-sm mt-1">{errors.businessDescription}</p>
              )}
            </div>

            <div>
              <label className="gov-label">
                Business Sector
              </label>
              <select
                value={businessData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className={`gov-input ${
                  errors.sector ? '!border-[#ce1126]' : ''
                }`}
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              {errors.sector && (
                <p className="text-red-600 text-sm mt-1">{errors.sector}</p>
              )}
            </div>

            <div>
              <label className="gov-label">
                Business Location
              </label>
              <select
                value={businessData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`gov-input ${
                  errors.location ? '!border-[#ce1126]' : ''
                }`}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h4 className="text-lg font-medium text-black mb-1">Your Contact Information</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Used to send your confirmation and let you track this registration — not shared publicly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="gov-label">Your Name</label>
                  <input
                    type="text"
                    value={businessData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`gov-input ${
                      errors.contactName ? '!border-[#ce1126]' : ''
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.contactName && (
                    <p className="text-red-600 text-sm mt-1">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="gov-label">Phone (optional)</label>
                  <input
                    type="tel"
                    value={businessData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="gov-input"
                    placeholder="+256 700 000 000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="gov-label">Email Address</label>
                  <input
                    type="email"
                    value={businessData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className={`gov-input ${
                      errors.contactEmail ? '!border-[#ce1126]' : ''
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Ownership Information</h3>
            
            {errors.totalPercentage && (
              <div className="border-l-4 border-red-600 pl-4 py-2 text-red-700">
                <p className="text-red-600 text-sm">{errors.totalPercentage}</p>
              </div>
            )}
            
            <div className="border-l border-neutral-200 pl-4 py-2">
              <p className="text-black font-semibold text-sm">
                Current Total Ownership: {businessData.owners.reduce((sum, owner) => {
                  const percentage = parseFloat(owner.percentage) || 0;
                  return sum + percentage;
                }, 0)}%
              </p>
            </div>

            {businessData.owners.map((owner, index) => (
              <div key={index} className="border-t-2 border-neutral-300 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-black">
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
                    <label className="gov-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={owner.name}
                      onChange={(e) => handleInputChange('owners', { name: e.target.value }, index)}
                      className={`gov-input ${
                        errors[`owner_${index}_name`] ? '!border-[#ce1126]' : ''
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors[`owner_${index}_name`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`owner_${index}_name`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="gov-label">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={owner.nationality}
                      onChange={(e) => handleInputChange('owners', { nationality: e.target.value }, index)}
                      className={`gov-input ${
                        errors[`owner_${index}_nationality`] ? '!border-[#ce1126]' : ''
                      }`}
                      placeholder="Enter nationality"
                    />
                    {errors[`owner_${index}_nationality`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`owner_${index}_nationality`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="gov-label">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={owner.idNumber}
                      onChange={(e) => handleInputChange('owners', { idNumber: e.target.value }, index)}
                      className={`gov-input ${
                        errors[`owner_${index}_idNumber`] ? '!border-[#ce1126]' : ''
                      }`}
                      placeholder="Enter ID number"
                    />
                    {errors[`owner_${index}_idNumber`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`owner_${index}_idNumber`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="gov-label">
                      Ownership Percentage
                    </label>
                    <input
                      type="number"
                      value={owner.percentage}
                      onChange={(e) => handleInputChange('owners', { percentage: e.target.value }, index)}
                      className={`gov-input ${
                        errors[`owner_${index}_percentage`] ? '!border-[#ce1126]' : ''
                      }`}
                      placeholder="Enter percentage"
                      min="0"
                      max="100"
                    />
                    {errors[`owner_${index}_percentage`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`owner_${index}_percentage`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addOwner}
              className="w-full border-2 border-dashed border-[#262522] bg-[#f5f3ee] px-4 py-3 font-bold text-black hover:bg-[#ebe8e1]"
            >
              + Add Another Owner
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Financial Information</h3>
            
            <div>
              <label className="gov-label">
                Initial Capital (UGX)
              </label>
              <input
                type="number"
                value={businessData.initialCapital}
                onChange={(e) => handleInputChange('initialCapital', e.target.value)}
                className={`gov-input ${
                  errors.initialCapital ? '!border-[#ce1126]' : ''
                }`}
                placeholder="Enter initial capital"
              />
              {errors.initialCapital && (
                <p className="text-red-600 text-sm mt-1">{errors.initialCapital}</p>
              )}
            </div>

            <div>
              <label className="gov-label">
                Projected Annual Turnover (UGX)
              </label>
              <input
                type="number"
                value={businessData.projectedTurnover}
                onChange={(e) => handleInputChange('projectedTurnover', e.target.value)}
                className={`gov-input ${
                  errors.projectedTurnover ? '!border-[#ce1126]' : ''
                }`}
                placeholder="Enter projected turnover"
              />
              {errors.projectedTurnover && (
                <p className="text-red-600 text-sm mt-1">{errors.projectedTurnover}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="gov-title-m border-b-2 border-black pb-3">Registration Requirements</h3>
            
            <div className="border-l border-neutral-200 pl-4 py-2">
              <h4 className="text-lg font-medium text-black mb-2">
                Estimated Cost: UGX {businessData.estimatedCost.toLocaleString()}
              </h4>
              <p className="text-black font-semibold">
                Estimated Timeframe: {businessData.timeframe}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-black mb-4">Required Documents & Licenses:</h4>
              <div className="space-y-3">
                {businessData.requirements.map((req, index) => (
                  <div key={index} className="border-t-2 border-neutral-200 pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-black">{req.item}</h5>
                        <p className="text-sm text-neutral-700">{req.authority}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-black">
                          {req.cost === 0 ? 'Free' : `UGX ${req.cost.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className=" pl-4 py-2">
              <h4 className="text-lg font-medium text-neutral-900 mb-2">Next Steps</h4>
              <ol className="list-decimal list-inside space-y-2 text-red-600">
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
    <div>
      {/* Success Banner */}
      {submitResult && (
        <div role="status" className="gov-panel mb-8">
          <h4 className="font-display text-2xl font-semibold text-white">Registration submitted</h4>
          <p className="mt-2 text-white">
            Reference Number: <strong>{submitResult.referenceNumber}</strong>
          </p>
          <p className="mt-2 text-sm text-white/80">
            A confirmation has been sent to your email. URSB will review your business name next. The
            registration fee can be paid from the tracking page below at any point — it must be settled
            before your certificate can be issued.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <a
              href={`/business/registration/${submitResult.referenceNumber}/`}
              className="gov-btn gov-btn--gold gov-btn--sm"
            >
              Track This Registration
            </a>
            <button
              onClick={() => setSubmitResult(null)}
              className="text-sm text-white underline underline-offset-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-6 border-l-4 border-red-600 pl-4 py-2 text-red-700">
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between min-w-[280px]">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 text-sm sm:text-base ${
                  currentStep >= step
                    ? 'border-black bg-black text-[#ffd700]'
                    : 'border-neutral-400 bg-white text-neutral-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-[#dcd8cf]">
            <div
              className="h-2 bg-black transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      {/* initial={false} on AnimatePresence: the first step is already visible
          in the server-rendered HTML, so it must not depend on the mount
          animation to reveal it — a hydration mismatch elsewhere in this
          subtree (browser-injected autofill styling on the radio inputs) can
          leave that initial animation stuck at opacity:0, permanently hiding
          the step. Step-to-step transitions (key change) still animate. */}
      <AnimatePresence mode="wait" initial={false}>
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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gov-btn gov-btn--secondary"
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="gov-btn"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gov-btn"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                Processing...
              </>
            ) : (
              'Start Registration Process'
            )}
          </button>
        )}
      </div>
    </div>
  );
}