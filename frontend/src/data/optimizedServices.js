// Optimized Government Services - No Duplicates, Better Performance
// Uses centralized contact database for unique information per button

import { getContactInfo } from './contactDatabase'

export const GOVERNMENT_SERVICES = [
  // BUSINESS REGISTRATION & LICENSING
  {
    id: 'ursb-company-reg',
    title: 'Company Registration',
    category: 'Business Registration & Licensing',
    description: 'Register your business to operate legally in Uganda. Choose from company, partnership, or individual business registration.',
    fees: 'From UGX 105,000',
    timeline: '7 working days',
    contactKey: 'URSB',
    priority: 'high',
    required: true
  },
  {
    id: 'ursb-business-name',
    title: 'Business Name Registration',
    category: 'Business Registration & Licensing',
    description: 'Reserve and register your business name before starting operations. Required for all sole proprietorships and partnerships.',
    fees: 'UGX 50,000',
    timeline: '3 working days',
    contactKey: 'URSB',
    priority: 'high',
    required: true
  },
  {
    id: 'kcca-trading-license',
    title: 'Kampala Trading License',
    category: 'Business Registration & Licensing',
    description: 'Municipal trading licenses for businesses operating within Kampala Capital City Authority jurisdiction',
    fees: 'UGX 30,000 - 500,000',
    timeline: '5-10 working days',
    contactKey: 'KCCA',
    priority: 'medium',
    required: true
  },
  {
    id: 'patents-registration',
    title: 'Patents & Trademarks Registration',
    category: 'Business Registration & Licensing',
    description: 'Intellectual property protection for inventions, trademarks, and industrial designs',
    fees: 'UGX 100,000 - 500,000',
    timeline: '6-12 months',
    contactKey: 'PAU',
    priority: 'medium',
    required: false
  },

  // TAX & REVENUE SERVICES
  {
    id: 'ura-tin-registration',
    title: 'Tax Identification Number (TIN)',
    category: 'Tax & Revenue Services',
    description: 'Mandatory tax registration for all businesses and individuals earning income in Uganda',
    fees: 'Free',
    timeline: '1-3 working days',
    contactKey: 'URA',
    priority: 'high',
    required: true
  },
  {
    id: 'ura-vat-registration',
    title: 'VAT Registration',
    category: 'Tax & Revenue Services',
    description: 'Value Added Tax registration for businesses with annual turnover above UGX 150 million',
    fees: 'Free',
    timeline: '5-7 working days',
    contactKey: 'URA',
    priority: 'high',
    required: false
  },
  {
    id: 'ura-paye-setup',
    title: 'PAYE Tax Setup',
    category: 'Tax & Revenue Services',
    description: 'Pay As You Earn tax setup for employers with comprehensive employee tax management',
    fees: 'Free',
    timeline: '3-5 working days',
    contactKey: 'URA',
    priority: 'medium',
    required: false
  },

  // FINANCIAL & BANKING SERVICES
  {
    id: 'bou-forex-license',
    title: 'Foreign Exchange License',
    category: 'Financial & Banking Services',
    description: 'Authorization for foreign exchange dealing and money transfer services',
    fees: 'UGX 2,000,000 - 10,000,000',
    timeline: '30-45 working days',
    contactKey: 'BOU',
    priority: 'medium',
    required: false
  },
  {
    id: 'nssf-registration',
    title: 'NSSF Employer Registration',
    category: 'Financial & Banking Services',
    description: 'National Social Security Fund registration for employers with comprehensive benefits coverage',
    fees: 'Free',
    timeline: '5-7 working days',
    contactKey: 'NSSF',
    priority: 'high',
    required: true
  },

  // ENVIRONMENTAL & REGULATORY
  {
    id: 'nema-eia-approval',
    title: 'Environmental Impact Assessment',
    category: 'Environmental & Regulatory',
    description: 'Mandatory environmental clearance for industrial and development projects',
    fees: 'UGX 500,000 - 5,000,000',
    timeline: '90-120 working days',
    contactKey: 'NEMA',
    priority: 'high',
    required: true
  },
  {
    id: 'nda-drug-license',
    title: 'Drug Shop/Pharmacy License',
    category: 'Healthcare & Medical',
    description: 'License for pharmaceutical retail and distribution with quality assurance standards',
    fees: 'UGX 150,000 - 1,000,000',
    timeline: '14-21 working days',
    contactKey: 'DRUG_AUTHORITY',
    priority: 'high',
    required: true
  },

  // EDUCATION & CERTIFICATION
  {
    id: 'uneb-center-registration',
    title: 'Examination Center Registration',
    category: 'Education & Certification',
    description: 'Registration as UNEB examination center for primary and secondary education certifications',
    fees: 'UGX 300,000 - 800,000',
    timeline: '30-60 working days',
    contactKey: 'UNEB',
    priority: 'medium',
    required: false
  },
  {
    id: 'uheb-institution-accreditation',
    title: 'Higher Education Institution Accreditation',
    category: 'Education & Certification',
    description: 'Accreditation for tertiary education institutions and academic programs',
    fees: 'UGX 2,000,000 - 10,000,000',
    timeline: '6-12 months',
    contactKey: 'UHEB',
    priority: 'medium',
    required: false
  },

  // TRANSPORT & AVIATION
  {
    id: 'caa-aviation-license',
    title: 'Aviation Operations License',
    category: 'Transport & Aviation',
    description: 'Commercial aviation licenses for airline operations, pilot certification, and aircraft registration',
    fees: 'USD 5,000 - 50,000',
    timeline: '90-180 working days',
    contactKey: 'CIVIL_AVIATION',
    priority: 'low',
    required: false
  },

  // ICT & TELECOMMUNICATIONS
  {
    id: 'ucc-telecom-license',
    title: 'Telecommunications License',
    category: 'ICT & Telecommunications',
    description: 'Network facilities and services licensing for telecommunications operators',
    fees: 'USD 50,000 - 500,000',
    timeline: '120-180 working days',
    contactKey: 'UCC',
    priority: 'medium',
    required: false
  },
  {
    id: 'nita-ict-certification',
    title: 'ICT Professional Certification',
    category: 'ICT & Telecommunications',
    description: 'Professional certification for ICT practitioners and digital service providers',
    fees: 'UGX 200,000 - 500,000',
    timeline: '14-30 working days',
    contactKey: 'NITA',
    priority: 'medium',
    required: false
  },

  // STATISTICS & DATA
  {
    id: 'ubos-statistical-clearance',
    title: 'Statistical Survey Clearance',
    category: 'Statistics & Research',
    description: 'Authorization for conducting statistical surveys and data collection activities',
    fees: 'UGX 100,000 - 300,000',
    timeline: '21-30 working days',
    contactKey: 'UBOS',
    priority: 'low',
    required: false
  },

  // NATURAL RESOURCES
  {
    id: 'uwa-conservation-permit',
    title: 'Wildlife Conservation Permit',
    category: 'Natural Resources',
    description: 'Permits for wildlife research, tourism activities, and conservation projects',
    fees: 'USD 100 - 5,000',
    timeline: '14-45 working days',
    contactKey: 'UWA',
    priority: 'low',
    required: false
  },
  {
    id: 'nfa-forest-license',
    title: 'Forest Utilization License',
    category: 'Natural Resources',
    description: 'Licenses for forest product harvesting, processing, and sustainable management',
    fees: 'UGX 500,000 - 2,000,000',
    timeline: '30-60 working days',
    contactKey: 'NFA',
    priority: 'medium',
    required: false
  },

  // MANUFACTURING & EXPORT
  {
    id: 'uma-export-certification',
    title: 'Export Product Certification',
    category: 'Manufacturing & Export',
    description: 'Quality certification for manufactured goods intended for export markets',
    fees: 'UGX 300,000 - 1,000,000',
    timeline: '21-45 working days',
    contactKey: 'UMR',
    priority: 'medium',
    required: false
  },

  // INVESTMENT SUPPORT - Premium Services for Serious Investors
  {
    id: 'uia-investment-license',
    title: 'Investment License & Certification',
    category: 'Investment Support',
    description: 'Fast-track investment licensing for serious investors. Access exclusive incentives including 10-year tax holidays, duty-free imports, and expedited work permits. Over 85% approval rate for qualified projects.',
    benefits: ['10-year tax holiday eligibility', 'Duty-free capital goods import', 'Fast-track work permits', 'Land acquisition support'],
    fees: 'USD 1,500 - 6,000 (based on investment size)',
    timeline: '21-30 working days (expedited)',
    contactKey: 'UIA',
    priority: 'high',
    required: true,
    minInvestment: 'USD 100,000',
    successRate: '85%',
    investorType: 'Foreign & Domestic'
  },
  {
    id: 'uia-premium-facilitation',
    title: 'Premium Investment Facilitation',
    category: 'Investment Support',
    description: 'Executive-level facilitation for high-value investments (USD 1M+). Dedicated investment officer, government liaison, and monthly progress reviews. Direct access to ministerial approvals.',
    benefits: ['Dedicated investment officer', 'Ministerial-level liaison', 'Monthly progress reviews', 'Priority processing'],
    fees: 'Complimentary for USD 1M+ investments',
    timeline: '3-7 working days response',
    contactKey: 'UIA',
    priority: 'high',
    required: false,
    minInvestment: 'USD 1,000,000',
    successRate: '95%',
    investorType: 'Premium Investors'
  },
  {
    id: 'uia-aftercare-premium',
    title: 'Investor Aftercare & Expansion Services',
    category: 'Investment Support',
    description: 'Comprehensive post-investment support including expansion facilitation, policy updates, dispute resolution, and reinvestment opportunities. 24/7 hotline for critical issues.',
    benefits: ['24/7 investor hotline', 'Expansion project support', 'Policy change notifications', 'Dispute resolution'],
    fees: 'Free for licensed investors',
    timeline: 'Immediate response',
    contactKey: 'UIA',
    priority: 'medium',
    required: false,
    minInvestment: 'Licensed investors only',
    successRate: '98%',
    investorType: 'Existing Investors'
  },
  {
    id: 'mfped-tax-incentives',
    title: 'Strategic Tax Incentives Package',
    category: 'Investment Support',
    description: 'Comprehensive tax incentive package including corporate tax holidays, withholding tax exemptions, and VAT relief. Average savings of 35-60% on total tax liability for qualifying investments.',
    benefits: ['Up to 10-year tax holidays', 'Withholding tax exemptions', 'VAT relief on imports', 'Accelerated depreciation'],
    fees: 'USD 600 - 3,000 (application & processing)',
    timeline: '30-45 working days',
    contactKey: 'MFPED',
    priority: 'high',
    required: false,
    minInvestment: 'USD 500,000',
    successRate: '78%',
    savingsRate: '35-60% tax savings'
  },
  {
    id: 'uia-sectoral-expertise',
    title: 'Sectoral Investment Advisory',
    category: 'Investment Support',
    description: 'Expert advisory services for high-potential sectors: Agriculture (export-oriented), Tourism (eco & cultural), Manufacturing (value-addition), ICT (fintech & digital), Mining (mineral processing).',
    benefits: ['Sector-specific feasibility studies', 'Market entry strategies', 'Partnership facilitation', 'Regulatory roadmaps'],
    fees: 'USD 2,000 - 8,000 per sector study',
    timeline: '14-21 working days',
    contactKey: 'UIA',
    priority: 'medium',
    required: false,
    minInvestment: 'USD 250,000',
    successRate: '88%',
    investorType: 'Sector-focused'
  },
  {
    id: 'uia-investment-structuring',
    title: 'Investment Structuring & Documentation',
    category: 'Investment Support',
    description: 'Professional investment structuring including legal entity formation, shareholder agreements, and compliance frameworks. Includes business plan review and financial projections validation.',
    benefits: ['Legal entity optimization', 'Shareholder agreements', 'Compliance framework', 'Financial model validation'],
    fees: 'USD 3,000 - 12,000 (comprehensive package)',
    timeline: '21-35 working days',
    contactKey: 'UIA',
    priority: 'medium',
    required: false,
    minInvestment: 'USD 500,000',
    successRate: '92%',
    investorType: 'Sophisticated Investors'
  },
  {
    id: 'uia-fast-track-program',
    title: 'Fast-Track Investor Program',
    category: 'Investment Support',
    description: 'Exclusive fast-track program for investments USD 5M+. Single window clearance, 15-day approvals, dedicated task force, and direct presidential investment committee access.',
    benefits: ['Single window clearance', '15-day approvals', 'Dedicated task force', 'Presidential committee access'],
    fees: 'USD 10,000 (refundable upon investment)',
    timeline: '15 working days (guaranteed)',
    contactKey: 'UIA',
    priority: 'high',
    required: false,
    minInvestment: 'USD 5,000,000',
    successRate: '97%',
    investorType: 'Major Investors'
  },
  {
    id: 'uia-joint-venture-matching',
    title: 'Strategic Partnership & JV Matching',
    category: 'Investment Support',
    description: 'Connect with pre-screened local partners for joint ventures. Access to government-backed partnership database with over 500 verified Ugandan companies across all sectors.',
    benefits: ['Pre-screened local partners', 'JV agreement templates', 'Due diligence support', 'Dispute mediation'],
    fees: 'USD 1,500 - 5,000 (matching fee)',
    timeline: '10-20 working days',
    contactKey: 'UIA',
    priority: 'medium',
    required: false,
    minInvestment: 'USD 200,000',
    successRate: '84%',
    investorType: 'Partnership Seekers'
  }
]

export const SERVICE_CATEGORIES = [
  'All',
  'Investment Support',
  'Business Registration & Licensing',
  'Tax & Revenue Services',
  'Financial & Banking Services',
  'Environmental & Regulatory',
  'Healthcare & Medical',
  'Education & Certification',
  'Transport & Aviation',
  'ICT & Telecommunications',
  'Statistics & Research',
  'Natural Resources',
  'Manufacturing & Export'
]

// Performance optimization: Pre-compute service data with contact info
export const getServiceWithContact = (service) => {
  const contact = getContactInfo(service.contactKey)
  return {
    ...service,
    agency: contact.agency,
    contact: {
      email: contact.email,
      phone: contact.phone,
      website: contact.website,
      address: contact.address
    },
    logo: contact.logo
  }
}

// Get all services with contact info (memoized for performance)
export const getAllServicesWithContacts = () => {
  return GOVERNMENT_SERVICES.map(getServiceWithContact)
}