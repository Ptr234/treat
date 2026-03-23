
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
    description: 'The principal government agency responsible for promoting, facilitating and monitoring investment in Uganda.',
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
    description: 'Responsible for business registration, company formation and intellectual property registration.',
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
    description: 'Responsible for tax administration and collection in Uganda.',
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
    description: 'Local government authority for Kampala city administration and services.',
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
    description: 'Responsible for managing migration to and from Uganda.',
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
    description: 'Responsible for environmental management and protection in Uganda.',
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
    description: 'Responsible for standards development, conformity assessment and quality assurance.',
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
    description: 'Responsible for land management, housing and urban development.',
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
    description: 'A National Saving Scheme mandated by Government through the NSSF Act.',
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
    description: 'A statutory body responsible for promoting, developing and regulating the capital markets industry in Uganda.',
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
    description: "Uganda's main electricity distribution company.",
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
    description: 'Provides water and sewerage services in urban areas of Uganda.',
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
    description: 'The official tourism promotion agency of Uganda.',
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
    description: 'Manages and promotes free zones for industrial and commercial development.',
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
    description: 'The voice of employers in Uganda on all social and economic policy issues.',
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
    description: 'An initiative of Space for Giants, that unites visionary leaders of African states with philanthropists, and scientists to protect Africa’s remaining wildernesses.',
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
