export interface Contact {
  email: string;
  phone: string;
  website: string;
  address?: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  agency: string;
  description: string;
  requirements: string[];
  fees: string;
  timeline: string;
  contact: Contact;
  priority: 'high' | 'medium' | 'low';
  required: boolean;
  logo?: string;
}

export const COMPREHENSIVE_SERVICES: Service[] = [
  // INVESTMENT SERVICES
  {
    id: 'uia-investment-license',
    title: 'Investment License & Registration',
    category: 'Investment Services',
    agency: 'Uganda Investment Authority (UIA)',
    description: 'Comprehensive investment licensing for foreign and domestic investors. Fast-track service for qualifying investments above USD 500,000 with dedicated investor support and incentive packages.',
    requirements: [
      'Completed investment application form',
      'Detailed business plan and feasibility study',
      'Proof of financial capability (bank statements)',
      'Environmental impact assessment (if applicable)',
      'Technical specifications and project details',
      'Passport copies for foreign investors',
      'Certificate of good standing from home country',
      'Investment capital proof (minimum USD 50,000)'
    ],
    fees: 'USD 100 - 1,500 (varies by investment size and sector)',
    timeline: '14-30 working days (fast-track available)',
    contact: {
      email: 'licensing@ugandainvest.go.ug',
      phone: '+256 414 301 000',
      website: 'https://ugandainvest.go.ug',
      address: 'Plot 28, Kampala Road, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/UIA logo.png'
  },
  {
    id: 'uia-investment-incentives',
    title: 'Investment Incentives & Tax Benefits',
    category: 'Investment Services',
    agency: 'Uganda Investment Authority (UIA)',
    description: 'Access comprehensive investment incentives including tax holidays, duty exemptions, and special economic zone benefits. Incentives worth up to 100% tax exemption for qualifying investments.',
    requirements: [
      'Valid investment license from UIA',
      'Investment project above minimum thresholds',
      'Compliance with sector-specific requirements',
      'Employment creation commitments',
      'Technology transfer agreements (if applicable)',
      'Export commitment documentation',
      'Environmental compliance certification'
    ],
    fees: 'No fees (government incentive program)',
    timeline: '7-14 working days after license approval',
    contact: {
      email: 'incentives@ugandainvest.go.ug',
      phone: '+256 414 301 001',
      website: 'https://ugandainvest.go.ug/incentives',
      address: 'Plot 28, Kampala Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/UIA logo.png'
  },
  {
    id: 'free-zones-license',
    title: 'Free Trade Zone & Industrial Park License',
    category: 'Investment Services', 
    agency: 'Uganda Free Zones Authority (UFZA)',
    description: 'Establish operations in Uganda\'s Free Trade Zones and Industrial Parks with enhanced benefits including 100% foreign ownership, duty-free imports, and streamlined procedures.',
    requirements: [
      'Investment license from UIA',
      'Minimum investment of USD 500,000',
      'Detailed project implementation plan',
      'Financial guarantees and bank references',
      'Technical and managerial capability proof',
      'Market analysis and export projections',
      'Environmental and social compliance'
    ],
    fees: 'USD 2,000 - 10,000 (varies by zone and investment)',
    timeline: '21-45 working days',
    contact: {
      email: 'info@ufza.go.ug',
      phone: '+256 414 230 500',
      website: 'https://ufza.go.ug',
      address: 'Plot 2, Lumumba Avenue, Nakasero, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/UFZA-logo.png'
  },

  // BUSINESS REGISTRATION & LICENSING
  {
    id: 'ursb-company-reg',
    title: 'Company Registration & Incorporation',
    category: 'Business Registration & Licensing',
    agency: 'Uganda Registration Services Bureau (URSB)',
    description: 'Fast-track company incorporation for investment ventures. Complete incorporation services for private limited companies, partnerships, and foreign company branches with investor-friendly procedures.',
    requirements: [
      'Memorandum & Articles of Association (notarized)',
      'Form A1 duly completed and signed',
      'Certificate of name reservation (valid for 30 days)',
      'Directors and shareholders details with ID copies',
      'Registered office address proof',
      'Directors consent to act forms',
      'Share subscription agreement',
      'Foreign investor registration (if applicable)'
    ],
    fees: 'UGX 105,000 - 500,000 (expedited service: +50%)',
    timeline: '3-7 working days (same-day service available)',
    contact: {
      email: 'ursb@ursb.go.ug',
      phone: '+256 326 338 000',
      website: 'https://obrs.ursb.go.ug',
      address: 'Plot 1, Baskerville Avenue, Kololo, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/URSB logo.png'
  },
  {
    id: 'ursb-business-name',
    title: 'Business Name Registration',
    category: 'Business Registration & Licensing',
    agency: 'Uganda Registration Services Bureau (URSB)',
    description: 'Registration of business names for sole proprietorships and partnerships',
    requirements: ['Completed Form 1', 'Copy of national ID', 'Business name search certificate'],
    fees: 'UGX 50,000',
    timeline: '3 working days',
    contact: {
      email: 'ursb@ursb.go.ug',
      phone: '+256 326 338 000',
      website: 'https://obrs.ursb.go.ug'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/URSB logo.png'
  },
  {
    id: 'kcca-trading-license',
    title: 'Trading License',
    category: 'Business Registration & Licensing',
    agency: 'Kampala Capital City Authority (KCCA)',
    description: 'Municipal trading licenses for businesses operating within Kampala',
    requirements: ['Certificate of incorporation', 'Tax clearance certificate', 'Premises inspection certificate'],
    fees: 'UGX 30,000 - 500,000 (varies by business type)',
    timeline: '5-10 working days',
    contact: {
      email: 'info@kcca.go.ug',
      phone: '+256 312 900000',
      website: 'https://www.kcca.go.ug'
    },
    priority: 'medium',
    required: true,
    logo: '/images/logos/kcca.png'
  },

  // TAX & INVESTMENT INCENTIVES
  {
    id: 'ura-tin-registration',
    title: 'Tax Identification Number (TIN)',
    category: 'Tax & Investment Incentives',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'Expedited TIN registration for investors with dedicated investor desk service. Essential for accessing investment incentives and tax benefits.',
    requirements: [
      'National ID/Passport (certified copies)',
      'Certificate of incorporation (for companies)',
      'Investment license from UIA',
      'Bank account details and references',
      'Registered business address proof'
    ],
    fees: 'Free (priority processing for investors)',
    timeline: 'Same day service (investor fast-track)',
    contact: {
      email: 'investor.services@ura.go.ug',
      phone: '+256 41 744 0000',
      website: 'https://www.ura.go.ug/investor-services',
      address: 'Plot M193/194, Kinawataka Road, Nakawa Industrial Area'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/URA logo.png'
  },
  {
    id: 'investment-tax-incentives',
    title: 'Investment Tax Incentives & Exemptions',
    category: 'Tax & Investment Incentives',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'Access comprehensive tax incentives including corporate tax holidays, duty exemptions on machinery, and accelerated depreciation for qualifying investments.',
    requirements: [
      'Valid investment license from UIA',
      'Minimum investment thresholds met',
      'Sector-specific qualifications',
      'Employment creation targets',
      'Technology transfer commitments',
      'Export revenue projections',
      'Compliance with incentive conditions'
    ],
    fees: 'Free (tax benefit program)',
    timeline: '14-21 working days after investment approval',
    contact: {
      email: 'incentives@ura.go.ug',
      phone: '+256 417 442 100',
      website: 'https://ura.go.ug/investment-incentives',
      address: 'Plot M193/194, Kinawataka Road, Nakawa Industrial Area'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/URA logo.png'
  },
  {
    id: 'ura-vat-registration',
    title: 'VAT Registration & Export VAT Refunds',
    category: 'Tax & Investment Incentives',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'VAT registration with export-oriented business benefits including zero-rating on exports and expedited VAT refund processing for exporters.',
    requirements: [
      'Valid TIN and investment license',
      'Business registration certificate',
      'Bank statements and financial projections',
      'Export contracts and market agreements',
      'Premises lease agreement',
      'Turnover projections above UGX 150M'
    ],
    fees: 'Free (priority processing for exporters)',
    timeline: '3-7 working days (expedited for investors)',
    contact: {
      email: 'vat.exports@ura.go.ug',
      phone: '+256 417 442 097',
      website: 'https://ura.go.ug/vat-exports',
      address: 'Plot M193/194, Kinawataka Road, Nakawa Industrial Area'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/URA logo.png'
  },

  {
    id: 'sector-specific-licenses',
    title: 'Sector-Specific Investment Licenses',
    category: 'Investment Services',
    agency: 'Various Regulatory Bodies',
    description: 'Specialized licenses for priority investment sectors including mining, oil & gas, telecommunications, banking, and manufacturing with sector-specific incentives.',
    requirements: [
      'General investment license from UIA',
      'Sector-specific technical qualifications',
      'Minimum capital requirements per sector',
      'Environmental and social impact assessments',
      'Technology transfer agreements',
      'Local partnership requirements (if applicable)',
      'Specialized insurance coverage'
    ],
    fees: 'USD 1,000 - 50,000 (varies by sector)',
    timeline: '30-90 working days (sector dependent)',
    contact: {
      email: 'sector@ugandainvest.go.ug',
      phone: '+256 414 301 002',
      website: 'https://ugandainvest.go.ug/sectors',
      address: 'Plot 28, Kampala Road, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/UIA logo.png'
  },

  // BANKING & FINANCIAL SERVICES
  {
    id: 'bou-bank-license',
    title: 'Banking License',
    category: 'Banking & Financial Services',
    agency: 'Bank of Uganda (BOU)',
    description: 'Licenses for commercial banks, credit institutions, and financial service providers',
    requirements: ['Application form', 'Business plan', 'Capital adequacy proof', 'Fit and proper persons certificates'],
    fees: 'USD 5,000 - 50,000',
    timeline: '90-180 days',
    contact: {
      email: 'info@bou.or.ug',
      phone: '+256 414 258441',
      website: 'https://www.bou.or.ug',
      address: 'Plot 37-45, Kampala Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/BOU.jpeg'
  },

  // ENVIRONMENT & NATURAL RESOURCES
  {
    id: 'nema-eia-approval',
    title: 'Environmental Impact Assessment',
    category: 'Environment & Natural Resources',
    agency: 'National Environment Management Authority (NEMA)',
    description: 'Environmental clearance for projects with potential environmental impact',
    requirements: ['Project description', 'EIA study report', 'Public consultation report', 'Mitigation measures plan'],
    fees: 'UGX 500,000 - 5,000,000',
    timeline: '60-90 days',
    contact: {
      email: 'info@nema.go.ug',
      phone: '+256 414 251064',
      website: 'https://www.nema.go.ug',
      address: 'NEMA House, Plot 17/19/21, Jinja Road, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/NEMA.png'
  },

  // COMMUNICATIONS & TECHNOLOGY
  {
    id: 'ucc-operator-license',
    title: 'Telecommunications Operator License',
    category: 'Communications & Technology',
    agency: 'Uganda Communications Commission (UCC)',
    description: 'Comprehensive licenses for telecommunications and broadcasting service providers',
    requirements: ['Technical capability certificate', 'Financial capacity proof', 'Business plan', 'Network rollout plan'],
    fees: 'USD 10,000 - 100,000',
    timeline: '45-60 days',
    contact: {
      email: 'info@ucc.co.ug',
      phone: '+256 414 339000',
      website: 'https://www.ucc.co.ug',
      address: 'Plot 42-44, Spring Road, Bugolobi, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/UCC logo.png'
  },

  // LABOR & EMPLOYMENT
  {
    id: 'work-permit',
    title: 'Work Permit Application',
    category: 'Labor & Employment',
    agency: 'Ministry of Internal Affairs',
    description: 'Work permits for foreign nationals seeking employment in Uganda',
    requirements: [
      'Valid passport with 6+ months validity',
      'Employment offer letter',
      'Academic and professional certificates',
      'Medical certificate from approved facility',
      'Police clearance certificate',
      'HIV test certificate',
      'Passport photos (6 copies)'
    ],
    fees: 'USD 200 - 1,500 (depending on category)',
    timeline: '21-30 working days',
    contact: {
      email: 'info@mia.go.ug',
      phone: '+256 414 251977',
      website: 'https://www.mia.go.ug'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/mia-logo.png'
  },

  // AGRICULTURE & FOOD
  {
    id: 'unbs-certification',
    title: 'Product Certification (UNBS)',
    category: 'Agriculture & Food',
    agency: 'Uganda National Bureau of Standards (UNBS)',
    description: 'Quality certification for products meeting Uganda National Standards',
    requirements: [
      'Application form (duly filled)',
      'Product samples for testing',
      'Manufacturing process description',
      'Quality management system documentation',
      'Factory inspection clearance',
      'Product specifications and labels'
    ],
    fees: 'UGX 300,000 - 2,000,000 (product dependent)',
    timeline: '30-45 working days',
    contact: {
      email: 'unbs@unbs.go.ug',
      phone: '+256 414 333333',
      website: 'https://www.unbs.go.ug',
      address: 'Plot 2-12, Bypass Link, Industrial Area, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/unbs-logo.png'
  },

  // HEALTHCARE
  {
    id: 'nda-drug-license',
    title: 'Drug Shop/Pharmacy License',
    category: 'Healthcare',
    agency: 'National Drug Authority (NDA)',
    description: 'Licensing for drug shops, pharmacies, and pharmaceutical establishments',
    requirements: [
      'Qualified pharmacist/drug seller certificate',
      'Premises inspection certificate',
      'Business license from local authority',
      'Tax clearance certificate',
      'Academic certificates (originals for verification)',
      'Premises lease agreement or ownership documents'
    ],
    fees: 'UGX 150,000 - 500,000 (facility type dependent)',
    timeline: '14-21 working days',
    contact: {
      email: 'info@nda.or.ug',
      phone: '+256 414 343001',
      website: 'https://www.nda.or.ug',
      address: 'Plot 46-48, Lumumba Avenue, Nakasero, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/drug authority.png'
  },

  // TRANSPORT & LOGISTICS
  {
    id: 'ucaa-aviation-license',
    title: 'Aviation Operating License',
    category: 'Transport & Logistics',
    agency: 'Uganda Civil Aviation Authority (UCAA)',
    description: 'Licensing for aviation operations, airports, and related services',
    requirements: [
      'Air operator certificate application',
      'Aircraft registration documents',
      'Insurance coverage proof',
      'Pilot licenses and medical certificates',
      'Maintenance organization approvals',
      'Operations manual and procedures'
    ],
    fees: 'USD 5,000 - 50,000 (operation type dependent)',
    timeline: '60-120 working days',
    contact: {
      email: 'info@caa.co.ug',
      phone: '+256 414 354400',
      website: 'https://www.caa.co.ug',
      address: 'Plot 22, Portbell Road, Luzira, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/CIVIL aviation.png'
  },

  // EDUCATION
  {
    id: 'uneb-examination',
    title: 'Examination Registration',
    category: 'Education',
    agency: 'Uganda National Examinations Board (UNEB)',
    description: 'Registration for national examinations (PLE, UCE, UACE)',
    requirements: [
      'Completed registration forms',
      'Birth certificate or statutory declaration',
      'Previous examination certificates',
      'School recommendation letter',
      'Passport size photographs (4 copies)',
      'Registration fees payment proof'
    ],
    fees: 'UGX 25,000 - 85,000 (examination level dependent)',
    timeline: '30 days before examination',
    contact: {
      email: 'info@uneb.ac.ug',
      phone: '+256 414 251234',
      website: 'https://www.uneb.ac.ug',
      address: 'Plot 35-37, Kyambogo University, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/UNEB.jpeg'
  },

  // SOCIAL SECURITY
  {
    id: 'nssf-registration',
    title: 'NSSF Employer/Employee Registration',
    category: 'Social Security',
    agency: 'National Social Security Fund (NSSF)',
    description: 'Mandatory social security registration for employers and employees',
    requirements: [
      'Employer registration certificate',
      'Tax identification number (TIN)',
      'Employee details and contracts',
      'Bank account details',
      'Payroll information',
      'Authorized signatory details'
    ],
    fees: 'Free (contributions: 15% of gross salary)',
    timeline: '3-5 working days',
    contact: {
      email: 'info@nssfug.org',
      phone: '+256 414 230000',
      website: 'https://www.nssfug.org',
      address: 'Workers House, Plot 1, Pilkington Road, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/NSSF logo.png'
  },

  // MINING & MINERALS
  {
    id: 'dgsm-mining-license',
    title: 'Mining License',
    category: 'Mining & Minerals',
    agency: 'Directorate of Geological Survey and Mines (DGSM)',
    description: 'Licenses for mineral exploration, mining, and processing operations',
    requirements: [
      'Technical and financial capability proof',
      'Environmental impact assessment',
      'Mining plan and feasibility study',
      'Land acquisition or lease agreements',
      'Community consultation reports',
      'Safety and health management plans'
    ],
    fees: 'USD 500 - 10,000 (license type and area dependent)',
    timeline: '30-90 working days',
    contact: {
      email: 'info@dgsm.go.ug',
      phone: '+256 414 220000',
      website: 'https://www.dgsm.go.ug',
      address: 'Plot 21-29, Jinja Road, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/umr.png'
  },

  // TOURISM
  {
    id: 'utb-tourism-license',
    title: 'Tourism Business License',
    category: 'Tourism',
    agency: 'Uganda Tourism Board (UTB)',
    description: 'Licensing for tourism operators, hotels, lodges, and tour companies',
    requirements: [
      'Business registration certificate',
      'Tax clearance certificate',
      'Premises inspection certificate',
      'Professional qualifications of key staff',
      'Insurance coverage proof',
      'Tourism facility standards compliance'
    ],
    fees: 'UGX 100,000 - 1,000,000 (facility category dependent)',
    timeline: '14-21 working days',
    contact: {
      email: 'info@visituganda.com',
      phone: '+256 414 342196',
      website: 'https://www.visituganda.com',
      address: 'Plot 42, Lugogo Bypass, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/UTB.png'
  }
];

export const serviceCategories = [
  'All',
  'Investment Services',
  'Tax & Investment Incentives',
  'Business Registration & Licensing',
  'Banking & Financial Services',
  'Environment & Natural Resources',
  'Communications & Technology',
  'Labor & Employment',
  'Healthcare',
  'Education',
  'Transport & Logistics',
  'Agriculture & Food',
  'Social Security',
  'Mining & Minerals',
  'Tourism'
];

export const priorityLevels = ['high', 'medium', 'low'] as const;

export const agencies = [
  'Uganda Registration Services Bureau (URSB)',
  'Uganda Revenue Authority (URA)',
  'Uganda Investment Authority (UIA)',
  'Bank of Uganda (BOU)',
  'National Environment Management Authority (NEMA)',
  'Uganda Communications Commission (UCC)',
  'Kampala Capital City Authority (KCCA)'
];