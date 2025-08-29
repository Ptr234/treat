export interface Contact {
  email: string;
  phone: string;
  website: string;
  agency: string;
}

export interface Investment {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  investment: string;
  returns: string;
  timeline: string;
  risk: string;
  image: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  contact: Contact;
}

export const investments: Investment[] = [
  {
    id: 1,
    title: 'Agriculture & Food Processing Hub',
    description: 'Comprehensive investment opportunity in Uganda\'s booming agricultural sector focusing on value addition, food processing facilities, and agro-industrial parks. Uganda produces over 3.5 million tons of cereals annually with huge potential for processing and export.',
    category: 'Agriculture',
    location: 'Kampala Industrial Area, Wakiso, Mukono, Lira, Mbarara',
    investment: '$50,000 - $5,000,000',
    returns: '18-35% annually (proven track record)',
    timeline: '12-36 months (phased implementation)',
    risk: 'Medium',
    image: '/images/Agriculture-Investment-Opportunities.webp',
    requirements: [
      'Business registration and incorporation',
      'Environmental impact assessment (EIA)',
      'Uganda Investment Authority (UIA) license',
      'Land acquisition or long-term lease agreements',
      'Technical feasibility and market study',
      'Financial projections and funding plan',
      'UNBS quality certification compliance',
      'Export market certification (for export-oriented projects)'
    ],
    benefits: [
      'Zero corporate tax for first 5 years (UIA incentive)',
      'Duty-free importation of machinery and equipment',
      'Access to East African Community (EAC) market (160M people)',
      'AGOA benefits for US market access',
      'Government support through Operation Wealth Creation',
      'Availability of skilled and cost-effective labor',
      'Year-round growing seasons (bimodal rainfall)',
      'Strong government support for agro-processing'
    ],
    tags: ['Agriculture', 'Food Processing', 'Export', 'Tax Incentives', 'EAC Market', 'AGOA', 'Value Addition'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 2,
    title: 'Tourism Infrastructure Development',
    description: 'Develop world-class eco-lodges, hotels, and tourism facilities in Uganda\'s pristine national parks and UNESCO World Heritage sites. Uganda welcomes over 1.5 million tourists annually with tremendous growth potential.',
    category: 'Tourism',
    location: 'National Parks, Lake Regions, Cultural Sites',
    investment: '$100,000 - $15,000,000',
    returns: '20-40% annually (seasonal variations)',
    timeline: '18-48 months',
    risk: 'Medium-High',
    image: '/images/Tourism.webp',
    requirements: [
      'Tourism business license from UTB',
      'Environmental impact assessment',
      'Local partnership agreements',
      'Site development permits',
      'International hospitality standards compliance',
      'Wildlife conservation compliance'
    ],
    benefits: [
      'Year-round tourist demand growth',
      'Government tourism promotion support',
      'UNESCO World Heritage site access',
      'Diverse tourism attractions (wildlife, culture, adventure)',
      'Regional tourism hub potential',
      'Foreign exchange earnings priority'
    ],
    tags: ['Tourism', 'Hospitality', 'Eco-Tourism', 'Infrastructure', 'UNESCO', 'Wildlife'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 788 457 776',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 3,
    title: 'Infrastructure & Construction Projects',
    description: 'Participate in Uganda\'s massive infrastructure development boom including roads, bridges, airports, and urban development projects backed by government and international funding.',
    category: 'Infrastructure',
    location: 'Countrywide - Urban and Rural',
    investment: '$500,000 - $100,000,000',
    returns: '12-25% annually',
    timeline: '24-84 months',
    risk: 'Medium',
    image: '/images/Infrastucture.webp',
    requirements: [
      'Construction industry licenses',
      'Engineering certifications and expertise',
      'Financial guarantees and bonding',
      'Government contract qualifications',
      'Local partnership requirements',
      'Environmental and social compliance'
    ],
    benefits: [
      'Government project backing and guarantees',
      'Long-term contract stability',
      'Essential service provision priority',
      'Regional development impact recognition',
      'International funding support',
      'Skills transfer opportunities'
    ],
    tags: ['Infrastructure', 'Construction', 'Government', 'Long-term', 'PPP', 'Development'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 4,
    title: 'Manufacturing & Industrial Parks',
    description: 'Establish state-of-the-art manufacturing plants for textiles, pharmaceuticals, consumer goods, and agro-processing in Uganda\'s specialized industrial parks and economic zones.',
    category: 'Manufacturing',
    location: 'Industrial Parks - Kampala, Mbale, Luzira',
    investment: '$200,000 - $25,000,000',
    returns: '18-32% annually',
    timeline: '18-60 months',
    risk: 'Medium',
    image: '/images/06-08-2018-09-43-07_UgandaInvestmentAuthority.webp',
    requirements: [
      'Industrial operating licenses',
      'Environmental compliance certification',
      'International quality standards (ISO)',
      'Utility connections and infrastructure',
      'Export market certifications',
      'Skilled workforce development plans'
    ],
    benefits: [
      'Preferential trade agreements (EAC, AGOA, EU)',
      'Skilled and cost-effective labor force',
      'Raw material availability and access',
      'Export incentives and support',
      'Industrial park infrastructure',
      'Government manufacturing priority'
    ],
    tags: ['Manufacturing', 'Industry', 'Export', 'Industrial Parks', 'EAC', 'AGOA'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 5,
    title: 'Technology & Digital Innovation',
    description: 'Invest in Uganda\'s rapidly growing technology ecosystem including fintech, agtech, healthtech, mobile solutions, and digital transformation services.',
    category: 'Technology',
    location: 'Kampala, Tech Hubs, Innovation Centers',
    investment: '$25,000 - $3,000,000',
    returns: '25-60% annually (high growth)',
    timeline: '6-36 months',
    risk: 'High',
    image: '/images/7c30e04b-2c14-4c7a-8cb6-e8ffefaa92e8-750x375.webp',
    requirements: [
      'Technology business licenses',
      'Intellectual property registration',
      'Data protection and cybersecurity compliance',
      'Technical certifications',
      'Partnership agreements with local institutions',
      'Regulatory compliance (telecoms, finance)'
    ],
    benefits: [
      'Exceptional high growth potential',
      'Young, tech-savvy population (77% under 30)',
      'Government digital transformation push',
      'Regional technology hub development',
      'Mobile money penetration (78%)',
      'Growing middle class adoption'
    ],
    tags: ['Technology', 'Innovation', 'Fintech', 'Digital', 'Agtech', 'Healthtech'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 6,
    title: 'Energy & Renewable Resources',
    description: 'Strategic investment in Uganda\'s rapidly expanding energy sector with focus on renewable energy projects including solar, hydro, and biomass to meet the country\'s growing energy demands.',
    category: 'Energy',
    location: 'Northern Uganda, Western Region, Industrial Zones',
    investment: '$100,000 - $50,000,000',
    returns: '15-28% annually',
    timeline: '18-72 months (project dependent)',
    risk: 'Medium',
    image: '/images/Infrastructures-and-Transport.webp',
    requirements: [
      'Electricity generation license from ERA',
      'Environmental and social impact assessment',
      'Grid connection and wheeling agreements',
      'Land acquisition or lease agreements',
      'Technical and financial capability proof',
      'Power purchase agreements (PPAs)'
    ],
    benefits: [
      'Government feed-in tariff guarantees',
      'Carbon credit revenue opportunities',
      'Priority national infrastructure project status',
      'Rural electrification program support',
      'Regional energy export opportunities',
      'Long-term stable revenue streams'
    ],
    tags: ['Energy', 'Renewable', 'Solar', 'Hydro', 'Green', 'Infrastructure'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 7,
    title: 'Healthcare & Medical Services',
    description: 'Comprehensive healthcare investment opportunities including private hospitals, diagnostic centers, pharmaceutical manufacturing, and telemedicine solutions.',
    category: 'Healthcare',
    location: 'Kampala, Regional Centers, Border Towns',
    investment: '$100,000 - $10,000,000',
    returns: '20-35% annually',
    timeline: '12-48 months',
    risk: 'Medium',
    image: '/images/Pride.webp',
    requirements: [
      'Ministry of Health operating licenses',
      'National Drug Authority approvals',
      'Professional healthcare staff recruitment',
      'Medical equipment import permits',
      'Healthcare facility accreditation',
      'Insurance and liability coverage'
    ],
    benefits: [
      'Growing middle class healthcare demand',
      'Government healthcare improvement priorities',
      'Medical tourism potential from region',
      'Public-private partnership opportunities',
      'Essential service with steady demand',
      'Regional referral center possibilities'
    ],
    tags: ['Healthcare', 'Medical Services', 'Pharmaceuticals', 'Telemedicine', 'PPP'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  },
  {
    id: 8,
    title: 'Real Estate & Property Development',
    description: 'Lucrative real estate development opportunities in Uganda\'s booming property market, including residential, commercial, and industrial developments.',
    category: 'Real Estate',
    location: 'Kampala Metropolitan, Entebbe, Regional Cities',
    investment: '$200,000 - $25,000,000',
    returns: '15-30% annually',
    timeline: '18-60 months',
    risk: 'Medium',
    image: '/images/uganda-kampala-city-view.webp',
    requirements: [
      'Land title acquisition or long-term lease',
      'Development permits and approvals',
      'Environmental impact assessments',
      'Construction licenses and certifications',
      'Utility connections and infrastructure',
      'Marketing and sales permits'
    ],
    benefits: [
      'Rapid urbanization (6.4% annual growth)',
      'Growing middle class housing demand',
      'Government infrastructure development',
      'Foreign investor property ownership rights',
      'Strong rental yields in prime locations',
      'Capital appreciation potential'
    ],
    tags: ['Real Estate', 'Construction', 'Housing', 'Commercial Property', 'Urbanization'],
    contact: {
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 300 100',
      website: 'https://www.ugandainvest.go.ug',
      agency: 'Uganda Investment Authority (UIA)'
    }
  }
];

export const investmentCategories = [
  'All',
  'Agriculture',
  'Tourism',
  'Infrastructure',
  'Manufacturing',
  'Technology',
  'Energy',
  'Healthcare',
  'Real Estate'
];

export const riskLevels = ['Low', 'Medium', 'Medium-High', 'High'];
export const investmentRanges = [
  'Under $50K',
  '$50K - $200K',
  '$200K - $1M',
  '$1M - $5M',
  'Over $5M'
];