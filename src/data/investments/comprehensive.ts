// Comprehensive Investment Opportunities Database for OneStopCentre Uganda
// Complete investment data with requirements, incentives, and risk factors

import { getContactInfo } from './contacts';
import { InvestmentOpportunity } from '../../types';

export const COMPREHENSIVE_INVESTMENT_OPPORTUNITIES: Omit<InvestmentOpportunity, 'contact' | 'logo'>[] = [
  // AGRICULTURE & AGRIBUSINESS
  {
    id: 'agri-value-chain',
    title: 'Agricultural Value Chain Development',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Investment in crop processing, storage, and marketing infrastructure with 450,000 MT maize and 328,000 MT rice processing opportunity. Comprehensive value addition from farm to market.',
    investmentRange: 'USD 250K - 5M',
    expectedROI: '12-18% annually',
    timeline: '18-36 months',
    marketPotential: 'East African market of 300M people, growing food demand of 4% annually',
    contactKey: 'MAAIF',
    priority: 'high',
    requirements: [
      'Agricultural processing experience or technical partnership',
      'Environmental impact assessment completion',
      'Land acquisition or lease agreements',
      'Working capital for 6 months operations',
      'Cold storage and logistics capabilities'
    ],
    incentives: [
      '100% investment deduction for agro-processing',
      '10-year corporate tax holiday available',
      'Zero duty on agricultural machinery imports',
      'Access to concessional financing through development banks',
      'Export processing zone benefits for export-oriented projects'
    ],
    riskFactors: [
      'Climate variability affecting crop yields',
      'Price volatility in commodity markets',
      'Infrastructure limitations in rural areas',
      'Competition from established regional players',
      'Currency exchange rate fluctuations'
    ]
  },
  {
    id: 'coffee-processing',
    title: 'Coffee Processing & Export',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Coffee hulling, roasting, and value-added manufacturing. USD 221.63M export value (Aug 2024), growing 8% annually. Uganda is Africa\'s second-largest coffee producer.',
    investmentRange: 'USD 500K - 3M',
    expectedROI: '15-22% annually',
    timeline: '12-24 months',
    marketPotential: 'Global coffee market worth USD 100B, specialty coffee growing 8% annually',
    contactKey: 'UCDA',
    priority: 'high',
    requirements: [
      'Coffee processing technology and equipment',
      'Quality certification systems (UTZ, Fair Trade, Organic)',
      'Export marketing and distribution networks',
      'Working relationships with coffee farmers',
      'Food safety and hygiene certifications'
    ],
    incentives: [
      'Coffee Development Trust Fund access',
      'Export promotion incentives',
      'Duty-free importation of coffee processing equipment',
      'Technical support from Uganda Coffee Development Authority',
      'Access to international coffee certification programs'
    ],
    riskFactors: [
      'Global coffee price fluctuations',
      'Climate change impact on coffee production',
      'Competition from established coffee exporters',
      'Quality control and consistency challenges',
      'International trade regulation changes'
    ]
  },
  {
    id: 'irrigation-systems',
    title: 'Irrigation Infrastructure Development',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Modern irrigation systems and water management. Only 0.1% of arable land currently irrigated - vast expansion opportunity with government support for agricultural modernization.',
    investmentRange: 'USD 1M - 10M',
    expectedROI: '10-15% annually',
    timeline: '24-48 months',
    marketPotential: '39M hectares of arable land, potential to irrigate 2.7M hectares',
    contactKey: 'MWE',
    priority: 'medium',
    requirements: [
      'Water rights and permits acquisition',
      'Environmental and social impact assessments',
      'Technical expertise in irrigation systems',
      'Farmer cooperative partnerships',
      'Maintenance and operations capacity'
    ],
    incentives: [
      'Government co-financing for irrigation projects',
      'Tax holidays for agricultural infrastructure',
      'Concessional land leases for irrigation schemes',
      'Technical assistance from development partners',
      'Access to climate finance facilities'
    ],
    riskFactors: [
      'Seasonal water availability variations',
      'High initial capital requirements',
      'Farmer adoption and payment capacity',
      'Technical maintenance challenges',
      'Environmental and community resistance'
    ]
  },

  // TOURISM & HOSPITALITY
  {
    id: 'eco-lodges',
    title: 'Eco-Tourism Lodge Development',
    category: 'Tourism & Hospitality',
    sector: 'Tourism',
    description: 'Sustainable accommodation in national parks. 100 high-end cottages planned, USD 1.28B tourism earnings (2024). Uganda has 10 national parks with unique wildlife experiences.',
    investmentRange: 'USD 500K - 2.5M',
    expectedROI: '18-25% annually',
    timeline: '18-30 months',
    marketPotential: 'Regional tourism market growing 12% annually, eco-tourism segment expanding rapidly',
    contactKey: 'UTB',
    priority: 'high',
    requirements: [
      'Environmental compliance and permits',
      'Hospitality industry experience',
      'Sustainable building and operations practices',
      'Wildlife and conservation partnerships',
      'International marketing capabilities'
    ],
    incentives: [
      'Tourism investment incentives package',
      'Fast-track licensing for tourism projects',
      'Marketing support from Uganda Tourism Board',
      'Access to tourism development fund',
      'Preferential land lease terms in tourist areas'
    ],
    riskFactors: [
      'Seasonal tourism demand fluctuations',
      'Environmental regulations and restrictions',
      'Infrastructure limitations in remote areas',
      'Wildlife management and safety concerns',
      'Competition from established safari operators'
    ]
  },

  // MINING & MINERALS
  {
    id: 'gold-mining',
    title: 'Gold Mining Operations',
    category: 'Mining & Minerals',
    sector: 'Minerals',
    description: 'Commercial gold mining and processing. USD 1.8B export potential with proven reserves in western and eastern regions. Government promoting formal mining sector development.',
    investmentRange: 'USD 2M - 20M',
    expectedROI: '25-35% annually',
    timeline: '36-60 months',
    marketPotential: 'Gold reserves estimated at 320 tonnes, current production only 10% of potential',
    contactKey: 'MEMD',
    priority: 'high',
    requirements: [
      'Mining licenses and exploration permits',
      'Environmental and social impact assessments',
      'Mining technology and equipment',
      'Community engagement and benefit sharing',
      'Technical mining expertise and partnerships'
    ],
    incentives: [
      'Mineral rights protection guarantees',
      'Investment promotion incentives for mining',
      'Infrastructure development support',
      'Skills development and training programs',
      'Access to geological survey data'
    ],
    riskFactors: [
      'Global gold price volatility',
      'Environmental compliance costs',
      'Community relations and social license',
      'Political and regulatory changes',
      'Technical and operational challenges'
    ]
  },

  // ICT & TECHNOLOGY
  {
    id: 'data-centers',
    title: 'Data Center Development',
    category: 'ICT & Technology',
    sector: 'ICT',
    description: 'Regional data center hub for East Africa. Growing digital economy with fiber optic infrastructure expansion. Government promoting digital transformation initiatives.',
    investmentRange: 'USD 2M - 10M',
    expectedROI: '20-28% annually',
    timeline: '18-30 months',
    marketPotential: 'East African digital economy growing 15% annually, cloud adoption accelerating',
    contactKey: 'NITA',
    priority: 'high',
    requirements: [
      'Reliable power supply and backup systems',
      'High-speed internet connectivity',
      'Security clearances and certifications',
      'Technical expertise in data center operations',
      'International connectivity partnerships'
    ],
    incentives: [
      'ICT investment promotion incentives',
      'Tax holidays for technology infrastructure',
      'Fast-track licensing for ICT projects',
      'Access to government ICT procurement',
      'Regional market access facilitation'
    ],
    riskFactors: [
      'Power supply reliability challenges',
      'Cybersecurity threats and regulations',
      'Technology obsolescence and upgrade costs',
      'Competition from international cloud providers',
      'Skilled technical workforce availability'
    ]
  },

  // MANUFACTURING & INDUSTRIAL
  {
    id: 'textile-manufacturing',
    title: 'Textile & Garments Manufacturing',
    category: 'Manufacturing & Industrial',
    sector: 'Manufacturing',
    description: 'Cotton-to-garment value chain. AGOA benefits for US market access, growing fashion industry. Uganda produces high-quality cotton suitable for textile manufacturing.',
    investmentRange: 'USD 1M - 8M',
    expectedROI: '18-25% annually',
    timeline: '24-36 months',
    marketPotential: 'US textile market access through AGOA, regional market of 300M people',
    contactKey: 'MTIC',
    priority: 'high',
    requirements: [
      'Textile manufacturing technology and equipment',
      'Skilled workforce in garment production',
      'Quality control and compliance systems',
      'Export market development capabilities',
      'Sustainable production practices'
    ],
    incentives: [
      'AGOA market access benefits',
      'Manufacturing sector investment incentives',
      'Industrial park development support',
      'Skills development and training programs',
      'Export processing zone benefits'
    ],
    riskFactors: [
      'International trade policy changes',
      'Competition from Asian manufacturers',
      'Cotton price and supply volatility',
      'Skilled labor availability and costs',
      'Technology and machinery import dependencies'
    ]
  },

  // ENERGY & UTILITIES
  {
    id: 'solar-energy',
    title: 'Solar Energy Projects',
    category: 'Energy & Utilities',
    sector: 'Energy',
    description: 'Utility-scale solar installations. High solar irradiation levels, growing energy demand of 8% annually. Government committed to renewable energy development.',
    investmentRange: 'USD 3M - 20M',
    expectedROI: '12-18% annually',
    timeline: '24-36 months',
    marketPotential: 'Regional energy deficit of 15,000MW, solar potential of 5,000MW identified',
    contactKey: 'MEMD',
    priority: 'high',
    requirements: [
      'Power purchase agreements with utilities',
      'Environmental and land use permits',
      'Solar technology and installation expertise',
      'Grid connection and transmission access',
      'Project financing and risk management'
    ],
    incentives: [
      'Renewable energy investment incentives',
      'Feed-in tariff guarantees',
      'Carbon credit revenue opportunities',
      'Concessional financing for clean energy',
      'Fast-track licensing for renewable projects'
    ],
    riskFactors: [
      'Grid stability and transmission constraints',
      'Technology costs and performance risks',
      'Policy and regulatory changes',
      'Weather and climate variability',
      'Competition from other energy sources'
    ]
  }
];

