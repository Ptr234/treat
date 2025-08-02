// Comprehensive Investment Opportunities Data for Uganda
// Updated: July 2025 - All investment sectors with detailed opportunities, requirements, and returns

export const COMPREHENSIVE_INVESTMENTS = [
  // AGRICULTURE & AGRIBUSINESS
  {
    id: 'agri-value-chain',
    title: 'Agricultural Value Chain Development',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Investment in crop processing, storage, and marketing infrastructure',
    investmentRange: 'USD 250,000 - 5,000,000',
    expectedROI: '12-18% annually',
    timeline: '18-36 months',
    marketPotential: '450,000 MT maize, 328,000 MT rice processing opportunity',
    requirements: ['Environmental impact assessment', 'Land acquisition/lease', 'Processing equipment', 'Market linkages'],
    incentives: ['10-year tax holiday for investments above USD 50M', 'Duty exemption on machinery', 'Investment allowances'],
    riskFactors: ['Weather dependency', 'Market price fluctuations', 'Storage and logistics challenges'],
    contact: {
      agency: 'Ministry of Agriculture, Animal Industry and Fisheries (MAAIF)',
      email: 'info@agriculture.go.ug',
      phone: '+256 414 320004',
      website: 'https://www.agriculture.go.ug'
    },
    priority: 'high',
    logo: 'https://www.agriculture.go.ug/images/logo.png'
  },
  {
    id: 'coffee-processing',
    title: 'Coffee Processing and Export',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Coffee hulling, roasting, and value-added product manufacturing',
    investmentRange: 'USD 500,000 - 3,000,000',
    expectedROI: '15-22% annually',
    timeline: '12-24 months',
    marketPotential: 'USD 221.63 million export value (August 2024), growing 8% annually',
    requirements: ['Coffee processing license', 'Quality certification', 'Export permits', 'Processing facility'],
    incentives: ['Export bonus scheme', 'VAT exemption on coffee exports', 'Free zone benefits'],
    riskFactors: ['International price volatility', 'Climate change impacts', 'Quality control requirements'],
    contact: {
      agency: 'Uganda Coffee Development Authority (UCDA)',
      email: 'info@ugandacoffee.go.ug',
      phone: '+256 414 256940',
      website: 'https://ugandacoffee.go.ug'
    },
    priority: 'high',
    logo: 'https://www.ugandacoffee.go.ug/images/logo.png'
  },
  {
    id: 'irrigation-systems',
    title: 'Irrigation Infrastructure Development',
    category: 'Agriculture & Agribusiness',
    sector: 'Agriculture',
    description: 'Modern irrigation systems and water management solutions',
    investmentRange: 'USD 1,000,000 - 10,000,000',
    expectedROI: '10-15% annually',
    timeline: '24-48 months',
    marketPotential: 'Only 0.1% of arable land currently irrigated, vast expansion opportunity',
    requirements: ['Water rights permits', 'Environmental clearance', 'Technical feasibility study', 'Farmer associations'],
    incentives: ['Government co-financing available', 'Accelerated depreciation allowances', 'Duty-free imports of equipment'],
    riskFactors: ['High initial capital requirements', 'Maintenance costs', 'Farmer adoption rates'],
    contact: {
      agency: 'Ministry of Water and Environment',
      email: 'mwe@mwe.go.ug',
      phone: '+256 414 505942',
      website: 'https://www.mwe.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.mwe.go.ug/images/logo.png'
  },

  // TOURISM & HOSPITALITY
  {
    id: 'eco-lodges',
    title: 'Eco-Tourism Lodge Development',
    category: 'Tourism & Hospitality',
    sector: 'Tourism',
    description: 'Sustainable accommodation facilities in national parks and tourist destinations',
    investmentRange: 'USD 500,000 - 2,500,000',
    expectedROI: '18-25% annually',
    timeline: '18-30 months',
    marketPotential: '100 high-end cottages planned, USD 1.28 billion tourism earnings (2024)',
    requirements: ['Tourism license', 'Environmental clearance', 'UWA concession agreement', 'Architecture approval'],
    incentives: ['Tourism investment incentives', 'Tax holidays for tourism projects', 'Duty exemption on tourism equipment'],
    riskFactors: ['Seasonality', 'Security concerns', 'Environmental regulations'],
    contact: {
      agency: 'Uganda Tourism Board',
      email: 'info@utb.go.ug',
      phone: '+256 414 342196',
      website: 'https://utb.go.ug'
    },
    priority: 'high',
    logo: 'https://www.utb.go.ug/images/logo.png'
  },
  {
    id: 'conference-facilities',
    title: 'Conference and Events Infrastructure',
    category: 'Tourism & Hospitality',
    sector: 'Tourism',
    description: 'Modern conference centers and event management facilities',
    investmentRange: 'USD 1,000,000 - 5,000,000',
    expectedROI: '14-20% annually',
    timeline: '24-36 months',
    marketPotential: 'Growing MICE (Meetings, Incentives, Conferences, Exhibitions) market in East Africa',
    requirements: ['Building permits', 'Fire safety certificates', 'Hospitality licenses', 'Professional event management'],
    incentives: ['Infrastructure development support', 'Tourism sector incentives', 'Access to regional markets'],
    riskFactors: ['High competition', 'Economic cycles', 'Technology requirements'],
    contact: {
      agency: 'Uganda Hotel Owners Association',
      email: 'info@uhoa.co.ug',
      phone: '+256 414 258 394',
      website: 'https://www.uhoa.co.ug'
    },
    priority: 'medium',
    logo: 'https://www.uhoa.co.ug/images/logo.png'
  },

  // MINING & MINERALS
  {
    id: 'gold-processing',
    title: 'Gold Mining and Processing',
    category: 'Mining & Minerals',
    sector: 'Minerals',
    description: 'Gold extraction, refining, and value addition operations',
    investmentRange: 'USD 5,000,000 - 50,000,000',
    expectedROI: '20-35% annually',
    timeline: '36-60 months',
    marketPotential: '31 million tonnes discovered, 320,158 MT refined (value $12.8 trillion potential)',
    requirements: ['Mining license', 'Environmental bond', 'Community development agreement', 'Processing equipment'],
    incentives: ['15% government equity partnership', 'Accelerated depreciation', 'Export facilitation'],
    riskFactors: ['Regulatory compliance', 'Environmental liabilities', 'International price volatility'],
    contact: {
      agency: 'Ministry of Energy and Mineral Development',
      email: 'info@memd.go.ug',
      phone: '+256 414 707 000',
      website: 'https://www.memd.go.ug'
    },
    priority: 'high',
    logo: 'https://www.memd.go.ug/images/logo.png'
  },
  {
    id: 'rare-earth-mining',
    title: 'Rare Earth Elements Extraction',
    category: 'Mining & Minerals',
    sector: 'Minerals',
    description: 'Extraction and processing of rare earth elements for technology applications',
    investmentRange: 'USD 10,000,000 - 200,000,000',
    expectedROI: '25-40% annually',
    timeline: '48-84 months',
    marketPotential: '300 million tonnes proven reserves, global demand growing 10% annually',
    requirements: ['Exploration license', 'Environmental impact assessment', 'Advanced processing technology', 'Export licenses'],
    incentives: ['Strategic mineral status', 'Government partnership opportunities', 'International development funding'],
    riskFactors: ['High capital requirements', 'Technical complexity', 'Environmental challenges'],
    contact: {
      agency: 'Uganda Chamber of Mines and Petroleum',
      email: 'info@ucmp.ug',
      phone: '+256 414 540 782',
      website: 'https://www.ucmp.ug'
    },
    priority: 'high',
    logo: 'https://www.ucmp.ug/images/logo.png'
  },

  // ICT & DIGITAL INNOVATION
  {
    id: 'fintech-solutions',
    title: 'Financial Technology Development',
    category: 'ICT & Digital Innovation',
    sector: 'ICT',
    description: 'Mobile payment systems, digital lending, and financial inclusion solutions',
    investmentRange: 'USD 100,000 - 2,000,000',
    expectedROI: '15-25% annually',
    timeline: '12-24 months',
    marketPotential: '43 million mobile money accounts, $762.40 million market size by 2028',
    requirements: ['Payment system license', 'Data protection compliance', 'Anti-money laundering certification', 'Technology infrastructure'],
    incentives: ['Innovation hubs support', 'Tax incentives for technology startups', 'Regulatory sandbox access'],
    riskFactors: ['Regulatory changes', 'Cybersecurity threats', 'Market competition'],
    contact: {
      agency: 'Ministry of ICT and National Guidance',
      email: 'info@ict.go.ug',
      phone: '+256 414 313 333',
      website: 'https://www.ict.go.ug'
    },
    priority: 'high',
    logo: 'https://www.ict.go.ug/images/logo.png'
  },
  {
    id: 'data-centers',
    title: 'Data Center Development',
    category: 'ICT & Digital Innovation',
    sector: 'ICT',
    description: 'Cloud computing infrastructure and data hosting services',
    investmentRange: 'USD 1,000,000 - 10,000,000',
    expectedROI: '12-18% annually',
    timeline: '24-36 months',
    marketPotential: 'Growing demand for cloud services across East Africa region',
    requirements: ['Telecommunications license', 'Reliable power supply', 'Cooling systems', 'Security infrastructure'],
    incentives: ['ICT infrastructure development support', 'Duty exemption on equipment', 'Fast-track licensing'],
    riskFactors: ['Power supply reliability', 'Internet connectivity', 'Technology obsolescence'],
    contact: {
      agency: 'National Information Technology Authority (NITA)',
      email: 'info@nita.go.ug',
      phone: '+256 417 801 038',
      website: 'https://www.nita.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.nita.go.ug/images/logo.png'
  },

  // MANUFACTURING & INDUSTRIAL
  {
    id: 'textile-manufacturing',
    title: 'Textile and Garment Manufacturing',
    category: 'Manufacturing & Industrial',
    sector: 'Manufacturing',
    description: 'Cotton-based textile production and garment manufacturing for export',
    investmentRange: 'USD 2,000,000 - 15,000,000',
    expectedROI: '15-22% annually',
    timeline: '18-30 months',
    marketPotential: 'Access to 300 million people in East African market, AGOA benefits for US market',
    requirements: ['Industrial license', 'Export license', 'Quality certification', 'Environmental compliance'],
    incentives: ['VAT exemption on inputs', 'Duty drawback schemes', 'Export processing zone benefits'],
    riskFactors: ['International competition', 'Cotton price fluctuations', 'Power supply costs'],
    contact: {
      agency: 'Uganda Manufacturers Association',
      email: 'uma@uma.or.ug',
      phone: '+256 414 220 026',
      website: 'https://www.uma.or.ug'
    },
    priority: 'high',
    logo: 'https://www.uma.or.ug/images/logo.png'
  },
  {
    id: 'pharmaceutical-manufacturing',
    title: 'Pharmaceutical Manufacturing',
    category: 'Manufacturing & Industrial',
    sector: 'Manufacturing',
    description: 'Production of essential medicines and pharmaceutical products',
    investmentRange: 'USD 3,000,000 - 20,000,000',
    expectedROI: '18-28% annually',
    timeline: '30-48 months',
    marketPotential: '80% import substitution opportunity, growing healthcare market',
    requirements: ['Good Manufacturing Practice (GMP) certification', 'Drug manufacturing license', 'Quality control systems'],
    incentives: ['Pioneer status benefits', 'Duty exemption on raw materials', 'Fast-track approvals'],
    riskFactors: ['Strict regulatory requirements', 'Quality control standards', 'Market access barriers'],
    contact: {
      agency: 'National Drug Authority (NDA)',
      email: 'info@nda.or.ug',
      phone: '+256 414 340 193',
      website: 'https://www.nda.or.ug'
    },
    priority: 'high',
    logo: 'https://www.nda.or.ug/images/logo.png'
  },

  // ENERGY & POWER
  {
    id: 'solar-power-plants',
    title: 'Solar Power Generation',
    category: 'Energy & Power',
    sector: 'Energy',
    description: 'Utility-scale solar photovoltaic power generation projects',
    investmentRange: 'USD 5,000,000 - 50,000,000',
    expectedROI: '12-18% annually',
    timeline: '24-36 months',
    marketPotential: '5.1 kWh/m² solar potential, $0.11/kWh feed-in tariff',
    requirements: ['Generation license', 'Environmental impact assessment', 'Land acquisition', 'Grid connection agreement'],
    incentives: ['Renewable energy feed-in tariffs', 'Tax holidays', 'Duty exemption on equipment'],
    riskFactors: ['Grid stability', 'Policy changes', 'Technology costs'],
    contact: {
      agency: 'Electricity Regulatory Authority (ERA)',
      email: 'info@era.go.ug',
      phone: '+256 417 101 800',
      website: 'https://www.era.go.ug'
    },
    priority: 'high',
    logo: 'https://www.era.go.ug/images/logo.png'
  },
  {
    id: 'mini-hydro-power',
    title: 'Mini Hydropower Development',
    category: 'Energy & Power',
    sector: 'Energy',
    description: 'Small-scale hydroelectric power generation (1-20 MW)',
    investmentRange: 'USD 2,000,000 - 25,000,000',
    expectedROI: '14-20% annually',
    timeline: '30-48 months',
    marketPotential: '4,100+ MW hydro potential, only 15% currently exploited',
    requirements: ['Water use permit', 'Environmental clearance', 'Generation license', 'Community agreements'],
    incentives: ['Standardized small power producer tariffs', 'Fast-track licensing', 'Carbon credit opportunities'],
    riskFactors: ['Hydrological risks', 'Environmental compliance', 'Grid connection challenges'],
    contact: {
      agency: 'Ministry of Energy and Mineral Development',
      email: 'info@memd.go.ug',
      phone: '+256 414 707 000',
      website: 'https://www.memd.go.ug'
    },
    priority: 'high',
    logo: 'https://www.memd.go.ug/images/logo.png'
  },

  // INFRASTRUCTURE & CONSTRUCTION
  {
    id: 'affordable-housing',
    title: 'Affordable Housing Development',
    category: 'Infrastructure & Construction',
    sector: 'Construction',
    description: 'Mass housing projects targeting middle and low-income segments',
    investmentRange: 'USD 2,000,000 - 25,000,000',
    expectedROI: '12-18% annually',
    timeline: '24-48 months',
    marketPotential: '8 million unit shortage, 300,000 units needed annually',
    requirements: ['Building permits', 'Land titles', 'Environmental clearance', 'Utility connections'],
    incentives: ['Housing finance facilitation', 'Tax incentives for developers', 'Infrastructure support'],
    riskFactors: ['Land acquisition costs', 'Utility availability', 'Market affordability'],
    contact: {
      agency: 'Ministry of Lands, Housing and Urban Development',
      email: 'info@molhud.go.ug',
      phone: '+256 414 341 278',
      website: 'https://www.molhud.go.ug'
    },
    priority: 'high',
    logo: 'https://www.molhud.go.ug/images/logo.png'
  },
  {
    id: 'smart-cities',
    title: 'Smart City Infrastructure',
    category: 'Infrastructure & Construction',
    sector: 'Construction',
    description: 'Integrated urban infrastructure with smart technology solutions',
    investmentRange: 'USD 10,000,000 - 100,000,000',
    expectedROI: '10-15% annually',
    timeline: '60-120 months',
    marketPotential: 'Greater Kampala smart city development initiative',
    requirements: ['Master planning approval', 'Multiple sector licenses', 'Technology partnerships', 'Government coordination'],
    incentives: ['PPP framework support', 'Multi-sector tax incentives', 'International funding access'],
    riskFactors: ['Complex coordination', 'Technology integration', 'Long payback periods'],
    contact: {
      agency: 'Uganda Investment Authority',
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 301 000',
      website: 'https://www.ugandainvest.go.ug'
    },
    priority: 'medium',
    logo: '/images/logos/uia-logo.png'
  },

  // HEALTHCARE & PHARMACEUTICALS
  {
    id: 'private-hospitals',
    title: 'Private Hospital Development',
    category: 'Healthcare & Pharmaceuticals',
    sector: 'Healthcare',
    description: 'Modern healthcare facilities with specialized medical services',
    investmentRange: 'USD 2,000,000 - 15,000,000',
    expectedROI: '15-25% annually',
    timeline: '30-48 months',
    marketPotential: 'USD 1.50 billion hospitals market, growing middle class demand',
    requirements: ['Health facility license', 'Medical equipment certification', 'Professional staff licensing', 'Insurance partnerships'],
    incentives: ['Healthcare infrastructure support', 'Medical equipment duty exemption', 'PPP opportunities'],
    riskFactors: ['Regulatory compliance', 'Staff recruitment', 'Insurance reimbursements'],
    contact: {
      agency: 'Ministry of Health',
      email: 'info@health.go.ug',
      phone: '+256 414 340 874',
      website: 'https://www.health.go.ug'
    },
    priority: 'high',
    logo: 'https://www.health.go.ug/images/logo.png'
  },
  {
    id: 'medical-devices',
    title: 'Medical Devices Manufacturing',
    category: 'Healthcare & Pharmaceuticals',
    sector: 'Healthcare',
    description: 'Production of medical equipment and diagnostic devices',
    investmentRange: 'USD 1,000,000 - 8,000,000',
    expectedROI: '18-25% annually',
    timeline: '24-36 months',
    marketPotential: 'Growing healthcare sector, import substitution opportunities',
    requirements: ['Medical device registration', 'Quality management systems', 'Technical expertise', 'Distribution networks'],
    incentives: ['Manufacturing incentives', 'Pioneer industry benefits', 'Export promotion support'],
    riskFactors: ['Technical standards', 'Market penetration', 'Competition from imports'],
    contact: {
      agency: 'National Drug Authority (NDA)',
      email: 'info@nda.or.ug',
      phone: '+256 414 340 193',
      website: 'https://www.nda.or.ug'
    },
    priority: 'medium',
    logo: 'https://www.nda.or.ug/images/logo.png'
  },

  // EDUCATION & TRAINING
  {
    id: 'vocational-training',
    title: 'Vocational Training Institutes',
    category: 'Education & Training',
    sector: 'Education',
    description: 'Technical and vocational education and training (TVET) institutions',
    investmentRange: 'USD 500,000 - 3,000,000',
    expectedROI: '12-18% annually',
    timeline: '18-30 months',
    marketPotential: '4.3 million young people target by 2030, skills development priority',
    requirements: ['Education license', 'Curriculum approval', 'Qualified instructors', 'Equipment and facilities'],
    incentives: ['Education sector support', 'Skills development funding', 'PPP opportunities'],
    riskFactors: ['Student enrollment', 'Employment outcomes', 'Technology upgrades'],
    contact: {
      agency: 'Ministry of Education and Sports',
      email: 'info@education.go.ug',
      phone: '+256 414 234 451',
      website: 'https://www.education.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.education.go.ug/images/logo.png'
  },
  {
    id: 'e-learning-platforms',
    title: 'Digital Learning Platforms',
    category: 'Education & Training',
    sector: 'Education',
    description: 'AI-powered e-learning and educational technology solutions',
    investmentRange: 'USD 200,000 - 1,500,000',
    expectedROI: '15-25% annually',
    timeline: '12-18 months',
    marketPotential: 'Digital transformation in education, remote learning demand',
    requirements: ['Technology infrastructure', 'Content development', 'Learning management systems', 'Market partnerships'],
    incentives: ['Innovation support programs', 'Digital infrastructure access', 'Education technology grants'],
    riskFactors: ['Internet connectivity', 'User adoption', 'Content localization'],
    contact: {
      agency: 'National Information Technology Authority (NITA)',
      email: 'info@nita.go.ug',
      phone: '+256 417 801 038',
      website: 'https://www.nita.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.nita.go.ug/images/logo.png'
  },

  // FINANCIAL SERVICES
  {
    id: 'microfinance-institutions',
    title: 'Microfinance Operations',
    category: 'Financial Services',
    sector: 'Finance',
    description: 'Tier 4 microfinance institutions providing financial inclusion services',
    investmentRange: 'USD 500,000 - 5,000,000',
    expectedROI: '15-25% annually',
    timeline: '12-24 months',
    marketPotential: '78% financial inclusion rate, growing micro-enterprise sector',
    requirements: ['Microfinance license', 'Capital adequacy', 'Risk management systems', 'Branch network'],
    incentives: ['Financial inclusion support', 'Regulatory facilitation', 'Development finance access'],
    riskFactors: ['Credit risk', 'Interest rate regulation', 'Competition'],
    contact: {
      agency: 'Uganda Microfinance Regulatory Authority',
      email: 'info@umra.go.ug',
      phone: '+256 414 233 218',
      website: 'https://www.umra.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.umra.go.ug/images/logo.png'
  },
  {
    id: 'insurance-products',
    title: 'Insurance Services Development',
    category: 'Financial Services',
    sector: 'Finance',
    description: 'General insurance, life insurance, and specialized insurance products',
    investmentRange: 'USD 1,000,000 - 10,000,000',
    expectedROI: '12-20% annually',
    timeline: '18-30 months',
    marketPotential: 'Low insurance penetration (2.5% of GDP), growth opportunity',
    requirements: ['Insurance license', 'Minimum capital requirements', 'Actuarial expertise', 'Distribution networks'],
    incentives: ['Insurance sector development support', 'Tax incentives on premiums', 'Regional market access'],
    riskFactors: ['Regulatory compliance', 'Claims management', 'Market education needs'],
    contact: {
      agency: 'Insurance Regulatory Authority',
      email: 'info@ira.go.ug',
      phone: '+256 414 342 132',
      website: 'https://www.ira.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.ira.go.ug/images/logo.png'
  },

  // REAL ESTATE & PROPERTY
  {
    id: 'commercial-real-estate',
    title: 'Commercial Property Development',
    category: 'Real Estate & Property',
    sector: 'Real Estate',
    description: 'Office buildings, retail centers, and mixed-use developments',
    investmentRange: 'USD 1,000,000 - 20,000,000',
    expectedROI: '10-16% annually',
    timeline: '24-48 months',
    marketPotential: '8% sector contribution to GDP, strong demand in Kampala',
    requirements: ['Land titles', 'Building permits', 'Environmental clearance', 'Utility connections'],
    incentives: ['Real estate investment trust (REIT) framework', 'Property development loans', 'Infrastructure support'],
    riskFactors: ['Market cycles', 'Construction costs', 'Occupancy rates'],
    contact: {
      agency: 'Association of Real Estate Agents (AREA)',
      email: 'info@area-uganda.org',
      phone: '+256 414 540 836',
      website: 'https://www.area-uganda.org'
    },
    priority: 'medium',
    logo: 'https://www.area-uganda.org/images/logo.png'
  },
  {
    id: 'industrial-real-estate',
    title: 'Industrial Parks Development',
    category: 'Real Estate & Property',
    sector: 'Real Estate',
    description: 'Industrial parks and manufacturing facility development',
    investmentRange: 'USD 5,000,000 - 50,000,000',
    expectedROI: '8-14% annually',
    timeline: '36-60 months',
    marketPotential: 'Growing manufacturing sector, oil region development',
    requirements: ['Master planning approval', 'Environmental impact assessment', 'Utility infrastructure', 'Industrial zoning'],
    incentives: ['Industrial park incentives', 'Infrastructure co-financing', 'One-stop services'],
    riskFactors: ['Large capital requirements', 'Long development periods', 'Tenant attraction'],
    contact: {
      agency: 'Uganda Investment Authority',
      email: 'info@ugandainvest.go.ug',
      phone: '+256 414 301 000',
      website: 'https://www.ugandainvest.go.ug'
    },
    priority: 'medium',
    logo: '/images/logos/uia-logo.png'
  },

  // TRANSPORT & LOGISTICS
  {
    id: 'warehousing-logistics',
    title: 'Warehousing and Distribution Centers',
    category: 'Transport & Logistics',
    sector: 'Transport',
    description: 'Modern storage facilities and logistics hubs for regional trade',
    investmentRange: 'USD 1,000,000 - 8,000,000',
    expectedROI: '12-18% annually',
    timeline: '18-30 months',
    marketPotential: 'Regional trade expansion, e-commerce growth driving demand',
    requirements: ['Warehouse licenses', 'Customs bonded status', 'Fire safety certification', 'Transport connectivity'],
    incentives: ['Logistics hub development support', 'Customs facilitation', 'Trade corridor benefits'],
    riskFactors: ['Infrastructure dependency', 'Trade policy changes', 'Competition'],
    contact: {
      agency: 'Ministry of Works and Transport',
      email: 'info@mowt.go.ug',
      phone: '+256 414 320 580',
      website: 'https://www.mowt.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.mowt.go.ug/images/logo.png'
  },
  {
    id: 'cold-chain-logistics',
    title: 'Cold Chain Infrastructure',
    category: 'Transport & Logistics',
    sector: 'Transport',
    description: 'Temperature-controlled storage and transport for agricultural products',
    investmentRange: 'USD 500,000 - 3,000,000',
    expectedROI: '15-22% annually',
    timeline: '12-24 months',
    marketPotential: 'High post-harvest losses (30-40%), value chain improvement opportunity',
    requirements: ['Cold storage equipment', 'Refrigerated transport', 'Quality certification', 'Power backup systems'],
    incentives: ['Agriculture value chain support', 'Equipment import duty exemption', 'Export facilitation'],
    riskFactors: ['Power supply reliability', 'Equipment maintenance', 'Market linkages'],
    contact: {
      agency: 'Uganda Cold Chain Association',
      email: 'info@coldchain.ug',
      phone: '+256 414 567 890',
      website: 'https://www.coldchain.ug'
    },
    priority: 'high',
    logo: 'https://www.coldchain.ug/images/logo.png'
  },

  // WASTE MANAGEMENT & RECYCLING
  {
    id: 'plastic-recycling',
    title: 'Plastic Waste Recycling',
    category: 'Waste Management & Recycling',
    sector: 'Environment',
    description: 'Collection, processing, and recycling of plastic waste into useful products',
    investmentRange: 'USD 200,000 - 2,000,000',
    expectedROI: '18-25% annually',
    timeline: '12-18 months',
    marketPotential: '600,000 tons daily waste generation, less than 10% currently recycled',
    requirements: ['Environmental license', 'Waste collection permits', 'Processing equipment', 'Market partnerships'],
    incentives: ['Environmental protection incentives', 'Green technology support', 'Corporate sustainability partnerships'],
    riskFactors: ['Waste collection logistics', 'Market demand fluctuations', 'Technology upgrades'],
    contact: {
      agency: 'National Environment Management Authority (NEMA)',
      email: 'info@nema.go.ug',
      phone: '+256 414 251 064',
      website: 'https://www.nema.go.ug'
    },
    priority: 'high',
    logo: 'https://www.nema.go.ug/images/logo.png'
  },
  {
    id: 'organic-waste-composting',
    title: 'Organic Waste Composting',
    category: 'Waste Management & Recycling',
    sector: 'Environment',
    description: 'Conversion of organic waste into compost and bio-fertilizers',
    investmentRange: 'USD 150,000 - 1,000,000',
    expectedROI: '20-30% annually',
    timeline: '6-12 months',
    marketPotential: '60% of waste is organic, growing demand for organic fertilizers',
    requirements: ['Composting facility license', 'Quality standards certification', 'Collection systems', 'Distribution networks'],
    incentives: ['Organic agriculture support', 'Environmental compliance benefits', 'Agricultural extension partnerships'],
    riskFactors: ['Seasonal demand', 'Quality control', 'Competition with chemical fertilizers'],
    contact: {
      agency: 'National Agricultural Research Organisation (NARO)',
      email: 'info@naro.go.ug',
      phone: '+256 414 567 570',
      website: 'https://www.naro.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.naro.go.ug/images/logo.png'
  },

  // WATER & SANITATION
  {
    id: 'water-treatment-plants',
    title: 'Water Treatment Infrastructure',
    category: 'Water & Sanitation',
    sector: 'Water',
    description: 'Municipal and industrial water treatment facilities',
    investmentRange: 'USD 2,000,000 - 25,000,000',
    expectedROI: '10-15% annually',
    timeline: '30-48 months',
    marketPotential: '$2 billion annual investment gap to 2030, PPP opportunities',
    requirements: ['Water supply license', 'Environmental clearance', 'Technical specifications', 'Government partnerships'],
    incentives: ['PPP framework support', 'Blended financing options', 'Revenue guarantees'],
    riskFactors: ['Regulatory framework', 'Tariff adjustments', 'Political risks'],
    contact: {
      agency: 'Ministry of Water and Environment',
      email: 'mwe@mwe.go.ug',
      phone: '+256 414 505942',
      website: 'https://www.mwe.go.ug'
    },
    priority: 'high',
    logo: 'https://www.mwe.go.ug/images/logo.png'
  },
  {
    id: 'sanitation-solutions',
    title: 'Sanitation Technology Solutions',
    category: 'Water & Sanitation',
    sector: 'Water',
    description: 'Innovative sanitation systems and waste water treatment',
    investmentRange: 'USD 500,000 - 5,000,000',
    expectedROI: '12-18% annually',
    timeline: '18-30 months',
    marketPotential: 'Growing urban population, sanitation coverage gaps',
    requirements: ['Sanitation facility permits', 'Health department approvals', 'Technology certification', 'Maintenance services'],
    incentives: ['Urban development support', 'Health sector partnerships', 'Innovation grants'],
    riskFactors: ['User acceptance', 'Maintenance requirements', 'Regulatory compliance'],
    contact: {
      agency: 'National Water and Sewerage Corporation (NWSC)',
      email: 'customercare@nwsc.co.ug',
      phone: '+256 414 315 000',
      website: 'https://www.nwsc.co.ug'
    },
    priority: 'medium',
    logo: 'https://www.nwsc.co.ug/images/logo.png'
  },

  // ENTERTAINMENT & SPORTS
  {
    id: 'sports-facilities',
    title: 'Sports Infrastructure Development',
    category: 'Entertainment & Sports',
    sector: 'Sports',
    description: 'Modern sports facilities, stadiums, and recreational complexes',
    investmentRange: 'USD 1,000,000 - 10,000,000',
    expectedROI: '10-16% annually',
    timeline: '24-48 months',
    marketPotential: 'AFCON 2027 co-hosting, new stadiums development program',
    requirements: ['Sports facility licenses', 'Safety certifications', 'International standards compliance', 'Event management capabilities'],
    incentives: ['Sports development funding', 'Tourism sector benefits', 'International event hosting opportunities'],
    riskFactors: ['High capital costs', 'Utilization rates', 'Maintenance expenses'],
    contact: {
      agency: 'Ministry of Education and Sports',
      email: 'info@education.go.ug',
      phone: '+256 414 234 451',
      website: 'https://www.education.go.ug'
    },
    priority: 'medium',
    logo: 'https://www.education.go.ug/images/logo.png'
  },
  {
    id: 'entertainment-venues',
    title: 'Entertainment Complex Development',
    category: 'Entertainment & Sports',
    sector: 'Entertainment',
    description: 'Multi-purpose entertainment venues, cinemas, and recreational facilities',
    investmentRange: 'USD 500,000 - 5,000,000',
    expectedROI: '15-22% annually',
    timeline: '18-30 months',
    marketPotential: 'Growing middle class, youth entertainment demand, USD 3.73 million market',
    requirements: ['Entertainment licenses', 'Building safety approvals', 'Sound system regulations', 'Parking facilities'],
    incentives: ['Youth employment creation', 'Cultural industry support', 'Tourism linkage benefits'],
    riskFactors: ['Social acceptance', 'Regulatory compliance', 'Economic cycles'],
    contact: {
      agency: 'Uganda Tourism Board',
      email: 'info@utb.go.ug',
      phone: '+256 414 342196',
      website: 'https://utb.go.ug'
    },
    priority: 'low',
    logo: 'https://www.utb.go.ug/images/logo.png'
  }
];

// Investment categories for filtering and organization
export const INVESTMENT_CATEGORIES = [
  'Agriculture & Agribusiness',
  'Tourism & Hospitality',
  'Mining & Minerals',
  'ICT & Digital Innovation',
  'Manufacturing & Industrial',
  'Energy & Power',
  'Infrastructure & Construction',
  'Healthcare & Pharmaceuticals',
  'Education & Training',
  'Financial Services',
  'Real Estate & Property',
  'Transport & Logistics',
  'Waste Management & Recycling',
  'Water & Sanitation',
  'Entertainment & Sports'
];

// Investment size ranges for filtering
export const INVESTMENT_RANGES = [
  { label: 'Small (Under $500K)', min: 0, max: 500000 },
  { label: 'Medium ($500K - $2M)', min: 500000, max: 2000000 },
  { label: 'Large ($2M - $10M)', min: 2000000, max: 10000000 },
  { label: 'Major ($10M+)', min: 10000000, max: Infinity }
];

export default COMPREHENSIVE_INVESTMENTS;