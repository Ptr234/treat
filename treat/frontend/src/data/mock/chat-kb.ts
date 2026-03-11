import { ChatKBEntry } from '@/types';

export const chatKnowledgeBase: ChatKBEntry[] = [
  {
    id: 'kb-001',
    keywords: ['register', 'business', 'company', 'registration', 'how to register'],
    question: 'How do I register a business in Uganda?',
    answer: 'To register a business in Uganda, visit the Uganda Registration Services Bureau (URSB) at www.ursb.go.ug or in person at their offices in Kampala. You need: (1) Business name search (UGX 50,000), (2) Completed registration forms, (3) IDs of directors/owners, (4) Proposed business name, (5) Memorandum and Articles of Association. Processing takes 3-5 working days. Contact URSB at +256-417-338000.',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-002',
    keywords: ['investment license', 'UIA license', 'apply', 'license requirements'],
    question: 'What is a UIA investment license and how do I apply?',
    answer: 'A UIA investment license is required for foreign investors and Ugandans investing over USD 200,000. Apply at Uganda Investment Authority (UIA) One-Stop Centre at Twed Plaza, Plot 22B Lumumba Avenue, Kampala. Requirements: (1) Completed application form, (2) Business plan, (3) Bank statement/proof of funds, (4) Passport/National ID copies, (5) Project implementation schedule. Processing: 2-7 days. Fee: USD 100. Contact: +256-414-301000 or info@ugandainvest.go.ug',
    category: 'licensing',
    language: 'en'
  },
  {
    id: 'kb-003a',
    keywords: ['tax', 'rate', 'corporate tax', 'VAT', 'PAYE', 'import duty', 'tax rate'],
    question: 'What are the tax rates in Uganda?',
    answer: 'Uganda\'s key tax rates: Corporate tax: 30%. VAT: 18%. PAYE: 10-40% depending on income. Import duty: Finished goods 25%, intermediate goods 10%, raw materials duty-free. Withholding tax: 6-15% depending on type. Capital gains tax: 30%. Contact URA: +256-417-117000, Call Centre: 0800-117000 (toll-free).',
    category: 'incentives',
    language: 'en'
  },
  {
    id: 'kb-003b',
    keywords: ['tax', 'incentives', 'ATMS', 'exemptions', 'benefits', 'tax holiday', 'tax break', 'duty free'],
    question: 'What tax incentives and holidays are available for investors in Uganda?',
    answer: 'Uganda offers attractive tax incentives: (1) 10-year income tax holiday for agro-processors in industrial parks/free zones (export-oriented), (2) 10-year income tax holiday for exporters of finished goods (80%+ production for export), (3) 0% import duty on plant and machinery for agro-processing and industry, (4) VAT exempt on raw materials for manufacturing, (5) VAT deferment on plant and machinery at importation, (6) Tourism vehicles exempt from import taxes, hotel equipment exempt at importation, (7) VAT exempt on up-country tourist accommodation, (8) 100% tax deduction on training costs and research, (9) 10-year tax holiday on income from letting Industrial Park facilities. Contact URA: +256-417-117000.',
    category: 'incentives',
    language: 'en'
  },
  {
    id: 'kb-004',
    keywords: ['agriculture', 'farming', 'agro', 'agribusiness', 'crops'],
    question: 'What are the investment opportunities in Uganda\'s agriculture sector?',
    answer: 'Agriculture is Uganda\'s largest investment sector. Uganda is the 2nd largest producer of fresh fruits and vegetables in Africa (~5.3M tonnes annually). Current bankable projects include: (1) Luwero Fruit Factory — USD 9.7M, processing pineapple/mango (canning, drying, RTD juice at 8.5MT/hr capacity), contact Alice Ndagire at andagire@ugandainvest.go.ug; (2) Acholibur Cassava Processing Factory — USD 16.5M in Pader District, producing starch, ethanol, CO2, DDGS (100-400 tons/day capacity), contact Sarah Nassimbwa at snassimbwa@ugandainvest.go.ug; (3) Cocoa Processing Factory in Bundibugyo — USD 24.3M; (4) Lira Cotton Spinning Mill — USD 44.34M; (5) Soluble Coffee Processing Factory — USD 48.1M capex + USD 33.89M annual opex. Incentives: 10-year tax holiday for agro-processors in industrial parks, 0% import duty on machinery. Contact UIA: +256-414-301000.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-005',
    keywords: ['tourism', 'hotel', 'hospitality', 'safari', 'tourist'],
    question: 'What tourism investment opportunities exist in Uganda?',
    answer: 'Uganda — "The Pearl of Africa" — named Best Investment Destination in Africa (AIM Awards Abu Dhabi 2024), CNN\'s Best Tourist Destination (2023). 5 bankable tourism projects: (1) Mount Elgon National Park Tourism Infrastructure — USD 79M; (2) Tourist Infrastructure at Equator Points — USD 8.7M; (3) Water-Based Eco-Adventure Parks (Geothermal Spas & Resorts) — USD 23.9M; (4) Nzururu Heights Hotel — USD 40M; (5) UWEC Infrastructure Development — USD 15.6M. Incentives: Tourism vehicles exempt from import taxes, hotel equipment/fixtures exempt at importation, VAT exempt on up-country tourist accommodation. Tourist arrivals: 1.5M+/year. Contact UTB: +256-414-342196.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-006',
    keywords: ['ICT', 'technology', 'software', 'IT', 'innovation', 'digital'],
    question: 'What are the opportunities in Uganda\'s ICT sector?',
    answer: 'ICT is Uganda\'s fastest-growing sector. Key bankable project: IT/BPO Park — USD 200M investment on 17 acres in Kampala, designed to shift Uganda from raw material-based to knowledge-based economy. Supported by NITA-U. Contact: Michael Newman Byamugisha at michael.byamugisha@nita.go.ug (+256 781 112 177). Other opportunities: (1) Software development & BPO services, (2) Mobile app development (fintech, e-health, agriculture), (3) Data centers and cloud services, (4) E-commerce platforms, (5) Digital payment systems. Market size: USD 2.5B, growing 12%/year. Government supports digital transformation through NDP III. Contact UCC: +256-414-339000.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-007',
    keywords: ['manufacturing', 'factory', 'production', 'industry', 'industrial'],
    question: 'What manufacturing opportunities are available in Uganda?',
    answer: 'Manufacturing offers regional market access (EAC, COMESA): (1) Pharmaceutical production, (2) Textiles & garments, (3) Food processing & packaging, (4) Plastics & packaging materials, (5) Construction materials (steel, cement, tiles), (6) Furniture & wood products. Labor cost: USD 80-150/month. Industrial parks: Namanve (Kampala), Luzira, Mbale, Soroti. Incentives: 5-year tax holiday. Min investment: USD 500,000. Contact +256-414-301000',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-008',
    keywords: ['mining', 'minerals', 'gold', 'cobalt', 'extractive'],
    question: 'What mining and mineral opportunities exist in Uganda?',
    answer: 'Uganda has vast mineral resources with 3 major bankable projects: (1) Moroto Integrated Cement, Lime & Marble Factory — USD 105.5M, contact Adam Mutebi at amutebi@ugandainvest.go.ug; (2) Sheet Glass Manufacturing Factory in Masaka — USD 44.6M, utilizing abundant silica sand on Lake Victoria shores, first-of-its-kind in Uganda; (3) Iron & Steel Manufacturing Factory in Mbarara — USD 53M by GLISCO, 75,000MT steel smelting + 150,000MT sponge iron + 250,000MT wire rods, mining lease in Kisoro with hematite ore (Fe 80%+). Other minerals: Gold (Karamoja, Busia), Cobalt/Copper/Tungsten (Kasese), Limestone/Marble (Eastern). Royalty: 5% metallic minerals. Contact MEMD: +256-414-707000.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-009',
    keywords: ['energy', 'power', 'electricity', 'renewable', 'solar', 'hydro'],
    question: 'What are the investment opportunities in Uganda\'s energy sector?',
    answer: 'Uganda\'s energy sector has 3 bankable projects: (1) Pilot 10MWp Floating Solar Plant on Isimba Reservoir — USD 15M, 14,208 PV modules, 17,050 MWh/year, contact Suzanne Akware at sakware@ugandainvest.go.ug; (2) 7.26MW Okulacere Small Hydro Power Plant in Yumbe — USD 36M, 2 Francis turbines, 24.7GWh/year, feasibility by Tractebel (AFD grant); (3) 1MW Maziba Mini Hydro in Kabale — USD 10M rehabilitation. Contact: David K. Isingoma at david.isingoma@uegcl.go.ug (+256 312 372 165). Government targets: expand electricity access from 57% to 80% by 2030. Feed-in tariffs available for grid-connected renewable projects. Contact ERA: +256-417-101800.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-010',
    keywords: ['work permit', 'visa', 'foreign worker', 'expatriate', 'permit', 'work visa', 'immigration'],
    question: 'How do I obtain a work permit in Uganda?',
    answer: 'Foreign investors and employees need work permits. Apply through UIA One-Stop Centre: (1) Class A: Investors with USD 100,000+ capital (2 years), (2) Class B: Self-employed professionals (2 years), (3) Class C: Employees with special skills/qualifications (2 years). Requirements: Valid passport, UIA license, employment contract, academic qualifications, police clearance. Fee: USD 2,000. Processing: 2-4 weeks. Contact +256-414-301000',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-011',
    keywords: ['industrial park', 'free zone', 'special economic zone', 'Namanve'],
    question: 'What industrial parks and free zones are available in Uganda?',
    answer: 'Uganda has 11 operational industrial parks with more under development. Key parks include: (1) Namanve Industrial & Business Park (Kampala area), (2) Kampala Industrial Park (Luzira), (3) Mbale Industrial Park, (4) Soroti Industrial Park, (5) Jinja Industrial Park, (6) Kasese Industrial Park, (7) Liao Shen Industrial Park, (8) Kapeeka Industrial Park, (9) Bweyogerere Industrial Zone, (10) Iganga Industrial Park, (11) Mbarara Industrial Park. Benefits: Ready infrastructure (power, water, roads), 10-year tax holiday on income from letting facilities, streamlined approvals, competitive land lease rates. Government secures land for industrial development and provides policy advocacy. Contact UIA: +256-414-301000.',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-012',
    keywords: ['contact', 'UIA', 'address', 'location', 'telephone', 'email', 'phone', 'call', 'reach', 'hours', 'office'],
    question: 'How can I contact Uganda Investment Authority?',
    answer: 'Uganda Investment Authority (UIA) One-Stop Centre: Address - Twed Plaza, Plot 22B Lumumba Avenue, Nakasero, Kampala. Tel: +256-414-301000, +256-417-118000. Email: info@ugandainvest.go.ug. Website: www.ugandainvest.go.ug. Working Hours: Monday-Friday 8:00AM-5:00PM, Saturday 9:00AM-1:00PM. Director General: Mr. Robert Mukiza. Tel: +256-414-301000.',
    category: 'general',
    language: 'en'
  },
  {
    id: 'kb-013',
    keywords: ['land', 'property', 'lease', 'freehold', 'acquire land'],
    question: 'How do foreign investors acquire land in Uganda?',
    answer: 'Foreign investors can acquire land through: (1) Leasehold (49-99 years) - most common for investors, (2) Customary land with consent from local authorities, (3) Government allocation in industrial parks. Process: (a) Land search at Ministry of Lands, (b) Valuation report, (c) Agreements & consent forms, (d) Registration at Land Registry. Costs: USD 2,000-10,000/acre (varies by location). Foreign nationals cannot own freehold land. Contact Ministry of Lands: +256-414-251190',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-014',
    keywords: ['environmental', 'EIA', 'NEMA', 'environment', 'approval'],
    question: 'What environmental requirements must investors meet?',
    answer: 'All projects require National Environment Management Authority (NEMA) approval: (1) Projects with significant impact need full Environmental Impact Assessment (EIA), (2) Medium projects need Environmental Audit, (3) Small projects need Environmental Statement. Sectors requiring EIA: mining, manufacturing, tourism facilities, agriculture (large-scale). Fee: USD 500-5,000 based on project size. Processing: 30-90 days. Contact NEMA: +256-414-251064 or info@nema.go.ug',
    category: 'licensing',
    language: 'en'
  },
  {
    id: 'kb-015',
    keywords: ['bank', 'finance', 'loan', 'funding', 'capital'],
    question: 'What financing options are available for investors in Uganda?',
    answer: 'Multiple financing sources in Uganda: (1) Commercial banks (Stanbic, DFCU, Standard Chartered) - loans at 16-20%, (2) Development Bank of Uganda (DBU) - project finance at 12-14%, (3) Uganda Development Corporation (UDC) - equity participation, (4) Africa Development Bank (AfDB) - large projects USD 10M+, (5) Private equity funds (Norfund, Actis). Collateral typically required: 120-150% of loan value. Contact UIA Investment Advisory: +256-414-301000',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-016',
    keywords: ['standards', 'quality', 'UNBS', 'certification', 'product'],
    question: 'What product standards and certifications are required?',
    answer: 'Uganda National Bureau of Standards (UNBS) enforces quality standards: (1) Product certification for all manufactured/imported goods, (2) Compliance with EAC standards, (3) Halal certification (for food/pharma), (4) ISO certifications (ISO 9001, 14001). Mandatory for: food products, pharmaceuticals, construction materials, electrical goods. Fees: USD 500-3,000. Testing facilities available. Contact UNBS: +256-414-505995 or info@unbs.go.ug',
    category: 'licensing',
    language: 'en'
  },
  {
    id: 'kb-017',
    keywords: ['export', 'trade', 'regional', 'EAC', 'COMESA', 'market access'],
    question: 'What regional market access does Uganda offer?',
    answer: 'Uganda provides strategic market access: (1) East African Community (EAC) - 178M people, zero tariffs (Kenya, Tanzania, Rwanda, Burundi, South Sudan), (2) COMESA - 600M people, reduced tariffs, (3) AfCFTA - 1.3B people across Africa. Export incentives: Zero-rating on exports, tax credit for exporters. Major export markets: Kenya, South Sudan, DRC, Rwanda. Processing: Certificate of Origin via URA. Contact Uganda Export Promotion Board: +256-414-230250',
    category: 'incentives',
    language: 'en'
  },
  {
    id: 'kb-018',
    keywords: ['tax', 'TIN', 'VAT', 'registration', 'URA', 'revenue'],
    question: 'How do I register for tax in Uganda?',
    answer: 'Register with Uganda Revenue Authority (URA) for Taxpayer Identification Number (TIN): (1) Complete TIN application at www.ura.go.ug, (2) Submit business registration documents, (3) Proof of physical address, (4) Director/owner IDs. VAT registration mandatory if turnover exceeds UGX 150M/year. Corporate tax rate: 30%. VAT: 18%. Processing: Same day for TIN. Contact URA: +256-417-117000, Call Centre: 0800-117000 (toll-free) or ura@ura.go.ug',
    category: 'investment_procedures',
    language: 'en'
  },
  {
    id: 'kb-019',
    keywords: ['dispute', 'arbitration', 'investment protection', 'treaty', 'BIT'],
    question: 'How are investment disputes resolved in Uganda?',
    answer: 'Uganda has strong investor protection mechanisms: (1) Centre for Arbitration & Dispute Resolution (CADER) for local disputes, (2) International Centre for Settlement of Investment Disputes (ICSID) - Uganda is signatory, (3) Bilateral Investment Treaties (BITs) with 30+ countries, (4) Commercial Court for business disputes. Investment Act guarantees against expropriation. Average dispute resolution: 6-18 months. Contact CADER: +256-414-348827 or UIA Legal: +256-414-301000',
    category: 'general',
    language: 'en'
  },
  {
    id: 'kb-020',
    keywords: ['cost', 'investment', 'minimum', 'capital', 'requirement', 'how much'],
    question: 'What is the minimum investment required in Uganda?',
    answer: 'Minimum investment requirements: (1) Foreign investors: USD 100,000 (USD 50,000 for joint ventures with Ugandans), (2) Ugandan citizens: No minimum, (3) Priority sectors (agriculture, tourism): USD 500,000 for full incentive package, (4) Manufacturing in industrial parks: USD 1M+ for maximum benefits. No minimum for small businesses registered with URSB only. Cost of doing business is competitive: land USD 2,000-10,000/acre, labor USD 80-200/month. Contact UIA: +256-414-301000',
    category: 'general',
    language: 'en'
  },
  {
    id: 'kb-021',
    keywords: ['economy', 'GDP', 'growth', 'population', 'Uganda overview', 'why Uganda', 'invest Uganda'],
    question: 'Why should I invest in Uganda? What is the economic overview?',
    answer: 'Uganda\'s economy reached USD 61 billion GDP by end of 2024, with 6.3% GDP growth rate and 3.3% inflation. Population: 45.9 million (UBOS 2024), youngest in the world (average age 16.7 years, 75% under 30). Strategic location in East Africa with access to: EAC (300M people), COMESA (600M people), AfCFTA (1.3 billion people in 54 countries, combined GDP $3.4 trillion). Key advantages: 100% foreign ownership allowed, full profit repatriation, 2nd most biodiverse country in Africa, highest adult literacy in EAC (90% for ages 15-24). FDI inflow: USD 3.3 billion over last 5 FYs. Top FDI sources: France (37%), India (17%), China (17%). Medium-term GDP growth projected at 8-9%, reaching double-digit with oil & gas sector. Global recognitions: Best Investment Destination in Africa (AIM Abu Dhabi 2024), Greatest Investment Catalyst (Go Global Awards USA), 3rd most rewarding economy in Africa (Oxford Economics 2023). Contact UIA: +256-414-301000.',
    category: 'general',
    language: 'en'
  },
  {
    id: 'kb-022a',
    keywords: ['bankable', 'projects', 'opportunities', 'invest', 'PPP', 'UDC', 'greenfield', 'agriculture projects', 'tourism projects'],
    question: 'What are the bankable agriculture and tourism projects in Uganda?',
    answer: 'The UIA Bankable Projects Booklet 2025/2026 (7th Edition) features key projects: AGRICULTURE (5 projects): Luwero Fruit Factory $9.7M, Acholibur Cassava Processing $16.5M, Cocoa Processing Factory $24.3M, Lira Cotton Spinning Mill $44.34M, Soluble Coffee Processing $48.1M+$33.89M opex. TOURISM (5 projects): Mt Elgon Park Infrastructure $79M, Equator Points $8.7M, Geothermal Spas $23.9M, Nzururu Heights Hotel $40M, UWEC Infrastructure $15.6M. Most projects are PPP (Public-Private Partnership) type. Contact UIA: +256-414-301000 or info@ugandainvest.go.ug.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-022b',
    keywords: ['bankable', 'projects', 'minerals projects', 'energy projects', 'health projects', 'real estate', 'ICT projects'],
    question: 'What are the bankable minerals, energy, and other projects in Uganda?',
    answer: 'The UIA Bankable Projects Booklet 2025/2026 also features: MINERALS (3 projects): Moroto Cement/Lime/Marble $105.5M, Sheet Glass Factory $44.6M, Iron & Steel Factory $53M. ENERGY (3 projects): Floating Solar 10MWp $15M, Okulacere Hydro 7.26MW $36M, Maziba Mini Hydro 1MW $10M. HEALTH: East African Medical Vitals $18M. REAL ESTATE: Pearl Marina Estates $10-45M. ICT: IT/BPO Park $200M. Total: 22 high-impact projects across all sectors. Most are PPP type. Contact UIA: +256-414-301000 or info@ugandainvest.go.ug.',
    category: 'sectors',
    language: 'en'
  },
  {
    id: 'kb-023',
    keywords: ['awards', 'recognition', 'UIA awards', 'WAIPA', 'best investment', 'ranking'],
    question: 'What international awards and recognitions has Uganda received?',
    answer: 'Uganda and UIA have received numerous global recognitions: (1) Best Investment Destination in Africa — Annual Investment Meeting Awards, Abu Dhabi 2024; (2) 2nd Best Investment Promotion Agency in Africa — AIM Awards, Abu Dhabi 2025; (3) Best Investment Destination in East Africa — AIM Awards, Abu Dhabi 2023; (4) Award for Sustainability Investment Promotion — WAIPA Excellence Awards, Saudi Arabia 2024; (5) Greatest Investment Catalyst in the World — Go Global Awards, Rhode Island USA; (6) Prestigious Greenfield FDI Award — Go Global Awards 2025, London UK; (7) 3rd Most Rewarding Economy to Invest in Africa — Africa Risk Reward Index 2023, Oxford Economics; (8) Number 1 Happiest Country in East Africa — Happiness Index 2022; (9) Best Tourist Destination in the World — CNN 2023; (10) Number 1 Regional Leader in Capital Markets Growth — Absa Africa Financial Markets Index 2022. Contact UIA: +256-414-301000.',
    category: 'general',
    language: 'en'
  }
];