// Enhanced investment categories with metadata
export const INVESTMENT_CATEGORIES_DETAILED = [
  {
    name: 'All',
    description: 'All investment opportunities',
    count: 0,
    averageROI: '15-25%',
    icon: '🌍'
  },
  {
    name: 'Agriculture & Agribusiness',
    description: 'Food production, processing, and agricultural value chains',
    count: 0,
    averageROI: '12-22%',
    icon: '🌾'
  },
  {
    name: 'Tourism & Hospitality',
    description: 'Tourism infrastructure, hotels, and hospitality services',
    count: 0,
    averageROI: '15-25%',
    icon: '🦁'
  },
  {
    name: 'Mining & Minerals',
    description: 'Mineral extraction, processing, and value addition',
    count: 0,
    averageROI: '20-40%',
    icon: '⛏️'
  },
  {
    name: 'ICT & Technology',
    description: 'Information technology, telecommunications, and digital services',
    count: 0,
    averageROI: '20-35%',
    icon: '💻'
  },
  {
    name: 'Manufacturing & Industrial',
    description: 'Industrial production, manufacturing, and value addition',
    count: 0,
    averageROI: '18-28%',
    icon: '🏭'
  },
  {
    name: 'Energy & Utilities',
    description: 'Power generation, renewable energy, and utility services',
    count: 0,
    averageROI: '12-20%',
    icon: '⚡'
  }
];

