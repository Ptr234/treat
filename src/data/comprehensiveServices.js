// Comprehensive Government Services Data for Uganda
// Updated: July 2025 - All service categories with current fees, requirements, and contact information

export const COMPREHENSIVE_SERVICES = [
  // BUSINESS REGISTRATION & LICENSING
  {
    id: 'ursb-company-reg',
    title: 'Company Registration',
    category: 'Business Registration & Licensing',
    agency: 'Uganda Registration Services Bureau (URSB)',
    description: 'Incorporation of private limited companies, partnerships, and sole proprietorships',
    requirements: ['Memorandum & Articles of Association', 'Form A1 completed', 'Certificate of name reservation', 'Directors/shareholders details'],
    fees: 'From UGX 105,000',
    timeline: '7 working days',
    contact: {
      email: 'ursb@ursb.go.ug',
      phone: '+256 414 233219',
      website: 'https://ursb.go.ug',
      address: 'Plot 1, Baskerville Avenue, Kololo, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/ursb-logo.png'
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
      phone: '+256 414 233219',
      website: 'https://ursb.go.ug'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/ursb-logo.png'
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
    logo: 'https://www.kcca.go.ug/uDocs/KCCA%20LOGO.png'
  },

  // TAX & REVENUE SERVICES
  {
    id: 'ura-tin-registration',
    title: 'Tax Identification Number (TIN)',
    category: 'Tax & Revenue Services',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'Mandatory tax registration for all businesses and individuals earning income',
    requirements: ['National ID/Passport', 'Certificate of incorporation (for companies)', 'Bank account details'],
    fees: 'Free',
    timeline: '1-3 working days',
    contact: {
      email: 'service@ura.go.ug',
      phone: '+256 417 442 097',
      website: 'https://ura.go.ug',
      address: 'Plot M193/194, Nakawa Industrial Area, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/ura-logo.png'
  },
  {
    id: 'ura-vat-registration',
    title: 'VAT Registration',
    category: 'Tax & Revenue Services',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'Value Added Tax registration for businesses with annual turnover above UGX 150 million',
    requirements: ['Valid TIN', 'Business registration certificate', 'Bank statements', 'Premises lease agreement'],
    fees: 'Free',
    timeline: '5-7 working days',
    contact: {
      email: 'service@ura.go.ug',
      phone: '+256 417 442 097',
      website: 'https://ura.go.ug'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/ura-logo.png'
  },
  {
    id: 'ura-paye-registration',
    title: 'PAYE Registration',
    category: 'Tax & Revenue Services',
    agency: 'Uganda Revenue Authority (URA)',
    description: 'Pay As You Earn tax registration for employers',
    requirements: ['Valid TIN', 'List of employees', 'Payroll records'],
    fees: 'Free',
    timeline: '3-5 working days',
    contact: {
      email: 'service@ura.go.ug',
      phone: '+256 417 442 097',
      website: 'https://ura.go.ug'
    },
    priority: 'medium',
    required: true,
    logo: '/images/logos/ura-logo.png'
  },

  // IMMIGRATION & CITIZENSHIP SERVICES
  {
    id: 'immigration-work-permit',
    title: 'Work Permit',
    category: 'Immigration & Citizenship Services',
    agency: 'Ministry of Internal Affairs - Immigration Department',
    description: 'Work permits for foreign nationals seeking employment in Uganda',
    requirements: ['Valid passport', 'Academic certificates', 'Medical certificate', 'Employment contract', 'Police clearance'],
    fees: 'USD 300 (Class A), USD 200 (Class B), USD 100 (Class C)',
    timeline: '21 working days',
    contact: {
      email: 'info@mia.go.ug',
      phone: '+256 414 341 121',
      website: 'https://www.mia.go.ug',
      address: 'Plot 2, Apollo Kaggwa Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.mia.go.ug/images/logo.png'
  },
  {
    id: 'immigration-business-visa',
    title: 'Business Visa',
    category: 'Immigration & Citizenship Services',
    agency: 'Ministry of Internal Affairs - Immigration Department',
    description: 'Short-term visas for business activities and investment visits',
    requirements: ['Valid passport', 'Invitation letter', 'Bank statements', 'Return ticket'],
    fees: 'USD 50 (single entry), USD 100 (multiple entry)',
    timeline: '72 hours (e-visa)',
    contact: {
      email: 'info@mia.go.ug',
      phone: '+256 414 341 121',
      website: 'https://www.mia.go.ug'
    },
    priority: 'medium',
    required: false,
    logo: 'https://www.mia.go.ug/images/logo.png'
  },

  // LAND & PROPERTY SERVICES
  {
    id: 'lands-title-search',
    title: 'Land Title Search',
    category: 'Land & Property Services',
    agency: 'Ministry of Lands, Housing and Urban Development',
    description: 'Verification of land ownership and encumbrances',
    requirements: ['Title deed number or plot reference', 'Search application form', 'Identification documents'],
    fees: 'UGX 20,000',
    timeline: '3-5 working days',
    contact: {
      email: 'info@molhud.go.ug',
      phone: '+256 414 341 278',
      website: 'https://www.molhud.go.ug',
      address: 'Plot 2, Hannington Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.molhud.go.ug/images/logo.png'
  },
  {
    id: 'lands-transfer',
    title: 'Land Transfer/Sale Agreement',
    category: 'Land & Property Services',
    agency: 'Ministry of Lands, Housing and Urban Development',
    description: 'Registration of land transfers and change of ownership',
    requirements: ['Original title deed', 'Transfer forms', 'Valuation report', 'Tax clearance'],
    fees: '4% of property value + UGX 50,000 registration fee',
    timeline: '14-21 working days',
    contact: {
      email: 'info@molhud.go.ug',
      phone: '+256 414 341 278',
      website: 'https://www.molhud.go.ug'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.molhud.go.ug/images/logo.png'
  },

  // EDUCATION & CERTIFICATION SERVICES
  {
    id: 'uneb-results-verification',
    title: 'Academic Results Verification',
    category: 'Education & Certification Services',
    agency: 'Uganda National Examinations Board (UNEB)',
    description: 'Verification of academic certificates and results authenticity',
    requirements: ['Original certificates', 'Application form', 'Identification documents'],
    fees: 'UGX 30,000 per certificate',
    timeline: '5-7 working days',
    contact: {
      email: 'info@uneb.ac.ug',
      phone: '+256 414 344 435',
      website: 'https://www.uneb.ac.ug',
      address: 'Plot 35-37, Ntinda-Nakawa Road, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: 'https://www.uneb.ac.ug/images/logo.png'
  },

  // HEALTH & MEDICAL SERVICES
  {
    id: 'nda-drug-registration',
    title: 'Drug Registration',
    category: 'Health & Medical Services',
    agency: 'National Drug Authority (NDA)',
    description: 'Registration and licensing of pharmaceutical products',
    requirements: ['Product dossier', 'Manufacturing license', 'Good Manufacturing Practice certificate', 'Product samples'],
    fees: 'UGX 500,000 - 2,000,000 (varies by product category)',
    timeline: '90-120 working days',
    contact: {
      email: 'info@nda.or.ug',
      phone: '+256 414 340 193',
      website: 'https://www.nda.or.ug',
      address: 'Plot 46-48, Lumumba Avenue, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.nda.or.ug/images/logo.png'
  },
  {
    id: 'ahpc-practitioner-license',
    title: 'Health Practitioner License',
    category: 'Health & Medical Services',
    agency: 'Allied Health Professions Council (AHPC)',
    description: 'Professional licensing for allied health practitioners',
    requirements: ['Academic transcripts', 'Professional certificates', 'Internship completion certificate', 'Good conduct certificate'],
    fees: 'UGX 150,000 - 300,000',
    timeline: '21-30 working days',
    contact: {
      email: 'info@ahpc.co.ug',
      phone: '+256 414 540 842',
      website: 'https://www.ahpc.co.ug'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.ahpc.co.ug/images/logo.png'
  },

  // INFRASTRUCTURE & UTILITIES SERVICES
  {
    id: 'nwsc-water-connection',
    title: 'Water Connection Services',
    category: 'Infrastructure & Utilities Services',
    agency: 'National Water and Sewerage Corporation (NWSC)',
    description: 'New water connections and supply services',
    requirements: ['Land title/tenancy agreement', 'Approved building plan', 'Application form', 'Site inspection'],
    fees: 'UGX 350,000 - 850,000 (domestic), UGX 1,200,000+ (commercial)',
    timeline: '14-21 working days',
    contact: {
      email: 'customercare@nwsc.co.ug',
      phone: '+256 414 315 000',
      website: 'https://www.nwsc.co.ug',
      address: 'Plot 3, Jinja Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.nwsc.co.ug/images/logo.png'
  },
  {
    id: 'uedcl-electricity-connection',
    title: 'Electricity Connection',
    category: 'Infrastructure & Utilities Services',
    agency: 'Uganda Electricity Distribution Company Limited (UEDCL)',
    description: 'New electricity connections and supply services',
    requirements: ['Land title/tenancy agreement', 'Wiring completion certificate', 'Load application form'],
    fees: 'UGX 118,000 (single phase), UGX 354,000 (three phase)',
    timeline: '7-14 working days',
    contact: {
      email: 'customercare@uedcl.co.ug',
      phone: '+256 800 285 285',
      website: 'https://www.uedcl.co.ug'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.uedcl.co.ug/images/logo.png'
  },

  // SOCIAL SECURITY & WELFARE SERVICES
  {
    id: 'nssf-registration',
    title: 'NSSF Employer Registration',
    category: 'Social Security & Welfare Services',
    agency: 'National Social Security Fund (NSSF)',
    description: 'Mandatory social security registration for employers',
    requirements: ['Certificate of incorporation', 'Tax identification number', 'Employee list', 'Bank account details'],
    fees: 'Free registration, 15% monthly contributions (5% employee + 10% employer)',
    timeline: '3-5 working days',
    contact: {
      email: 'customerservice@nssfug.org',
      phone: '+256 313 331 755',
      website: 'https://www.nssfug.org',
      address: 'Plot 1 Pilkington Road, Workers House, 14th Floor, Kampala'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/nssf-logo.png'
  },

  // COMMUNICATIONS & BROADCASTING SERVICES
  {
    id: 'ucc-telecom-license',
    title: 'Telecommunications License',
    category: 'Communications & Broadcasting Services',
    agency: 'Uganda Communications Commission (UCC)',
    description: 'Licensing for telecommunications service providers',
    requirements: ['Technical specifications', 'Financial projections', 'Coverage plans', 'Frequency coordination'],
    fees: 'USD 10,000 - 100,000 (varies by license type)',
    timeline: '60-90 working days',
    contact: {
      email: 'ucc@ucc.co.ug',
      phone: '+256 414 339 000',
      website: 'https://www.ucc.co.ug',
      address: 'Plot 42-44, Spring Road, Bugolobi, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/ucc-logo.png'
  },
  {
    id: 'ucc-internet-license',
    title: 'Internet Service Provider License',
    category: 'Communications & Broadcasting Services',
    agency: 'Uganda Communications Commission (UCC)',
    description: 'Licensing for internet service provision',
    requirements: ['Technical capacity assessment', 'Network infrastructure plan', 'Financial statements'],
    fees: 'USD 2,500 (application) + USD 5,000 (annual)',
    timeline: '45-60 working days',
    contact: {
      email: 'ucc@ucc.co.ug',
      phone: '+256 414 339 000',
      website: 'https://www.ucc.co.ug'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/ucc-logo.png'
  },

  // FINANCIAL & BANKING SERVICES
  {
    id: 'bou-banking-license',
    title: 'Banking License',
    category: 'Financial & Banking Services',
    agency: 'Bank of Uganda (BOU)',
    description: 'Commercial banking license for financial institutions',
    requirements: ['Minimum capital UGX 150 billion', 'Fit and proper directors', 'Business plan', 'Risk management framework'],
    fees: 'UGX 50 million (application fee)',
    timeline: '180-240 working days',
    contact: {
      email: 'info@bou.or.ug',
      phone: '+256 414 258 441',
      website: 'https://www.bou.or.ug',
      address: 'Plot 37/45 Kampala Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.bou.or.ug/images/logo.png'
  },
  {
    id: 'cma-securities-license',
    title: 'Securities Dealing License',
    category: 'Financial & Banking Services',
    agency: 'Capital Markets Authority (CMA)',
    description: 'Authorization to deal in securities and investment advisory services',
    requirements: ['Minimum capital UGX 500 million', 'Qualified personnel', 'Compliance manual', 'Professional indemnity insurance'],
    fees: 'UGX 5 million (application) + annual fees',
    timeline: '45-60 working days',
    contact: {
      email: 'info@cmauganda.co.ug',
      phone: '+256 414 342 788',
      website: 'https://cmauganda.co.ug',
      address: 'Plot 1, Baskerville Avenue, 8th Floor, Kampala'
    },
    priority: 'medium',
    required: false,
    logo: '/images/logos/cma-logo.png'
  },

  // TRADE & COMMERCE SERVICES
  {
    id: 'uia-investment-license',
    title: 'Investment License',
    category: 'Trade & Commerce Services',
    agency: 'Uganda Investment Authority (UIA)',
    description: 'Investment facilitation and licensing services',
    requirements: ['Minimum investment USD 250,000 (foreign) / USD 50,000 (domestic)', 'Project proposal', 'Financial projections'],
    fees: 'Free',
    timeline: '2-5 working days',
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 301 000',
      website: 'https://www.ugandainvest.go.ug',
      address: 'Plot 1, Baskerville Avenue, Kololo, Floors 1, 6 & 7, Kampala'
    },
    priority: 'high',
    required: false,
    logo: '/images/logos/uia-logo.png'
  },

  // TRANSPORT & AVIATION SERVICES
  {
    id: 'mot-driving-license',
    title: 'Driving License',
    category: 'Transport & Aviation Services',
    agency: 'Ministry of Works and Transport',
    description: 'Driving permits for various vehicle categories',
    requirements: ['Learner permit', 'Driving test certificate', 'Medical certificate', 'Passport photos'],
    fees: 'UGX 50,000 (Class C), UGX 100,000 (Commercial)',
    timeline: '5-10 working days',
    contact: {
      email: 'info@mowt.go.ug',
      phone: '+256 414 320 580',
      website: 'https://www.mowt.go.ug'
    },
    priority: 'medium',
    required: false,
    logo: 'https://www.mowt.go.ug/images/logo.png'
  },
  {
    id: 'caa-aviation-license',
    title: 'Aviation Licenses',
    category: 'Transport & Aviation Services',
    agency: 'Civil Aviation Authority (CAA)',
    description: 'Aircraft operation and pilot licensing services',
    requirements: ['Flight training completion', 'Medical certificate', 'Aviation English proficiency', 'Flight experience logs'],
    fees: 'USD 200 - 1,000 (varies by license type)',
    timeline: '30-45 working days',
    contact: {
      email: 'info@caa.co.ug',
      phone: '+256 414 351 000',
      website: 'https://www.caa.co.ug'
    },
    priority: 'low',
    required: false,
    logo: 'https://www.caa.co.ug/images/logo.png'
  },

  // ENERGY & PETROLEUM SERVICES
  {
    id: 'pau-exploration-license',
    title: 'Petroleum Exploration License',
    category: 'Energy & Petroleum Services',
    agency: 'Petroleum Authority of Uganda (PAU)',
    description: 'Licensing for oil and gas exploration activities',
    requirements: ['Technical capability assessment', 'Environmental impact assessment', 'Financial guarantees', 'Local content plan'],
    fees: 'USD 100,000 - 500,000 (varies by block size)',
    timeline: '180-365 working days',
    contact: {
      email: 'info@pau.go.ug',
      phone: '+256 414 707 000',
      website: 'https://www.pau.go.ug'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.pau.go.ug/images/logo.png'
  },

  // ENVIRONMENT & NATURAL RESOURCES SERVICES
  {
    id: 'nema-eia-certificate',
    title: 'Environmental Impact Assessment',
    category: 'Environment & Natural Resources Services',
    agency: 'National Environment Management Authority (NEMA)',
    description: 'Environmental clearance for development projects',
    requirements: ['Project proposal', 'Environmental assessment report', 'Public consultation records', 'Mitigation measures'],
    fees: 'UGX 500,000 - 5,000,000 (varies by project scale)',
    timeline: '45-90 working days',
    contact: {
      email: 'info@nema.go.ug',
      phone: '+256 414 251 064',
      website: 'https://www.nema.go.ug',
      address: 'Plot 17/19/21 Jinja Road, Kampala'
    },
    priority: 'high',
    required: false,
    logo: 'https://www.nema.go.ug/images/logo.png'
  },

  // JUSTICE & LEGAL SERVICES
  {
    id: 'judiciary-company-search',
    title: 'Company Name Search',
    category: 'Justice & Legal Services',
    agency: 'Uganda Registration Services Bureau (URSB)',
    description: 'Name availability search before company registration',
    requirements: ['Proposed company names (3 alternatives)', 'Search application form'],
    fees: 'UGX 30,000 per name',
    timeline: '1-2 working days',
    contact: {
      email: 'ursb@ursb.go.ug',
      phone: '+256 414 233219',
      website: 'https://ursb.go.ug'
    },
    priority: 'high',
    required: true,
    logo: '/images/logos/ursb-logo.png'
  }
];

// Service categories for filtering and organization
export const SERVICE_CATEGORIES = [
  'Business Registration & Licensing',
  'Tax & Revenue Services',
  'Immigration & Citizenship Services',
  'Land & Property Services',
  'Education & Certification Services',
  'Health & Medical Services',
  'Infrastructure & Utilities Services',
  'Social Security & Welfare Services',
  'Communications & Broadcasting Services',
  'Financial & Banking Services',
  'Trade & Commerce Services',
  'Transport & Aviation Services',
  'Energy & Petroleum Services',
  'Environment & Natural Resources Services',
  'Justice & Legal Services'
];

export default COMPREHENSIVE_SERVICES;