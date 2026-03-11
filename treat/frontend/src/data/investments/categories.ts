// Investment Categories and Sector Classifications for OneStopCentre Uganda

export interface InvestmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sectors: string[];
  averageROI: string;
  investmentRange: string;
  timeToMarket: string;
  riskLevel: 'low' | 'medium' | 'high';
  marketSize: string;
  keyIncentives: string[];
}

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  {
    id: 'agriculture-agribusiness',
    name: 'Agriculture & Agribusiness',
    description: 'Food production, processing, and agricultural value chains with strong export potential',
    icon: 'AGR',
    color: 'green',
    sectors: ['Agriculture', 'Food Processing', 'Livestock', 'Fisheries', 'Forestry'],
    averageROI: '12-22% annually',
    investmentRange: 'USD 200K - 10M',
    timeToMarket: '12-36 months',
    riskLevel: 'medium',
    marketSize: 'USD 14.2B (2024)',
    keyIncentives: [
      '10-year tax holiday for agro-processors in industrial parks/free zones',
      '0% import duty on plant and machinery for agro-processing',
      'Almost all agricultural inputs exempt from import duty and VAT',
      '100% tax allowable on training costs and research'
    ]
  },
  {
    id: 'tourism-hospitality',
    name: 'Tourism & Hospitality',
    description: 'Tourism infrastructure, eco-lodges, and hospitality services leveraging Uganda\'s natural beauty',
    icon: 'TOU',
    color: 'amber',
    sectors: ['Eco-Tourism', 'Hotels & Lodges', 'Adventure Tourism', 'Cultural Tourism', 'MICE Tourism'],
    averageROI: '15-25% annually',
    investmentRange: 'USD 300K - 5M',
    timeToMarket: '15-30 months',
    riskLevel: 'medium',
    marketSize: 'USD 1.28B (2024)',
    keyIncentives: [
      'Tourism vehicles exempt from import taxes',
      'Hotel equipment, fixtures and furniture exempt at importation',
      'VAT exempt on accommodation in up-country tourist hotels/lodges',
      'Tourism investment allowances and marketing support from UTB'
    ]
  },
  {
    id: 'mining-minerals',
    name: 'Mining & Minerals',
    description: 'Mineral extraction, processing, and value addition with significant untapped potential',
    icon: 'MIN',
    color: 'gray',
    sectors: ['Gold Mining', 'Rare Earth Minerals', 'Construction Materials', 'Industrial Minerals', 'Gemstones'],
    averageROI: '20-40% annually',
    investmentRange: 'USD 2M - 50M',
    timeToMarket: '36-72 months',
    riskLevel: 'high',
    marketSize: 'USD 1.8B potential',
    keyIncentives: [
      'Mineral rights protection',
      'Infrastructure development support',
      'Geological survey data access',
      'Investment promotion incentives'
    ]
  },
  {
    id: 'ict-technology',
    name: 'ICT & Technology',
    description: 'Information technology, telecommunications, and digital services for East African market',
    icon: 'ICT',
    color: 'blue',
    sectors: ['Data Centers', 'FinTech', 'Telecommunications', 'Software Development', 'Digital Services'],
    averageROI: '20-35% annually',
    investmentRange: 'USD 500K - 25M',
    timeToMarket: '12-30 months',
    riskLevel: 'medium',
    marketSize: 'USD 2.3B (growing 15% annually)',
    keyIncentives: [
      'ICT investment incentives',
      'Tax holidays for technology',
      'Fast-track licensing',
      'Government procurement access'
    ]
  },
  {
    id: 'manufacturing-industrial',
    name: 'Manufacturing & Industrial',
    description: 'Industrial production, manufacturing, and value addition with AGOA market access',
    icon: 'MAN',
    color: 'indigo',
    sectors: ['Textiles & Garments', 'Pharmaceuticals', 'Food Processing', 'Construction Materials', 'Electronics'],
    averageROI: '18-28% annually',
    investmentRange: 'USD 500K - 15M',
    timeToMarket: '18-48 months',
    riskLevel: 'medium',
    marketSize: 'USD 3.2B (regional market)',
    keyIncentives: [
      '10-year income tax holiday for exporters (80%+ production exported)',
      'VAT exempt on raw materials',
      'VAT deferment on plant and machinery at importation',
      '0% import duty on plant and machinery for industry setup'
    ]
  },
  {
    id: 'energy-utilities',
    name: 'Energy & Utilities',
    description: 'Power generation, renewable energy, and utility services with growing regional demand',
    icon: 'ENE',
    color: 'yellow',
    sectors: ['Solar Energy', 'Hydroelectric', 'Waste-to-Energy', 'Grid Infrastructure', 'Energy Storage'],
    averageROI: '12-20% annually',
    investmentRange: 'USD 2M - 25M',
    timeToMarket: '24-60 months',
    riskLevel: 'low',
    marketSize: 'USD 5.8B (regional deficit)',
    keyIncentives: [
      'Renewable energy incentives',
      'Feed-in tariff guarantees',
      'Carbon credit opportunities',
      'Concessional financing'
    ]
  }
];

