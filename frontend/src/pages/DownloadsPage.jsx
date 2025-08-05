import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { PageBackground } from '../utils/backgroundSystem.jsx'
import Breadcrumb from '../components/Breadcrumb'
import PageTransition from '../components/PageTransition'
import { useNotification } from '../contexts/NotificationContext'

const DownloadsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const location = useLocation()
  const { addNotification } = useNotification()

  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    
    if (category) {
      const categoryMapping = {
        'investment': 'Investment',
        'tax': 'Tax',
        'legal': 'Legal',
        'reports': 'Reports'
      }
      const categoryName = categoryMapping[category.toLowerCase()]
      if (categoryName) {
        setSelectedCategory(categoryName)
      }
    }
  }, [location])

  // Download handler function
  const handleDownload = (doc) => {
    try {
      if (doc.generate) {
        // Generate document locally
        doc.generate()
        addNotification({
          type: 'success',
          title: 'Document Generated',
          message: `${doc.title} has been generated and downloaded`,
          duration: 3000
        })
      } else if (doc.redirect) {
        // Redirect to official website
        addNotification({
          type: 'info',
          title: 'Redirecting to Official Site',
          message: `Opening ${doc.authority} website for official forms`,
          duration: 4000
        })
        window.open(doc.url, '_blank')
      } else if (doc.url.startsWith('http')) {
        // External URL - notify about potential broken link
        addNotification({
          type: 'warning',
          title: 'External Link',
          message: 'If link doesn\'t work, we\'ll help you find the document',
          duration: 4000
        })
        window.open(doc.url, '_blank')
      } else {
        // For local files, use direct download
        const link = document.createElement('a')
        link.href = doc.url
        link.download = doc.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        addNotification({
          type: 'success',
          title: 'Download Started',
          message: `Downloading ${doc.title}`,
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Download failed:', error)
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Please try again or contact support',
        duration: 4000
      })
    }
  }
  
  // Generate sample documents
  const generateBusinessPlan = () => {
    const businessPlanHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uganda Business Plan Template</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fbbf24, #dc2626); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .checklist { background: #e8f5e8; padding: 15px; border-left: 4px solid #10b981; }
        h1, h2, h3 { color: #1f2937; }
        .fillable { background: #fff3cd; padding: 10px; border: 1px dashed #ffc107; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🇺🇬 Uganda Business Plan Template</h1>
        <p>Professional Business Plan for Ugandan Enterprises</p>
    </div>
    
    <div class="section">
        <h2>1. Executive Summary</h2>
        <div class="fillable">[Describe your business concept, mission, and key objectives]</div>
        <p><strong>Business Name:</strong> <span class="fillable">[Your Business Name]</span></p>
        <p><strong>Location:</strong> <span class="fillable">[Business Location in Uganda]</span></p>
        <p><strong>Business Type:</strong> <span class="fillable">[Sole Proprietorship/Partnership/Limited Company]</span></p>
    </div>
    
    <div class="section">
        <h2>2. Market Analysis</h2>
        <h3>Target Market in Uganda:</h3>
        <div class="fillable">[Describe your target customers and market size]</div>
        <h3>Competition Analysis:</h3>
        <div class="fillable">[Analyze competitors in your sector]</div>
    </div>
    
    <div class="section">
        <h2>3. Financial Projections</h2>
        <p><strong>Initial Capital Required:</strong> UGX <span class="fillable">[Amount]</span></p>
        <p><strong>Projected Annual Revenue (Year 1):</strong> UGX <span class="fillable">[Amount]</span></p>
        <p><strong>Break-even Point:</strong> <span class="fillable">[Timeline]</span></p>
    </div>
    
    <div class="checklist">
        <h3>📋 Registration Checklist for Uganda:</h3>
        <ul>
            <li>☐ URSB Company Registration</li>
            <li>☐ URA Tax Registration (TIN)</li>
            <li>☐ Business License from Local Authority</li>
            <li>☐ VAT Registration (if applicable)</li>
            <li>☐ NSSF Registration</li>
            <li>☐ Workers' Compensation</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
        Generated by OneStopCentre Uganda | ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`
    
    const blob = new Blob([businessPlanHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Uganda_Business_Plan_Template.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  
  const generateTaxGuide = () => {
    const taxGuideHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uganda Tax Guide 2024/2025</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .tax-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .tax-table th, .tax-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .tax-table th { background: #f8f9fa; font-weight: bold; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🇺🇬 Uganda Tax Guide 2024/2025</h1>
        <p>Official URA Tax Rates and Compliance Guide</p>
    </div>
    
    <h2>PAYE Tax Rates (Monthly)</h2>
    <table class="tax-table">
        <tr><th>Income Range (UGX)</th><th>Tax Rate</th><th>Cumulative Tax</th></tr>
        <tr><td>0 - 235,000</td><td>0%</td><td>0</td></tr>
        <tr><td>235,001 - 335,000</td><td>10%</td><td>Up to 10,000</td></tr>
        <tr><td>335,001 - 410,000</td><td>20%</td><td>Up to 25,000</td></tr>
        <tr><td>Above 410,000</td><td>30%</td><td>25,000 + 30% of excess</td></tr>
    </table>
    
    <h2>Corporate Tax</h2>
    <div class="highlight">
        <p><strong>Standard Rate:</strong> 30% of chargeable income</p>
        <p><strong>Small Business Rate:</strong> 1% of gross turnover (turnover < UGX 150M)</p>
    </div>
    
    <h2>ATMS Investment Incentives</h2>
    <table class="tax-table">
        <tr><th>Sector</th><th>Tax Credit</th><th>Benefits</th></tr>
        <tr><td>Agriculture</td><td>10%</td><td>Enhanced depreciation, VAT exemptions</td></tr>
        <tr><td>Tourism</td><td>15%</td><td>Tax holidays, import duty exemptions</td></tr>
        <tr><td>Manufacturing</td><td>12%</td><td>Capital allowances, export incentives</td></tr>
        <tr><td>ICT</td><td>20%</td><td>Pioneer status, skills development deductions</td></tr>
    </table>
    
    <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
        Generated by OneStopCentre Uganda | ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`
    
    const blob = new Blob([taxGuideHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Uganda_Tax_Guide_2024-2025.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const documents = [
    // Business Registration Resources - Working Links
    {
      title: 'Business Plan Template',
      description: 'Professional business plan template customized for Uganda',
      generate: generateBusinessPlan,
      filename: 'Uganda_Business_Plan_Template.html',
      format: 'HTML',
      size: 'Generated',
      icon: '📈',
      category: 'Investment',
      new: true
    },
    {
      title: 'Tax Guide 2024/2025',
      description: 'Complete URA tax rates and compliance guide',
      generate: generateTaxGuide,
      filename: 'Uganda_Tax_Guide_2024-2025.html',
      format: 'HTML',
      size: 'Generated',
      icon: '📊',
      category: 'Tax',
      new: true
    },
    {
      title: 'URSB Company Registration Forms',
      description: 'Official URSB website for all company registration forms and applications',
      url: 'https://ursb.go.ug/services/business-registration/',
      redirect: true,
      authority: 'URSB',
      format: 'Web',
      size: 'Online',
      icon: '🏢',
      category: 'Legal'
    },
    {
      title: 'URA Tax Forms Portal',
      description: 'Official URA portal for TIN, VAT, and PAYE registration forms',
      url: 'https://ura.go.ug/en/',
      redirect: true,
      authority: 'URA',
      format: 'Web',
      size: 'Online',
      icon: '📄',
      category: 'Tax'
    },
    {
      title: 'Partnership & NGO Registration Info',
      description: 'Official URSB guidance for partnerships and NGO registration procedures',
      url: 'https://ursb.go.ug/services/',
      redirect: true,
      authority: 'URSB',
      format: 'Web',
      size: 'Online',
      icon: '🤝',
      category: 'Legal'
    },
    {
      title: 'NGO Bureau Registration',
      description: 'Official NGO Bureau website for NGO registration requirements and forms',
      url: 'https://www.mia.go.ug',
      redirect: true,
      authority: 'Ministry of Internal Affairs',
      format: 'Web',
      size: 'Online',
      icon: '🌍',
      category: 'Legal'
    },

    // Official Government Portals - Tax & Revenue
    {
      title: 'UIA Investment Registration',
      description: 'Uganda Investment Authority portal for investment licenses and applications',
      url: 'https://www.ugandainvest.go.ug',
      redirect: true,
      authority: 'UIA',
      format: 'Web',
      size: 'Online',
      icon: '💰',
      category: 'Investment'
    },
    {
      title: 'NSSF Registration Portal',
      description: 'National Social Security Fund registration for employers and employees',
      url: 'https://www.nssfug.org',
      redirect: true,
      authority: 'NSSF',
      format: 'Web',
      size: 'Online',
      icon: '🛡️',
      category: 'Legal'
    },
    {
      title: 'Ministry of Trade Resources',
      description: 'Official trade licensing and business development resources',
      url: 'https://www.mtic.go.ug',
      redirect: true,
      authority: 'MTIC',
      format: 'Web',
      size: 'Online',
      icon: '💼',
      category: 'Legal'
    },
    {
      title: 'Complete Business Registration Checklist',
      description: 'Interactive checklist covering all business registration requirements',
      url: '/document-checklist',
      format: 'Tool',
      size: 'Interactive',
      icon: '✅',
      category: 'Legal',
      new: true
    },
    {
      title: 'Investment ROI Calculator',
      description: 'Calculate returns on investment with ATMS tax benefits and sector analysis',
      url: '/roi-calculator',
      format: 'Tool',
      size: 'Interactive',
      icon: '📊',
      category: 'Investment',
      new: true
    },
    {
      title: 'URA-Compliant Invoice Generator', 
      description: 'Generate professional invoices with automatic tax calculations',
      url: '/invoice',
      format: 'Tool',
      size: 'Interactive',
      icon: '📄',
      category: 'Tax',
      new: true
    },
    {
      title: 'Tax Calculator with ATMS Benefits',
      description: 'Calculate PAYE, Corporate Tax, and Investment Incentives accurately',
      url: '/calculator',
      format: 'Tool',
      size: 'Interactive',
      icon: '🇺🇬'
    },
    {
      title: 'Work Permit Application Form',
      description: 'Application form for foreign worker work permits',
      url: 'https://www.mia.go.ug/sites/default/files/Work%20Permit%20Application%20Form.pdf',
      filename: 'Work_Permit_Application.pdf',
      format: 'PDF',
      size: '1.3 MB',
      icon: '🆔'
    },
    {
      title: 'Import/Export Declaration Forms',
      description: 'Customs declaration forms for import and export activities',
      url: 'https://www.ura.go.ug/Resources/webuploads/INLB/Import-Export-Declaration-Forms.pdf',
      filename: 'URA_Import_Export_Forms.pdf',
      format: 'PDF',
      size: '1.4 MB',
      icon: '🌐'
    },

    // Certification & Standards
    {
      title: 'Product Certification Process Guide',
      description: 'UNBS guide on product certification process and requirements',
      url: 'https://unbs.go.ug/wp-content/uploads/2023/Product-Certification-Guide.pdf',
      filename: 'UNBS_Product_Certification_Guide.pdf',
      format: 'PDF',
      size: '1.8 MB',
      icon: '🏆'
    },
    {
      title: 'UNBS Certification Regulations 2021',
      description: 'Uganda National Bureau of Standards certification regulations',
      url: 'https://unbs.go.ug/wp-content/uploads/2021/UNBS-Certification-Regulations-2021.pdf',
      filename: 'UNBS_Certification_Regulations_2021.pdf',
      format: 'PDF',
      size: '2.8 MB',
      icon: '⚖️'
    },
    {
      title: 'Quality Management System Application',
      description: 'Application form for ISO quality management system certification',
      url: 'https://unbs.go.ug/wp-content/uploads/2023/QMS-Application-Form.pdf',
      filename: 'UNBS_QMS_Application.pdf',
      format: 'PDF',
      size: '920 KB',
      icon: '✅'
    },

    // Employment & Social Security
    {
      title: 'NSSF Employer Registration Form',
      description: 'National Social Security Fund employer registration form',
      url: 'https://www.nssfug.org/sites/default/files/Employer-Registration-Form.pdf',
      filename: 'NSSF_Employer_Registration.pdf',
      format: 'PDF',
      size: '640 KB',
      icon: '🏛️'
    },

    // Environmental & Mining
    {
      title: 'Environmental Impact Assessment Form',
      description: 'NEMA environmental impact assessment application form',
      url: 'https://www.nema.go.ug/sites/default/files/EIA-Application-Form.pdf',
      filename: 'NEMA_EIA_Application.pdf',
      format: 'PDF',
      size: '1.5 MB',
      icon: '🌱'
    },
    {
      title: 'Mining License Application',
      description: 'Application form for mineral exploration and mining licenses',
      url: 'https://www.dgsm.go.ug/sites/default/files/Mining-License-Application.pdf',
      filename: 'Mining_License_Application.pdf',
      format: 'PDF',
      size: '1.8 MB',
      icon: '⛏️'
    },

    // Service Information & Guidelines
    {
      title: 'OneStopCentre Service Charter',
      description: 'OSC service standards, commitments and client rights',
      url: 'https://onestopcentre.go.ug/wp-content/uploads/2025/OSC-Service-Charter-2025.pdf',
      filename: 'OSC_Service_Charter_2025.pdf',
      format: 'PDF',
      size: '1.2 MB',
      icon: '📋'
    },
    {
      title: 'Business Registration Checklist',
      description: 'Complete checklist for business registration in Uganda',
      url: 'https://www.finance.go.ug/sites/default/files/Business-Registration-Checklist.pdf',
      filename: 'Business_Registration_Checklist.pdf',
      format: 'PDF',
      size: '850 KB',
      icon: '✅'
    },
    {
      title: 'Investment Incentives Overview',
      description: 'Overview of investment incentives and tax benefits in Uganda',
      url: 'https://www.ugandainvest.go.ug/wp-content/uploads/2023/Investment-Incentives-Overview.pdf',
      filename: 'Investment_Incentives_Overview.pdf',
      format: 'PDF',
      size: '1.6 MB',
      icon: '🎯'
    }
  ]

  const categories = [
    {
      name: 'Business Registration',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('company') || 
        doc.title.toLowerCase().includes('business') || 
        doc.title.toLowerCase().includes('partnership') ||
        doc.title.toLowerCase().includes('ngo')
      ),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Tax & Revenue',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('tax') || 
        doc.title.toLowerCase().includes('tin') ||
        doc.title.toLowerCase().includes('vat') ||
        doc.title.toLowerCase().includes('paye')
      ),
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Investment & Licensing',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('invest') || 
        doc.title.toLowerCase().includes('permit') ||
        doc.title.toLowerCase().includes('import') ||
        doc.title.toLowerCase().includes('export')
      ),
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Certification & Standards',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('certification') || 
        doc.title.toLowerCase().includes('unbs') ||
        doc.title.toLowerCase().includes('quality')
      ),
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Employment & Environment',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('nssf') || 
        doc.title.toLowerCase().includes('environment') ||
        doc.title.toLowerCase().includes('mining')
      ),
      color: 'from-teal-500 to-green-600'
    },
    {
      name: 'Service Information',
      docs: documents.filter(doc => 
        doc.title.toLowerCase().includes('charter') ||
        doc.title.toLowerCase().includes('onestop') ||
        doc.title.toLowerCase().includes('checklist') ||
        doc.title.toLowerCase().includes('incentives overview')
      ),
      color: 'from-gray-500 to-slate-600'
    }
  ]

  return (
    <PageBackground page="downloads">
      <PageTransition>
        <div className="min-h-screen pt-24">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumb />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/uganda-flag.png" 
                alt="Uganda flag" 
                className="w-8 h-6 object-cover mr-3 rounded shadow-md"
              />
              <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-700 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-400/30">
                📁 Official Government Forms & Documents
              </span>
              <img 
                src="/images/uganda-coat-of-arms.png" 
                alt="Uganda Coat of Arms" 
                className="w-8 h-8 object-contain ml-3 opacity-80"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Downloads & Requirements Center
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Complete collection of government forms, applications, guides, and documentation for business registration, 
              investment, taxation, licensing, and compliance in Uganda. All official documents in one place.
            </p>
          </motion.div>

          <div className="space-y-12">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.name}
                  </h2>
                  <div className={`h-1 w-24 bg-gradient-to-r ${category.color} rounded-full mt-2`}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.docs.map((doc, index) => (
                    <motion.div
                      key={doc.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                            {doc.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {doc.title}
                            </h3>
                            {doc.new && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-4">
                            {doc.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{doc.format}</span>
                              </span>
                              <span>{doc.size}</span>
                            </div>
                            <button
                              onClick={() => handleDownload(doc)}
                              className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need More Information?
              </h3>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our support team can help you access additional resources and documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+256775692335"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Support
                </a>
                <a
                  href="mailto:support@onestopcentre.ug"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Us
                </a>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </PageTransition>
    </PageBackground>
  )
}

export default DownloadsPage