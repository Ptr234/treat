
export interface AgencyContact {
  id: string;
  name: string;
  acronym: string;
  description: string;
  services: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
    address: string;
  };
  logo: string;
  category: 'investment' | 'registration' | 'taxation' | 'environment' | 'standards' | 'infrastructure' | 'immigration' | 'lands' | 'social_security' | 'finance' | 'tourism' | 'employers' | 'conservation';
  hasAppointmentBooking: boolean;
  operatingHours: string;
  urgencyLevel: 'high' | 'medium' | 'low';
}

export const ugandaAgencies: AgencyContact[] = [
  {
    id: 'uia',
    name: 'Uganda Investment Authority',
    acronym: 'UIA',
    description: 'The Uganda Investment Authority is the principal government agency responsible for promoting, facilitating and monitoring investment in Uganda. It licenses investment projects and provides coordination and advisory services to both domestic and foreign investors. It also promotes Uganda as an investment destination and runs monitoring, evaluation and aftercare services once projects are operating. Investors who are unsure where to start usually begin here, as it is the single point of contact for most investment questions.',
    services: [
      'Promoting Uganda as Investment destination of choice',
      'Investment Licensing, Facilitation, Coordination and Advisory Services',
      'Investment Promotion and Facilitation for both Domestic and Foreign Investors for increased inflows',
      'Monitoring, Evaluation and Aftercare services'
    ],
    contact: {
      email: 'info@ugandainvestment.go.ug',
      phone: '+256414301000',
      website: 'https://www.ugandainvestment.go.ug',
      address: 'Plot 28 Kampala Road, UIA House, P.O. Box 7418, Kampala'
    },
    logo: '/images/logos/UIA logo.png',
    category: 'investment',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'high'
  },
  {
    id: 'ursb',
    name: 'Uganda Registration Services Bureau',
    acronym: 'URSB',
    description: 'The Uganda Registration Services Bureau handles business registration, company formation and intellectual property registration. Entrepreneurs can reserve a company or business name before registering, then file the forms needed to form a new company. The Bureau also processes business name registrations for sole traders and partnerships. Registration here is usually the first legal step for a business that wants to trade in Uganda.',
    services: [
      'Reservation of business or company name',
      'Registration of a new company',
      'Processing and registration of company forms',
      'Business Name Registration'
    ],
    contact: {
      email: 'ursb@ursb.go.ug',
      phone: '+256414235915',
      website: 'https://ursb.go.ug',
      address: 'Uganda Business Facilitation Centre Plot 1 Baskerville Avenue, Kololo, P.O. Box 6848, Kampala'
    },
    logo: '/images/logos/URSB logo.png',
    category: 'registration',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'high'
  },
  {
    id: 'ura',
    name: 'Uganda Revenue Authority',
    acronym: 'URA',
    description: 'The Uganda Revenue Authority administers and collects taxes in Uganda. It issues Tax Identification Numbers (TINs) for individuals and non-individuals, which businesses need before most dealings with government. The Authority also provides tax information, advisory services and guidance on tax incentives under their stated terms and conditions. Investors should confirm their tax position with URA before committing to a project.',
    services: [
      'Tax Incentives based on terms and conditions',
      'Tax information',
      'Issuance of TIN for individuals and non-individuals',
      'Tax Advisory and related services'
    ],
    contact: {
      email: 'info@ura.go.ug',
      phone: '+256417444602',
      website: 'https://ura.go.ug',
      address: 'URA Headquarters, Plot M193/M194, Nakawa Industrial Area, P.O. Box 7279, Kampala'
    },
    logo: '/images/logos/URA logo.png',
    category: 'taxation',
    hasAppointmentBooking: false,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'high'
  },
  {
    id: 'kcca',
    name: 'Kampala Capital City Authority',
    acronym: 'KCCA',
    description: 'The Kampala Capital City Authority is the local government body that administers Kampala, the country\'s capital and main commercial centre. It manages city services and the local administration that affects businesses operating within the city. Companies planning to set up or expand in Kampala should check with the Authority on local requirements for their site. Its role is distinct from national agencies, so it is often consulted alongside them.',
    services: [
        'Application for City Operators Identification Number (COIN)',
        'Application and processing of Trading License'
    ],
    contact: {
      email: 'info@kcca.go.ug',
      phone: '+256312900000',
      website: 'https://kcca.go.ug',
      address: 'City Hall, Plot 1-3, Apollo Kaggwa Road, P.O. Box 7010, Kampala'
    },
    logo: '/images/logos/kcca.png',
    category: 'registration',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'dcic',
    name: 'Directorate of Citizenship and Immigration Control',
    acronym: 'DCIC',
    description: 'The Directorate of Citizenship and Immigration Control manages migration into and out of Uganda. It is responsible for citizenship matters and the control of immigration, including the entry and status of foreign nationals. Investors and expatriate staff who need work or residence permits will deal with this Directorate. Early engagement helps avoid delays in bringing key personnel into a project.',
    services: [
        'Processing and Issuance of organization code',
        'Processing and Issuance of work permits',
        'Processing and Issuance of special passes',
        'Processing and Issuance of dependent pass',
        'Issuance of certificate of residence',
        'Processing and Issuance of student pass',
        'Processing and approval of Uganda visa',
        'Advisory services'
    ],
    contact: {
      email: 'info@immigration.go.ug',
      phone: '+256414595945',
      website: 'https://www.immigration.go.ug',
      address: 'Plot 75 Jinja Road, P.O. Box 7165, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'immigration',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'high'
  },
  {
    id: 'nema',
    name: 'National Environment Management Authority',
    acronym: 'NEMA',
    description: 'The National Environment Management Authority is responsible for environmental management and protection in Uganda. It gives technical guidance on the permits and licences a project needs and on the Environmental and Social Impact Assessment (ESIA) certificate. The Authority also carries out environmental monitoring, inspections and compliance audits. Most investment projects that affect land, water or emissions must engage with NEMA before construction begins.',
    services: [
      'Technical guidance on obtaining relevant permits and licenses',
      'Technical guidance on obtaining certificate of approval of Environmental and Social Impact Assessment (ESIA)',
      'Undertake and coordinate environmental monitoring, inspections and compliance audits',
      'Advisory services regarding environmental regulations and requirements',
      'Undertake public environmental awareness and literacy'
    ],
    contact: {
      email: 'info@nema.go.ug',
      phone: '+256414425068',
      website: 'https://nema.go.ug',
      address: 'NEMA House Plot 17/19/21 Jinja Road, P.O. Box 222, Kampala'
    },
    logo: '/images/logos/NEMA.png',
    category: 'environment',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'unbs',
    name: 'Uganda National Bureau of Standards',
    acronym: 'UNBS',
    description: 'The Uganda National Bureau of Standards develops national standards and assesses whether products and services conform to them. It runs quality assurance programmes that help businesses meet the requirements for their products to be sold. Manufacturers and exporters use the Bureau to certify conformity before entering domestic or regional markets. Engaging early with standards requirements avoids costly redesign later in production.',
    services: [
        'Application for product certification',
        'Guide to submitting sample products for testing',
        'Guidance to Import inspection and clearance'
    ],
    contact: {
      email: 'info@unbs.go.ug',
      phone: '+256414333250',
      website: 'https://www.unbs.go.ug',
      address: 'Plot 2-12 Bypass Link, Industrial Area, P.O. Box 6329, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'standards',
    hasAppointmentBooking: false,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'mlhud',
    name: 'Ministry of Lands, Housing and Urban Development',
    acronym: 'MLHUD',
    description: 'The Ministry of Lands, Housing and Urban Development is responsible for land management, housing and urban development in Uganda. It oversees land titles, land use and planning that determine where investments can be sited. Projects involving land acquisition or large developments need the Ministry\'s approvals and clearances. Investors should verify land title and planning status before committing funds to a site.',
    services: [
        'Verification of land titles',
        'Advisory on land acquisition',
        'Tracking transaction status'
    ],
    contact: {
      email: 'info@mlhud.go.ug',
      phone: '+256414230876',
      website: 'https://www.mlhud.go.ug',
      address: 'Plot 13-15 Parliament Avenue, P.O. Box 7096, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'lands',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'nssf',
    name: 'National Social Security Fund',
    acronym: 'NSSF',
    description: 'The National Social Security Fund is a national savings scheme mandated by Government through the NSSF Act. Employers register their staff and remit contributions on their behalf, which builds retirement savings for workers. The Fund is an obligation for most formal employers, so payroll compliance is part of setting up a business. Investors should factor these contributions into staffing costs and payroll planning.',
    services: [
        'Employee / Employer Registration',
        'Clearance Certificate application',
        'Information on Investment products (Real Estate, etc.)',
        'General information about NSSF services (Claims, Contributions, Smart Life for private sector)'
    ],
    contact: {
      email: 'customerservice@nssfug.org',
      phone: '+256414316000',
      website: 'https://www.nssfug.org',
      address: 'Plot 1 Pilkington Road, Workers House, P.O. Box 7140, Kampala'
    },
    logo: '/images/logos/NSSF logo.png',
    category: 'social_security',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'cma',
    name: 'Capital Markets Authority',
    acronym: 'CMA',
    description: 'The Capital Markets Authority is a statutory body that promotes, develops and regulates the capital markets industry in Uganda. It oversees securities markets, the firms that operate in them and the protection of investors who buy and sell securities. Companies considering a listing or a public share offer must meet the Authority\'s requirements. The Authority is a key reference for investors seeking to raise capital through the local market.',
    services: [
        'Investing in Capital Markets',
        'Licensing requirements',
        'Facilitating businesses with capital raising options in the capital markets',
        'Providing info on participation in the capital markets'
    ],
    contact: {
      email: 'info@cmauganda.co.ug',
      phone: '+256414342788',
      website: 'https://cmauganda.co.ug',
      address: 'Plot 8 George Street, Georgian House, P.O. Box 24565, Kampala'
    },
    logo: '/images/logos/CMA logo.png',
    category: 'finance',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'umeme',
    name: 'UMEME',
    acronym: 'UMEME',
    description: 'UMEME is Uganda\'s main electricity distribution company, supplying power to homes, businesses and industry across the country. Industrial and commercial projects must agree a grid connection and supply arrangement with the company. Reliable power is a major operating cost for many investments, so connection timelines should be planned early. Businesses should confirm connection, metering and tariff arrangements directly with UMEME.',
    services: [
        'Site inspection',
        'Connection/reconnection',
        'Resolution of technical complaints',
        'Replacement of faults',
        'Notification of planned shutdowns'
    ],
    contact: {
      email: 'customercare@umeme.co.ug',
      phone: '+256312360600',
      website: 'https://www.umeme.co.ug',
      address: 'Plot 5-9, 6th Street, Industrial Area, P.O. Box 23841, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'infrastructure',
    hasAppointmentBooking: false,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'low'
  },
  {
    id: 'nwsc',
    name: 'National Water and Sewerage Corporation',
    acronym: 'NWSC',
    description: 'The National Water and Sewerage Corporation provides water and sewerage services in urban areas of Uganda. It processes applications for industrial water connections and advises on the requirements for water and sewerage services. Customers can report faults and receive notice of planned interruptions that might affect operations. Factories and hotels should secure their water supply with the Corporation before commissioning.',
    services: [
      'Application and processing of Industrial water connections',
      'Faults resolutions',
      'Notification of planned interruptions',
      'Advisory on water and sewerage services requirements'
    ],
    contact: {
      email: 'info@nwsc.co.ug',
      phone: '+256414315000',
      website: 'https://www.nwsc.co.ug',
      address: 'Plot 3 & 5 Jinja Road, NWSC House, P.O. Box 7053, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'infrastructure',
    hasAppointmentBooking: false,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'low'
  },
  {
    id: 'utb',
    name: 'Uganda Tourism Board',
    acronym: 'UTB',
    description: 'The Uganda Tourism Board is the official tourism promotion agency of Uganda. It markets Uganda as a destination to international visitors and supports the wider tourism sector. Investors in hotels, lodges and attractions can work with the Board on promotion and marketing support. The Board\'s promotion of destinations such as the national parks directly supports demand for new tourism investments.',
    services: [
        'Provide Information on Tourism Investment Opportunities in Uganda',
        'Registration of Tourism Establishment in Uganda',
        'Provide Information on Licensing, Classification and Grading of Tourism Establishment',
        'Provide Tourism Sector Advisory Services in Uganda'
    ],
    contact: {
      email: 'info@utb.go.ug',
      phone: '+256414342196',
      website: 'https://www.utb.go.ug',
      address: 'Plot 42, Windsor Crescent, Kololo, P.O. Box 7211, Kampala'
    },
    logo: '/images/logos/UTB.png',
    category: 'tourism',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'ufza',
    name: 'Uganda Free Zones Authority',
    acronym: 'UFZA',
    description: 'The Uganda Free Zones Authority manages and promotes free zones for industrial and commercial development. It issues free zone licences, which allow qualifying businesses to operate under the Authority\'s special arrangements. Free zones are designed to attract export-oriented manufacturing and commercial activity. Companies that plan to export or import large volumes of goods should assess whether a free zone licence suits their model.',
    services: [
      'Issuance of free zones licenses'
    ],
    contact: {
      email: 'info@ufza.go.ug',
      phone: '+256414234567',
      website: 'https://www.ufza.go.ug',
      address: 'Plot 14 Colville Street, Workers House, P.O. Box 12345, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'investment',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'fue',
    name: 'Federation of Uganda Employers',
    acronym: 'FUE',
    description: 'The Federation of Uganda Employers represents employers in Uganda on social and economic policy issues. It engages government and other stakeholders on matters that affect the business environment, such as labour and productivity. Member employers receive advocacy, information and advice on workforce policy. Investors who want to understand the employer perspective on policy can use the Federation as a key point of contact.',
    services: [
        'Employment relations and legal services',
        'Research, policy & advocacy – as per ILO mandate',
        'Business support services',
        'Employer representation before labor administration and industrial court'
    ],
    contact: {
      email: 'fue@fue.or.ug',
      phone: '+256414220201',
      website: 'https://www.fue.or.ug',
      address: 'Plot 10, Onetii Road, Kololo, P.O. Box 3820, Kampala'
    },
    logo: '/images/logos/default-agency.png',
    category: 'employers',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'medium'
  },
  {
    id: 'the-giants-club',
    name: 'The Giants Club',
    acronym: 'The Giants Club',
    description: 'The Giants Club is an initiative of Space for Giants that brings together visionary leaders of African states, philanthropists and scientists. Its purpose is to protect Africa\'s remaining wildernesses and the large species that depend on them. The Club links conservation goals with government leadership and private funding. Investors in conservation, eco-tourism and wildlife-related projects can engage with the Club as a partner.',
    services: [
        'Information on Tourism investment opportunities',
        'Promotion of conservation projects',
        'International Media and public relations services'
    ],
    contact: {
      email: 'info@spaceforgiants.org',
      phone: '+254720779598',
      website: 'https://www.giantsclub.org',
      address: 'PO Box 243, Nanyuki, 10400, Kenya'
    },
    logo: '/images/logos/default-agency.png',
    category: 'conservation',
    hasAppointmentBooking: true,
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    urgencyLevel: 'low'
  }
];

export const getAgencyByCategory = (category: AgencyContact['category']) => {
  return ugandaAgencies.filter(agency => agency.category === category);
};

export const getAgencyById = (id: string) => {
  return ugandaAgencies.find(agency => agency.id === id);
};

export const getUrgentAgencies = () => {
  return ugandaAgencies.filter(agency => agency.urgencyLevel === 'high');
};
