import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotification } from '../contexts/NotificationContext'

const DocumentChecklist = () => {
  const [selectedService, setSelectedService] = useState('')
  const [checkedDocuments, setCheckedDocuments] = useState({})
  const [progress, setProgress] = useState(0)
  const { addNotification } = useNotification()

  const services = {
    'company-registration': {
      title: 'Company Registration',
      description: 'Register a new limited company with URSB',
      documents: [
        {
          id: 'memorandum',
          name: 'Memorandum and Articles of Association',
          description: 'Legal documents defining company structure and operations',
          required: true,
          tips: 'Must be prepared by a qualified lawyer and stamped'
        },
        {
          id: 'form-a',
          name: 'URSB Form A (Application for Registration)',
          description: 'Official application form for company registration',
          required: true,
          tips: 'Available online or at URSB offices'
        },
        {
          id: 'id-copies',
          name: 'ID Copies of Directors/Shareholders',
          description: 'Copies of national IDs or passports for all directors',
          required: true,
          tips: 'Must be clear and legible copies'
        },
        {
          id: 'passport-photos',
          name: 'Passport Photos',
          description: '2 passport photos for each director/shareholder',
          required: true,
          tips: 'Recent photos with white background'
        },
        {
          id: 'company-seal',
          name: 'Company Seal',
          description: 'Official company seal for documents',
          required: false,
          tips: 'Can be made after registration'
        },
        {
          id: 'share-certificates',
          name: 'Share Certificates',
          description: 'Certificates showing share ownership',
          required: false,
          tips: 'Usually prepared after registration'
        }
      ]
    },
    'tax-registration': {
      title: 'Tax Registration (TIN)',
      description: 'Register for Tax Identification Number with URA',
      documents: [
        {
          id: 'certificate-incorporation',
          name: 'Certificate of Incorporation',
          description: 'Proof of company registration',
          required: true,
          tips: 'Original or certified copy from URSB'
        },
        {
          id: 'memorandum-copy',
          name: 'Memorandum & Articles (Copy)',
          description: 'Copy of company constitution',
          required: true,
          tips: 'Certified copy acceptable'
        },
        {
          id: 'directors-details',
          name: 'Directors\' Personal Details',
          description: 'Full details of all company directors',
          required: true,
          tips: 'Include addresses and contact information'
        },
        {
          id: 'business-address',
          name: 'Business Address Proof',
          description: 'Evidence of business location',
          required: true,
          tips: 'Lease agreement or ownership documents'
        },
        {
          id: 'bank-details',
          name: 'Bank Account Details',
          description: 'Company bank account information',
          required: false,
          tips: 'Helps with tax compliance setup'
        }
      ]
    },
    'work-permit': {
      title: 'Work Permit Application',
      description: 'Apply for work permit for foreign nationals',
      documents: [
        {
          id: 'passport',
          name: 'Valid Passport',
          description: 'Passport with at least 6 months validity',
          required: true,
          tips: 'Must have blank pages for visa stamps'
        },
        {
          id: 'application-form',
          name: 'Work Permit Application Form',
          description: 'Completed application form',
          required: true,
          tips: 'Available from immigration offices'
        },
        {
          id: 'employment-letter',
          name: 'Employment Letter',
          description: 'Letter from employing company',
          required: true,
          tips: 'Must be on company letterhead'
        },
        {
          id: 'academic-certificates',
          name: 'Academic Certificates',
          description: 'Educational qualifications',
          required: true,
          tips: 'Must be verified and apostilled'
        },
        {
          id: 'medical-certificate',
          name: 'Medical Certificate',
          description: 'Health clearance certificate',
          required: true,
          tips: 'From approved medical centers'
        },
        {
          id: 'police-clearance',
          name: 'Police Clearance Certificate',
          description: 'Criminal background check',
          required: true,
          tips: 'From home country and Uganda if applicable'
        },
        {
          id: 'cv',
          name: 'Curriculum Vitae',
          description: 'Detailed professional resume',
          required: true,
          tips: 'Should match employment letter details'
        },
        {
          id: 'company-registration',
          name: 'Company Registration Documents',
          description: 'Employer company registration proof',
          required: true,
          tips: 'URSB certificate and TIN certificate'
        }
      ]
    },
    'investment-license': {
      title: 'Investment License',
      description: 'Apply for investment license with UIA',
      documents: [
        {
          id: 'project-profile',
          name: 'Investment Project Profile',
          description: 'Detailed project description and plan',
          required: true,
          tips: 'Must include financial projections'
        },
        {
          id: 'feasibility-study',
          name: 'Feasibility Study',
          description: 'Technical and financial feasibility analysis',
          required: true,
          tips: 'Prepared by qualified consultants'
        },
        {
          id: 'environmental-assessment',
          name: 'Environmental Impact Assessment',
          description: 'EIA if required for project type',
          required: false,
          tips: 'Required for certain industries'
        },
        {
          id: 'land-documents',
          name: 'Land Title/Lease Documents',
          description: 'Proof of land ownership or lease',
          required: true,
          tips: 'Must be registered land'
        },
        {
          id: 'financial-statements',
          name: 'Financial Statements',
          description: 'Proof of financial capacity',
          required: true,
          tips: 'Bank statements or audited accounts'
        },
        {
          id: 'technical-drawings',
          name: 'Technical Drawings/Plans',
          description: 'Architectural or engineering plans',
          required: false,
          tips: 'Required for construction projects'
        }
      ]
    },
    'vat-registration': {
      title: 'VAT Registration',
      description: 'Register for Value Added Tax with URA',
      documents: [
        {
          id: 'tin-certificate',
          name: 'TIN Certificate',
          description: 'Tax Identification Number certificate',
          required: true,
          tips: 'Must be current and valid'
        },
        {
          id: 'business-license',
          name: 'Business License',
          description: 'Valid business operating license',
          required: true,
          tips: 'From relevant local authority'
        },
        {
          id: 'financial-projections',
          name: 'Financial Projections',
          description: 'Projected annual turnover',
          required: true,
          tips: 'Must exceed VAT threshold (UGX 150M)'
        },
        {
          id: 'business-premises',
          name: 'Business Premises Details',
          description: 'Physical location of business',
          required: true,
          tips: 'With clear address and contact information'
        },
        {
          id: 'inventory-records',
          name: 'Inventory Records',
          description: 'Stock/inventory documentation',
          required: false,
          tips: 'For trading businesses'
        }
      ]
    }
  }

  const handleDocumentCheck = (documentId, checked) => {
    setCheckedDocuments(prev => ({
      ...prev,
      [documentId]: checked
    }))

    // Calculate progress
    if (selectedService) {
      const documents = services[selectedService].documents
      const requiredDocs = documents.filter(doc => doc.required)
      const checkedRequired = requiredDocs.filter(doc => 
        checkedDocuments[doc.id] || (doc.id === documentId && checked)
      ).length
      const newProgress = Math.round((checkedRequired / requiredDocs.length) * 100)
      setProgress(newProgress)

      if (newProgress === 100) {
        addNotification({
          type: 'success',
          title: 'Documents Complete!',
          message: 'All required documents have been checked. You\'re ready to proceed!',
          duration: 4000
        })
      }
    }
  }

  const resetChecklist = () => {
    setCheckedDocuments({})
    setProgress(0)
    addNotification({
      type: 'info',
      title: 'Checklist Reset',
      message: 'Document checklist has been reset',
      duration: 2000
    })
  }

  const generateChecklistPDF = () => {
    if (!selectedService) return

    const service = services[selectedService]
    const checklistHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Checklist - ${service.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fbbf24, #dc2626); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .progress { background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #10b981; }
        .document { display: flex; align-items: flex-start; padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #fbbf24; }
        .document.required { border-left-color: #dc2626; }
        .document.optional { border-left-color: #6b7280; }
        .checkbox { width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; }
        .document-info { flex: 1; }
        .document-name { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .document-desc { color: #4b5563; font-size: 14px; margin-bottom: 8px; }
        .document-tips { color: #059669; font-size: 12px; font-style: italic; }
        .required-badge { background: #dc2626; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-left: 10px; }
        .optional-badge { background: #6b7280; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-left: 10px; }
        .contact-info { background: #fffbeb; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #f59e0b; }
        @media print { body { margin: 0; padding: 15px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🇺🇬 Document Checklist</h1>
        <h2>${service.title}</h2>
        <p>${service.description}</p>
    </div>
    
    <div class="progress">
        <h3>📊 Progress: ${progress}% Complete</h3>
        <p>✅ Required documents completed: ${Object.keys(checkedDocuments).filter(id => 
          checkedDocuments[id] && services[selectedService].documents.find(doc => 
            doc.id === id && doc.required
          )
        ).length} of ${services[selectedService].documents.filter(doc => doc.required).length}</p>
    </div>
    
    <div class="documents">
        ${service.documents.map(doc => `
            <div class="document ${doc.required ? 'required' : 'optional'}">
                <input type="checkbox" class="checkbox" ${checkedDocuments[doc.id] ? 'checked' : ''}>
                <div class="document-info">
                    <div class="document-name">
                        ${doc.name}
                        <span class="${doc.required ? 'required' : 'optional'}-badge">
                            ${doc.required ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                    </div>
                    <div class="document-desc">${doc.description}</div>
                    <div class="document-tips">💡 Tip: ${doc.tips}</div>
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="contact-info">
        <h3>📞 Need Help?</h3>
        <p><strong>OneStopCentre Uganda:</strong> +256 775 692 335 | support@onestopcentre.ug</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
</body>
</html>`

    const blob = new Blob([checklistHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${service.title.replace(/\s+/g, '_')}_Checklist.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: 'Checklist Downloaded',
      message: `${service.title} document checklist has been downloaded`,
      duration: 4000
    })
  }

  return (
    <section id="document-checklist" className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Document Checklist Tool
          </h2>
          <p className="text-xl text-gray-600">
            Ensure you have all required documents for your government service application
          </p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Service Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(services).map(([key, service]) => (
                <div
                  key={key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedService === key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                  onClick={() => {
                    setSelectedService(key)
                    setCheckedDocuments({})
                    setProgress(0)
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="service"
                      value={key}
                      checked={selectedService === key}
                      onChange={() => {}}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <label className="ml-3 block">
                      <span className="text-lg font-medium text-gray-900">{service.title}</span>
                      <span className="block text-sm text-gray-600">{service.description}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-emerald-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Required Documents
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={resetChecklist}
                      className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={generateChecklistPDF}
                      className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Download Checklist
                    </button>
                  </div>
                </div>

                {services[selectedService].documents.map((document) => (
                  <div
                    key={document.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      checkedDocuments[document.id]
                        ? 'border-emerald-500 bg-emerald-50'
                        : document.required
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={document.id}
                        checked={checkedDocuments[document.id] || false}
                        onChange={(e) => handleDocumentCheck(document.id, e.target.checked)}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-1"
                      />
                      <div className="ml-4 flex-1">
                        <label htmlFor={document.id} className="cursor-pointer">
                          <div className="flex items-center mb-2">
                            <span className="text-lg font-medium text-gray-900">
                              {document.name}
                            </span>
                            <span
                              className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                document.required
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {document.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{document.description}</p>
                          <p className="text-sm text-emerald-600 italic">
                            💡 Tip: {document.tips}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-3">📋 Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {services[selectedService].documents.filter(doc => doc.required).length}
                    </div>
                    <div className="text-emerald-700">Required Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {Object.keys(checkedDocuments).filter(id => 
                        checkedDocuments[id] && services[selectedService].documents.find(doc => 
                          doc.id === id && doc.required
                        )
                      ).length}
                    </div>
                    <div className="text-teal-700">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {services[selectedService].documents.filter(doc => !doc.required).length}
                    </div>
                    <div className="text-blue-700">Optional Documents</div>
                  </div>
                </div>
                
                {progress === 100 && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🎉</span>
                      <div>
                        <div className="font-bold text-green-800">Ready to Proceed!</div>
                        <div className="text-sm text-green-700">
                          All required documents have been checked. You can now submit your application.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DocumentChecklist