// Performance optimization: Pre-compute investment data with contact info
export const getComprehensiveInvestmentWithContact = (investment: Omit<InvestmentOpportunity, 'contact' | 'logo'>): InvestmentOpportunity => {
  const contact = getContactInfo(investment.contactKey || '');
  return {
    ...investment,
    contact: {
      agency: contact.agency,
      email: contact.email,
      phone: contact.phone,
      website: contact.website,
      address: contact.address
    },
    logo: `/images/logos/${investment.contactKey?.toLowerCase()}.png`
  };
};

// Get all comprehensive investments with contact info
export const getAllComprehensiveInvestmentsWithContacts = (): InvestmentOpportunity[] => {
  return COMPREHENSIVE_INVESTMENT_OPPORTUNITIES.map(getComprehensiveInvestmentWithContact);
};

// Investment statistics and analytics
export const getInvestmentStats = () => {
  const investments = COMPREHENSIVE_INVESTMENT_OPPORTUNITIES;
  const totalInvestments = investments.length;
  const highPriorityCount = investments.filter(inv => inv.priority === 'high').length;
  const sectors = [...new Set(investments.map(inv => inv.sector))];
  const categories = [...new Set(investments.map(inv => inv.category))];
  
  return {
    totalInvestments,
    highPriorityCount,
    sectors: sectors.length,
    categories: categories.length,
    averageTimeline: '24-36 months',
    totalMarketValue: 'USD 2.5B+'
  };
};