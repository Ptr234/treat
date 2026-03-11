import { InvestmentEvent } from '@/types';

export const mockEvents: InvestmentEvent[] = [
  {
    id: 'evt-001',
    title: 'Uganda Investment Forum 2025',
    description: 'Uganda\'s premier annual investment showcase featuring international investors, government officials, and business leaders. Explore opportunities across agriculture, manufacturing, ICT, energy, and tourism sectors.',
    category: 'forum',
    date: '2025-05-15',
    endDate: '2025-05-16',
    time: '09:00',
    location: 'Serena Hotel, Kampala',
    isVirtual: false,
    registrationDeadline: '2025-05-10',
    capacity: 500,
    registered: 342,
    speakers: [
      {
        name: 'Dr. Chris Kassami',
        title: 'Executive Director',
        organization: 'Uganda Investment Authority',
        photoUrl: '/images/speakers/kassami.jpg'
      },
      {
        name: 'Hon. Evelyn Anite',
        title: 'Minister of State for Investment',
        organization: 'Ministry of Finance, Planning and Economic Development',
        photoUrl: '/images/speakers/anite.jpg'
      },
      {
        name: 'James Mwangi',
        title: 'CEO',
        organization: 'Equity Bank Group',
        photoUrl: '/images/speakers/mwangi.jpg'
      }
    ],
    resources: [
      {
        name: 'Investment Opportunities Brochure 2025',
        type: 'PDF',
        url: '/resources/investment-brochure-2025.pdf',
        size: '8.2 MB'
      },
      {
        name: 'Tax Incentives Guide',
        type: 'PDF',
        url: '/resources/tax-incentives.pdf',
        size: '2.5 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/investment-forum-2025.jpg',
    organizer: 'Uganda Investment Authority'
  },
  {
    id: 'evt-002',
    title: 'Presidential Investor Roundtable',
    description: 'High-level dialogue between H.E. President Yoweri Museveni and major international investors. Discuss policy reforms, investment climate, and strategic partnerships for large-scale investments (USD 50M+).',
    category: 'summit',
    date: '2025-03-20',
    time: '14:00',
    location: 'State House Entebbe',
    isVirtual: false,
    registrationDeadline: '2025-03-15',
    capacity: 50,
    registered: 47,
    speakers: [
      {
        name: 'H.E. Yoweri Kaguta Museveni',
        title: 'President',
        organization: 'Republic of Uganda',
        photoUrl: '/images/speakers/museveni.jpg'
      },
      {
        name: 'Hon. Matia Kasaija',
        title: 'Minister of Finance',
        organization: 'Ministry of Finance, Planning and Economic Development',
        photoUrl: '/images/speakers/kasaija.jpg'
      }
    ],
    resources: [
      {
        name: 'Presidential Investment Brief',
        type: 'PDF',
        url: '/resources/presidential-brief.pdf',
        size: '1.8 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/presidential-roundtable.jpg',
    organizer: 'Office of the President'
  },
  {
    id: 'evt-003',
    title: 'Agribusiness Investment Symposium',
    description: 'Focus on agricultural value chains, agro-processing, and export opportunities. Learn about tax incentives, land access, and market linkages. Sectors: coffee, fruits, dairy, grains, horticulture.',
    category: 'symposium',
    date: '2025-04-08',
    endDate: '2025-04-09',
    time: '08:30',
    location: 'Speke Resort Munyonyo, Kampala',
    isVirtual: false,
    registrationDeadline: '2025-04-03',
    capacity: 300,
    registered: 178,
    speakers: [
      {
        name: 'Hon. Frank Tumwebaze',
        title: 'Minister of Agriculture',
        organization: 'Ministry of Agriculture, Animal Industry and Fisheries',
        photoUrl: '/images/speakers/tumwebaze.jpg'
      },
      {
        name: 'Dr. Sarah Nalukwago',
        title: 'Director General',
        organization: 'Uganda Coffee Development Authority',
        photoUrl: '/images/speakers/nalukwago.jpg'
      },
      {
        name: 'James Odera',
        title: 'Regional Investment Manager',
        organization: 'African Development Bank',
        photoUrl: '/images/speakers/odera.jpg'
      }
    ],
    resources: [
      {
        name: 'Agricultural Investment Guide',
        type: 'PDF',
        url: '/resources/agriculture-guide.pdf',
        size: '12.4 MB'
      },
      {
        name: 'Land Availability Map',
        type: 'PDF',
        url: '/resources/land-map.pdf',
        size: '5.7 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/agribusiness-symposium.jpg',
    organizer: 'Ministry of Agriculture & UIA'
  },
  {
    id: 'evt-004',
    title: 'East African Community Investment Summit',
    description: 'Regional investment summit bringing together EAC member states (Uganda, Kenya, Tanzania, Rwanda, Burundi, South Sudan). Focus on cross-border investments, regional value chains, and AfCFTA opportunities.',
    category: 'summit',
    date: '2025-06-12',
    endDate: '2025-06-13',
    time: '09:00',
    location: 'Munyonyo Commonwealth Resort, Kampala',
    isVirtual: false,
    registrationDeadline: '2025-06-05',
    capacity: 600,
    registered: 412,
    speakers: [
      {
        name: 'Peter Mathuki',
        title: 'Secretary General',
        organization: 'East African Community',
        photoUrl: '/images/speakers/mathuki.jpg'
      },
      {
        name: 'Betty Maina',
        title: 'Cabinet Secretary for Investment',
        organization: 'Republic of Kenya',
        photoUrl: '/images/speakers/maina.jpg'
      }
    ],
    resources: [
      {
        name: 'EAC Common Market Protocol',
        type: 'PDF',
        url: '/resources/eac-protocol.pdf',
        size: '3.2 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/eac-summit.jpg',
    organizer: 'East African Community Secretariat & UIA'
  },
  {
    id: 'evt-005',
    title: 'Weekly Investor Webinar Series',
    description: 'Every Tuesday: Virtual Q&A sessions covering investment procedures, licensing, tax incentives, and sector opportunities. Get direct answers from UIA investment officers and agency representatives.',
    category: 'webinar',
    date: '2025-02-18',
    time: '15:00',
    location: 'Virtual Event',
    isVirtual: true,
    virtualLink: 'https://zoom.us/j/ugandainvest',
    registrationDeadline: '2025-02-18',
    capacity: 200,
    registered: 89,
    speakers: [
      {
        name: 'Moses Kaggwa',
        title: 'Manager, Investment Promotion',
        organization: 'Uganda Investment Authority',
        photoUrl: '/images/speakers/kaggwa.jpg'
      }
    ],
    resources: [
      {
        name: 'Quick Start Investment Guide',
        type: 'PDF',
        url: '/resources/quick-start-guide.pdf',
        size: '1.2 MB'
      }
    ],
    status: 'ongoing',
    imageUrl: '/images/events/webinar-series.jpg',
    organizer: 'Uganda Investment Authority'
  },
  {
    id: 'evt-006',
    title: 'Uganda Mining & Natural Resources Conference',
    description: 'Explore Uganda\'s vast mineral wealth: gold, cobalt, copper, iron ore, limestone, rare earths. Learn about licensing procedures, environmental compliance, and investment incentives for extractive industries.',
    category: 'forum',
    date: '2025-07-22',
    endDate: '2025-07-23',
    time: '08:00',
    location: 'Sheraton Kampala Hotel',
    isVirtual: false,
    registrationDeadline: '2025-07-15',
    capacity: 250,
    registered: 134,
    speakers: [
      {
        name: 'Eng. Dr. Solomon Muyita',
        title: 'Commissioner',
        organization: 'Directorate of Geological Survey and Mines',
        photoUrl: '/images/speakers/muyita.jpg'
      },
      {
        name: 'Peter Lokeris',
        title: 'Minister of State for Minerals',
        organization: 'Ministry of Energy and Mineral Development',
        photoUrl: '/images/speakers/lokeris.jpg'
      }
    ],
    resources: [
      {
        name: 'Uganda Mineral Resource Atlas',
        type: 'PDF',
        url: '/resources/mineral-atlas.pdf',
        size: '18.6 MB'
      },
      {
        name: 'Mining License Application Guide',
        type: 'PDF',
        url: '/resources/mining-license-guide.pdf',
        size: '2.1 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/mining-conference.jpg',
    organizer: 'Ministry of Energy & Mineral Development'
  },
  {
    id: 'evt-007',
    title: 'ICT Innovation & Digital Economy Expo',
    description: 'Showcase Uganda\'s growing digital economy. Focus on fintech, health tech, agri-tech, e-commerce, BPO services, and software development. Meet startups, tech hubs, and investment opportunities in Uganda\'s innovation ecosystem.',
    category: 'forum',
    date: '2025-08-14',
    endDate: '2025-08-15',
    time: '10:00',
    location: 'Kampala Serena Conference Centre',
    isVirtual: false,
    registrationDeadline: '2025-08-10',
    capacity: 400,
    registered: 267,
    speakers: [
      {
        name: 'Dr. Aminah Zawedde',
        title: 'Executive Director',
        organization: 'Uganda Communications Commission',
        photoUrl: '/images/speakers/zawedde.jpg'
      },
      {
        name: 'Isaac Oboth',
        title: 'Managing Director',
        organization: 'Outbox Hub',
        photoUrl: '/images/speakers/oboth.jpg'
      },
      {
        name: 'Barbara Birungi',
        title: 'Country Director',
        organization: 'Hive Colab',
        photoUrl: '/images/speakers/birungi.jpg'
      }
    ],
    resources: [
      {
        name: 'Digital Economy Strategy 2025-2030',
        type: 'PDF',
        url: '/resources/digital-strategy.pdf',
        size: '4.8 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/ict-expo.jpg',
    organizer: 'Uganda Communications Commission & UIA'
  },
  {
    id: 'evt-008',
    title: 'Industrial Parks & Free Zones Tour',
    description: 'Guided site visits to Namanve Industrial Park, Kampala Industrial & Business Park (Luzira), and Bweyogerere Industrial Zone. See available plots, infrastructure, and meet current investors. Transport provided.',
    category: 'mission',
    date: '2025-03-28',
    time: '07:30',
    location: 'Depart from UIA Office, Twed Plaza',
    isVirtual: false,
    registrationDeadline: '2025-03-25',
    capacity: 40,
    registered: 38,
    speakers: [
      {
        name: 'Patrick Kawuma',
        title: 'Manager, Industrial Parks Development',
        organization: 'Uganda Investment Authority',
        photoUrl: '/images/speakers/kawuma.jpg'
      }
    ],
    resources: [
      {
        name: 'Industrial Parks Profile',
        type: 'PDF',
        url: '/resources/industrial-parks.pdf',
        size: '6.3 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/industrial-tour.jpg',
    organizer: 'Uganda Investment Authority'
  },
  {
    id: 'evt-009',
    title: 'Uganda Diaspora Investment Mission',
    description: 'Connect Ugandans in the diaspora with investment opportunities back home. Focus on real estate, agribusiness, education, healthcare, and manufacturing. Network with government officials and local partners.',
    category: 'mission',
    date: '2025-09-05',
    endDate: '2025-09-07',
    time: '09:00',
    location: 'Hotel Africana, Kampala',
    isVirtual: false,
    registrationDeadline: '2025-08-30',
    capacity: 200,
    registered: 156,
    speakers: [
      {
        name: 'Hon. Joyce Ssebugwawo',
        title: 'Minister of State for Diaspora Affairs',
        organization: 'Ministry of Foreign Affairs',
        photoUrl: '/images/speakers/ssebugwawo.jpg'
      },
      {
        name: 'Dr. Chris Kassami',
        title: 'Executive Director',
        organization: 'Uganda Investment Authority',
        photoUrl: '/images/speakers/kassami.jpg'
      }
    ],
    resources: [
      {
        name: 'Diaspora Investment Guide',
        type: 'PDF',
        url: '/resources/diaspora-guide.pdf',
        size: '3.7 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/diaspora-mission.jpg',
    organizer: 'Ministry of Foreign Affairs & UIA'
  },
  {
    id: 'evt-010',
    title: 'African Continental Free Trade Area (AfCFTA) Forum',
    description: 'Understand how AfCFTA opens up a market of 1.3 billion people across 54 African countries. Learn about rules of origin, tariff schedules, and how to position Uganda as your manufacturing hub for Africa.',
    category: 'forum',
    date: '2025-10-10',
    time: '09:00',
    location: 'Kampala Serena Hotel',
    isVirtual: false,
    registrationDeadline: '2025-10-05',
    capacity: 350,
    registered: 198,
    speakers: [
      {
        name: 'Wamkele Mene',
        title: 'Secretary General',
        organization: 'AfCFTA Secretariat',
        photoUrl: '/images/speakers/mene.jpg'
      },
      {
        name: 'David Wakuba',
        title: 'AfCFTA National Coordinator',
        organization: 'Ministry of Trade, Industry and Cooperatives',
        photoUrl: '/images/speakers/wakuba.jpg'
      }
    ],
    resources: [
      {
        name: 'AfCFTA Investment Opportunities',
        type: 'PDF',
        url: '/resources/afcfta-opportunities.pdf',
        size: '5.2 MB'
      },
      {
        name: 'Rules of Origin Handbook',
        type: 'PDF',
        url: '/resources/rules-of-origin.pdf',
        size: '2.9 MB'
      }
    ],
    status: 'upcoming',
    imageUrl: '/images/events/afcfta-forum.jpg',
    organizer: 'Ministry of Trade & UIA'
  }
];
