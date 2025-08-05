// Optimized Investment Opportunities - No Duplicates, Better Performance
// Uses centralized contact database for unique information per button

import { getContactInfo } from './contactDatabase'

export const INVESTMENT_OPPORTUNITIES = [
  // AGRICULTURE & AGRIBUSINESS
  {
    id: 'agri-value-chain',
    title: 'Agricultural Value Chain Development',
    category: 'Agriculture & Agribusiness',
    description: 'Investment in crop processing, storage, and marketing infrastructure with 450,000 MT maize and 328,000 MT rice processing opportunity',
    investmentRange: 'USD 250K - 5M',
    expectedROI: '12-18% annually',
    timeline: '18-36 months',
    contactKey: 'MAAIF',
    priority: 'high'
  },
  {
    id: 'coffee-processing',
    title: 'Coffee Processing & Export',
    category: 'Agriculture & Agribusiness',
    description: 'Coffee hulling, roasting, and value-added manufacturing. USD 221.63M export value (Aug 2024), growing 8% annually',
    investmentRange: 'USD 500K - 3M',
    expectedROI: '15-22% annually',
    timeline: '12-24 months',
    contactKey: 'UCDA',
    priority: 'high'
  },
  {
    id: 'irrigation-systems',
    title: 'Irrigation Infrastructure Development',
    category: 'Agriculture & Agribusiness',
    description: 'Modern irrigation systems and water management. Only 0.1% of arable land currently irrigated - vast expansion opportunity',
    investmentRange: 'USD 1M - 10M',
    expectedROI: '10-15% annually',
    timeline: '24-48 months',
    contactKey: 'MWE',
    priority: 'medium'
  },
  {
    id: 'aquaculture-farming',
    title: 'Commercial Aquaculture Development',
    category: 'Agriculture & Agribusiness',
    description: 'Fish farming and processing facilities. High demand with 650,000 MT annual fish consumption vs 400,000 MT production',
    investmentRange: 'USD 200K - 2M',
    expectedROI: '20-30% annually',
    timeline: '12-18 months',
    contactKey: 'MAAIF',
    priority: 'high'
  },

  // TOURISM & HOSPITALITY
  {
    id: 'eco-lodges',
    title: 'Eco-Tourism Lodge Development',
    category: 'Tourism & Hospitality',
    description: 'Sustainable accommodation in national parks. 100 high-end cottages planned, USD 1.28B tourism earnings (2024)',
    investmentRange: 'USD 500K - 2.5M',
    expectedROI: '18-25% annually',
    timeline: '18-30 months',
    contactKey: 'UTB',
    priority: 'high'
  },
  {
    id: 'conference-facilities',
    title: 'Conference & Events Infrastructure',
    category: 'Tourism & Hospitality',
    description: 'Modern conference centers and event venues. Growing MICE tourism market with regional business hub positioning',
    investmentRange: 'USD 1M - 5M',
    expectedROI: '15-20% annually',
    timeline: '24-36 months',
    contactKey: 'UTB',
    priority: 'medium'
  },
  {
    id: 'cultural-tourism',
    title: 'Cultural Heritage Tourism',
    category: 'Tourism & Hospitality',
    description: 'Cultural sites development and heritage tourism. Unique positioning with 56 tribes and diverse cultural attractions',
    investmentRange: 'USD 300K - 1.5M',
    expectedROI: '12-18% annually',
    timeline: '15-24 months',
    contactKey: 'UTB',
    priority: 'medium'
  },

  // MINING & MINERALS
  {
    id: 'gold-mining',
    title: 'Gold Mining Operations',
    category: 'Mining & Minerals',
    description: 'Commercial gold mining and processing. USD 1.8B export potential with proven reserves in western and eastern regions',
    investmentRange: 'USD 2M - 20M',
    expectedROI: '25-35% annually',
    timeline: '36-60 months',
    contactKey: 'MEMD',
    priority: 'high'
  },
  {
    id: 'rare-earth-minerals',
    title: 'Rare Earth Minerals Extraction',
    category: 'Mining & Minerals',
    description: 'Critical minerals for technology industry. Untapped reserves of lithium, cobalt, and rare earth elements',
    investmentRange: 'USD 5M - 50M',
    expectedROI: '30-45% annually',
    timeline: '48-72 months',
    contactKey: 'MEMD',
    priority: 'high'
  },
  {
    id: 'limestone-cement',
    title: 'Limestone & Cement Production',
    category: 'Mining & Minerals',
    description: 'Construction materials for infrastructure boom. High-grade limestone deposits suitable for cement production',
    investmentRange: 'USD 3M - 15M',
    expectedROI: '18-25% annually',
    timeline: '30-42 months',
    contactKey: 'MEMD',
    priority: 'medium'
  },

  // ICT & TECHNOLOGY
  {
    id: 'data-centers',
    title: 'Data Center Development',
    category: 'ICT & Technology',
    description: 'Regional data center hub for East Africa. Growing digital economy with fiber optic infrastructure expansion',
    investmentRange: 'USD 2M - 10M',
    expectedROI: '20-28% annually',
    timeline: '18-30 months',
    contactKey: 'NITA',
    priority: 'high'
  },
  {
    id: 'fintech-solutions',
    title: 'Financial Technology Services',
    category: 'ICT & Technology',
    description: 'Mobile banking and payment solutions. 55% unbanked population presents massive financial inclusion opportunity',
    investmentRange: 'USD 500K - 3M',
    expectedROI: '25-40% annually',
    timeline: '12-24 months',
    contactKey: 'BOU',
    priority: 'high'
  },
  {
    id: 'telecommunications',
    title: 'Telecommunications Infrastructure',
    category: 'ICT & Technology',
    description: '5G network deployment and rural connectivity. 44% mobile penetration rate with expansion opportunities',
    investmentRange: 'USD 5M - 25M',
    expectedROI: '15-22% annually',
    timeline: '24-48 months',
    contactKey: 'UCC',
    priority: 'medium'
  },

  // MANUFACTURING & INDUSTRIAL
  {
    id: 'textile-manufacturing',
    title: 'Textile & Garments Manufacturing',
    category: 'Manufacturing & Industrial',
    description: 'Cotton-to-garment value chain. AGOA benefits for US market access, growing fashion industry',
    investmentRange: 'USD 1M - 8M',
    expectedROI: '18-25% annually',
    timeline: '24-36 months',
    contactKey: 'MTIC',
    priority: 'high'
  },
  {
    id: 'pharmaceutical-manufacturing',
    title: 'Pharmaceutical Manufacturing',
    category: 'Manufacturing & Industrial',
    description: 'Generic drugs and medical supplies. Regional market of 300M people, limited local production capacity',
    investmentRange: 'USD 2M - 12M',
    expectedROI: '22-30% annually',
    timeline: '30-48 months',
    contactKey: 'DRUG_AUTHORITY',
    priority: 'high'
  },
  {
    id: 'agro-processing',
    title: 'Food Processing & Packaging',
    category: 'Manufacturing & Industrial',
    description: 'Value addition for agricultural products. Export opportunities to regional and international markets',
    investmentRange: 'USD 500K - 4M',
    expectedROI: '16-22% annually',
    timeline: '18-30 months',
    contactKey: 'MTIC',
    priority: 'medium'
  },

  // ENERGY & UTILITIES
  {
    id: 'solar-energy',
    title: 'Solar Energy Projects',
    category: 'Energy & Utilities',
    description: 'Utility-scale solar installations. High solar irradiation levels, growing energy demand of 8% annually',
    investmentRange: 'USD 3M - 20M',
    expectedROI: '12-18% annually',
    timeline: '24-36 months',
    contactKey: 'MEMD',
    priority: 'high'
  },
  {
    id: 'hydroelectric-power',
    title: 'Small Hydroelectric Plants',
    category: 'Energy & Utilities',
    description: 'Mini and micro hydro projects. Abundant water resources with 4,500MW potential vs 1,200MW current capacity',
    investmentRange: 'USD 2M - 15M',
    expectedROI: '15-20% annually',
    timeline: '30-48 months',
    contactKey: 'MEMD',
    priority: 'medium'
  },
  {
    id: 'waste-to-energy',
    title: 'Waste-to-Energy Solutions',
    category: 'Energy & Utilities',
    description: 'Municipal waste processing for energy generation. Kampala generates 1,500 tons waste daily with disposal challenges',
    investmentRange: 'USD 5M - 25M',
    expectedROI: '18-25% annually',
    timeline: '36-60 months',
    contactKey: 'KCCA',
    priority: 'medium'
  }
]

export const INVESTMENT_CATEGORIES = [
  'All',
  'Agriculture & Agribusiness',
  'Tourism & Hospitality', 
  'Mining & Minerals',
  'ICT & Technology',
  'Manufacturing & Industrial',
  'Energy & Utilities'
]

// Performance optimization: Pre-compute investment data with contact info
export const getInvestmentWithContact = (investment) => {
  const contact = getContactInfo(investment.contactKey)
  return {
    ...investment,
    contact: {
      agency: contact.agency,
      email: contact.email,
      phone: contact.phone,
      website: contact.website,
      address: contact.address
    },
    logo: contact.logo
  }
}

// Get all investments with contact info (memoized for performance)
export const getAllInvestmentsWithContacts = () => {
  return INVESTMENT_OPPORTUNITIES.map(getInvestmentWithContact)
}