export const INVESTMENT_SECTORS = [
  'All Sectors',
  'Agriculture',
  'Tourism',
  'Minerals',
  'ICT',
  'Manufacturing',
  'Energy',
  'Food Processing',
  'Textiles',
  'Mining',
  'Healthcare',
  'Education',
  'Infrastructure',
  'Real Estate',
  'Financial Services'
];

export const PRIORITY_LEVELS = [
  { value: 'all', label: 'All Priorities', color: 'gray' },
  { value: 'high', label: 'High Priority', color: 'red' },
  { value: 'medium', label: 'Medium Priority', color: 'yellow' },
  { value: 'low', label: 'Low Priority', color: 'green' }
];

export const INVESTMENT_RANGES = [
  { value: 'all', label: 'All Ranges' },
  { value: 'micro', label: 'Under USD 500K', min: 0, max: 500000 },
  { value: 'small', label: 'USD 500K - 2M', min: 500000, max: 2000000 },
  { value: 'medium', label: 'USD 2M - 10M', min: 2000000, max: 10000000 },
  { value: 'large', label: 'USD 10M - 50M', min: 10000000, max: 50000000 },
  { value: 'mega', label: 'Over USD 50M', min: 50000000, max: Infinity }
];

export const ROI_RANGES = [
  { value: 'all', label: 'All ROI Ranges' },
  { value: 'conservative', label: '10-15% annually', min: 10, max: 15 },
  { value: 'moderate', label: '15-25% annually', min: 15, max: 25 },
  { value: 'aggressive', label: '25%+ annually', min: 25, max: 100 }
];

export const TIMELINE_RANGES = [
  { value: 'all', label: 'All Timelines' },
  { value: 'short', label: '12-24 months', min: 12, max: 24 },
  { value: 'medium', label: '24-36 months', min: 24, max: 36 },
  { value: 'long', label: '36+ months', min: 36, max: 120 }
];

// Helper functions
export const getCategoryById = (id: string): InvestmentCategory | undefined => {
  return INVESTMENT_CATEGORIES.find(category => category.id === id);
};

export const getCategoryByName = (name: string): InvestmentCategory | undefined => {
  return INVESTMENT_CATEGORIES.find(category => category.name === name);
};

export const getCategoriesBySector = (sector: string): InvestmentCategory[] => {
  return INVESTMENT_CATEGORIES.filter(category => 
    category.sectors.some(s => s.toLowerCase().includes(sector.toLowerCase()))
  );
};

export const getAllSectors = (): string[] => {
  const sectors = new Set<string>();
  INVESTMENT_CATEGORIES.forEach(category => {
    category.sectors.forEach(sector => sectors.add(sector));
  });
  return Array.from(sectors).sort();
};