// Centralized Contact Database for Uganda Government Agencies
// Provides consistent contact information across investment opportunities

import { ContactInfo } from '../../types';

export const CONTACT_DATABASE: Record<string, ContactInfo> = {
  // Agriculture & Environment
  MAAIF: {
    agency: 'Ministry of Agriculture, Animal Industry and Fisheries (MAAIF)',
    email: 'info@agriculture.go.ug',
    phone: '+256 414 320004',
    website: 'https://www.agriculture.go.ug',
    address: 'Plot 1, Entebbe Road, Wandegeya, Kampala',
    director: 'Hon. Frank Tumwebaze'
  },
  UCDA: {
    agency: 'Uganda Coffee Development Authority (UCDA)',
    email: 'info@ugandacoffee.go.ug',
    phone: '+256 414 256940',
    website: 'https://ugandacoffee.go.ug',
    address: 'Coffee House, Plot 35, Jinja Road, Kampala',
    director: 'Emmanuel Iyamulemye Niyibigira'
  },
  NARO: {
    agency: 'National Agricultural Research Organisation (NARO)',
    email: 'info@naro.go.ug',
    phone: '+256 414 567 570',
    website: 'https://www.naro.go.ug',
    address: 'Plot 295, Lugard Avenue, Entebbe',
    director: 'Dr. Yona Baguma'
  },
  MWE: {
    agency: 'Ministry of Water and Environment',
    email: 'mwe@mwe.go.ug',
    phone: '+256 414 505942',
    website: 'https://www.mwe.go.ug',
    address: 'Plot 21/28, Port Bell Road, Luzira, Kampala',
    director: 'Hon. Sam Cheptoris'
  },
  NEMA: {
    agency: 'National Environment Management Authority (NEMA)',
    email: 'info@nema.go.ug',
    phone: '+256 414 251 064',
    website: 'https://www.nema.go.ug',
    address: 'NEMA House, Plot 17/19/21, Jinja Road, Kampala',
    director: 'Dr. Tom Okurut'
  },

  // Tourism & Hospitality
  UTB: {
    agency: 'Uganda Tourism Board',
    email: 'info@utb.go.ug',
    phone: '+256 414 342196',
    website: 'https://utb.go.ug',
    address: 'IPS Building, Plot 14, Kimathi Avenue, Kampala',
    director: 'Lilly Ajarova'
  },
  UHOA: {
    agency: 'Uganda Hotel Owners Association',
    email: 'info@uhoa.co.ug',
    phone: '+256 414 258 394',
    website: 'https://www.uhoa.co.ug',
    address: 'Hotel Equatoria, Plot 18/20, Kira Road, Kampala'
  },

  // Mining & Energy
  MEMD: {
    agency: 'Ministry of Energy and Mineral Development',
    email: 'info@memd.go.ug',
    phone: '+256 414 707 000',
    website: 'https://www.memd.go.ug',
    address: 'Plot 1-3, Hannington Road, Kampala',
    director: 'Hon. Ruth Nankabirwa'
  },
  ERA: {
    agency: 'Electricity Regulatory Authority (ERA)',
    email: 'info@era.go.ug',
    phone: '+256 417 101 800',
    website: 'https://www.era.go.ug',
    address: 'Plot 15, Shimoni Road, Nakasero, Kampala',
    director: 'Ziria Tibalwa Waako'
  },
  UCMP: {
    agency: 'Uganda Chamber of Mines and Petroleum',
    email: 'info@ucmp.ug',
    phone: '+256 414 540 782',
    website: 'https://www.ucmp.ug',
    address: 'Plot 83, Buganda Road, Kampala'
  },

  // ICT & Technology
  ICT_MINISTRY: {
    agency: 'Ministry of ICT and National Guidance',
    email: 'info@ict.go.ug',
    phone: '+256 414 313 333',
    website: 'https://www.ict.go.ug',
    address: 'Plot 131-135, Port Bell Road, Kampala',
    director: 'Hon. Chris Baryomunsi'
  },
  NITA: {
    agency: 'National Information Technology Authority (NITA)',
    email: 'info@nita.go.ug',
    phone: '+256 417 801 038',
    website: 'https://www.nita.go.ug',
    address: 'Plot 28, Jinja Road, Kampala',
    director: 'James Saaka'
  },
  UCC: {
    agency: 'Uganda Communications Commission',
    email: 'info@ucc.co.ug',
    phone: '+256 414 339 000',
    website: 'https://www.ucc.co.ug',
    address: 'Plot 42-44, Spring Road, Bugolobi, Kampala',
    director: 'Irene Sewankambo'
  },

  // Manufacturing & Trade
  MTIC: {
    agency: 'Ministry of Trade, Industry and Cooperatives',
    email: 'info@mtic.go.ug',
    phone: '+256 414 347 473',
    website: 'https://www.mtic.go.ug',
    address: 'Plot 78, Jinja Road, Farmers House, Kampala',
    director: 'Hon. Francis Mwebesa'
  },
  UMA: {
    agency: 'Uganda Manufacturers Association',
    email: 'uma@uma.or.ug',
    phone: '+256 414 220 026',
    website: 'https://www.uma.or.ug',
    address: 'Plot 6B, 7th Street, Industrial Area, Kampala'
  },

  // Healthcare & Pharmaceuticals
  MOH: {
    agency: 'Ministry of Health',
    email: 'info@health.go.ug',
    phone: '+256 414 340 874',
    website: 'https://www.health.go.ug',
    address: 'Plot 6, Lourdel Road, Nakasero, Kampala',
    director: 'Hon. Jane Ruth Aceng'
  },
  DRUG_AUTHORITY: {
    agency: 'National Drug Authority (NDA)',
    email: 'info@nda.or.ug',
    phone: '+256 414 340 193',
    website: 'https://www.nda.or.ug',
    address: 'Plot 46-48, Lumumba Avenue, Nakasero, Kampala',
    director: 'Dr. David Nahamya'
  },

  // Financial Services
  BOU: {
    agency: 'Bank of Uganda',
    email: 'info@bou.or.ug',
    phone: '+256 414 258 441',
    website: 'https://www.bou.or.ug',
    address: 'Plot 37-45, Kampala Road, Kampala',
    director: 'Prof. Emmanuel Tumusiime-Mutebile'
  },
  IRA: {
    agency: 'Insurance Regulatory Authority',
    email: 'info@ira.go.ug',
    phone: '+256 414 342 132',
    website: 'https://www.ira.go.ug',
    address: 'Plot 30, Kampala Road, Kampala'
  },
  UMRA: {
    agency: 'Uganda Microfinance Regulatory Authority',
    email: 'info@umra.go.ug',
    phone: '+256 414 233 218',
    website: 'https://www.umra.go.ug',
    address: 'Plot 4, Nile Avenue, Kampala'
  },

  // Education & Training
  EDUCATION_MINISTRY: {
    agency: 'Ministry of Education and Sports',
    email: 'info@education.go.ug',
    phone: '+256 414 234 451',
    website: 'https://www.education.go.ug',
    address: 'Plot 2-6, Lourdel Road, Nakasero, Kampala',
    director: 'Hon. Janet Kataha Museveni'
  },

  // Infrastructure & Housing
  MOLHUD: {
    agency: 'Ministry of Lands, Housing and Urban Development',
    email: 'info@molhud.go.ug',
    phone: '+256 414 341 278',
    website: 'https://www.molhud.go.ug',
    address: 'Plot 2, Lourdel Road, Nakasero, Kampala',
    director: 'Hon. Judith Nabakooba'
  },
  MOWT: {
    agency: 'Ministry of Works and Transport',
    email: 'info@mowt.go.ug',
    phone: '+256 414 320 580',
    website: 'https://www.mowt.go.ug',
    address: 'Plot 2-10, Parliament Avenue, Kampala',
    director: 'Hon. Edward Katumba Wamala'
  },
  KCCA: {
    agency: 'Kampala Capital City Authority',
    email: 'info@kcca.go.ug',
    phone: '+256 414 231 000',
    website: 'https://www.kcca.go.ug',
    address: 'City Hall, Plot 1-3, Apollo Kaggwa Road, Kampala',
    director: 'Dorothy Kisaka'
  },

  // Investment & Business Development
  UIA: {
    agency: 'Uganda Investment Authority',
    email: 'info@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Robert Mukiza'
  },
  URSB: {
    agency: 'Uganda Registration Services Bureau',
    email: 'info@ursb.go.ug',
    phone: '+256 414 230 000',
    website: 'https://www.ursb.go.ug',
    address: 'Plot 2, Jinja Road, Kampala',
    director: 'Mercy Kainobwisho'
  },
  URA: {
    agency: 'Uganda Revenue Authority',
    email: 'info@ura.go.ug',
    phone: '+256 800 117 000',
    website: 'https://www.ura.go.ug',
    address: 'Plot 38, Kampala Road, Kampala',
    director: 'John Rujoki Musinguzi'
  },

  // UIA Investment Officers (from Bankable Projects 2025/2026)
  UIA_ALICE: {
    agency: 'Uganda Investment Authority — Agriculture Desk',
    email: 'andagire@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Alice Ndagire'
  },
  UIA_SARAH: {
    agency: 'Uganda Investment Authority — Projects Desk',
    email: 'snassimbwa@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Sarah Nassimbwa'
  },
  UIA_SUZANNE: {
    agency: 'Uganda Investment Authority — Energy Desk',
    email: 'sakware@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Suzanne Akware'
  },
  UIA_ADAM: {
    agency: 'Uganda Investment Authority — Minerals Desk',
    email: 'amutebi@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Adam Mutebi'
  },
  UIA_IRENE: {
    agency: 'Uganda Investment Authority — Health & ICT Desk',
    email: 'issagala@ugandainvest.go.ug',
    phone: '+256 414 301 000',
    website: 'https://www.ugandainvest.go.ug',
    address: 'Plot 28, Kampala Road, Kampala',
    director: 'Irene Ssagala'
  },
  UDC: {
    agency: 'Uganda Development Corporation',
    email: 'yudaya.kadondi@udc.go.ug',
    phone: '+256 772 650 938',
    website: 'https://www.udc.go.ug',
    address: 'Plot 1A, 1st Street, Industrial Area, Kampala',
    director: 'Yudaya Kadondi'
  },
  UEGCL: {
    agency: 'Uganda Electricity Generation Company Limited',
    email: 'david.isingoma@uegcl.go.ug',
    phone: '+256 312 372 165',
    website: 'https://www.uegcl.go.ug',
    address: 'Plot 10, Hannington Road, Kampala',
    director: 'David K. Isingoma'
  },

  // Real Estate & Property
  AREA: {
    agency: 'Association of Real Estate Agents (AREA)',
    email: 'info@area-uganda.org',
    phone: '+256 414 540 836',
    website: 'https://www.area-uganda.org',
    address: 'Plot 82, Buganda Road, Kampala'
  },

  // Transport & Logistics  
  COLD_CHAIN: {
    agency: 'Uganda Cold Chain Association',
    email: 'info@coldchain.ug',
    phone: '+256 414 567 890',
    website: 'https://www.coldchain.ug',
    address: 'Plot 15, Industrial Area, Kampala'
  },

  // Water & Sanitation
  NWSC: {
    agency: 'National Water and Sewerage Corporation',
    email: 'info@nwsc.co.ug',
    phone: '+256 414 315 000',
    website: 'https://www.nwsc.co.ug',
    address: 'Plot 3, Jinja Road, Kampala',
    director: 'Eng. Silver Mugisha'
  }
};

export const getContactInfo = (contactKey: string): ContactInfo => {
  const contact = CONTACT_DATABASE[contactKey];
  if (!contact) {
    // Return default UIA contact if specific contact not found
    return CONTACT_DATABASE.UIA!;
  }
  return contact;
};

export const getAllContacts = (): ContactInfo[] => {
  return Object.values(CONTACT_DATABASE);
};

export const getContactsByCategory = (): ContactInfo[] => {
  // This could be extended to categorize contacts
  return getAllContacts();
};