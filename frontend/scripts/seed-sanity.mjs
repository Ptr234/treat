#!/usr/bin/env node
/**
 * Seed Sanity CMS with realistic UIA OneStop Centre content
 * Based on treat/required.md specifications
 *
 * Usage: node scripts/seed-sanity.mjs
 */

import { createClient } from '@sanity/client';
import { randomUUID } from 'crypto';

const client = createClient({
  projectId: 'juhrlluw',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// ──────────────────────────────────────────────
// 1. AGENCIES (all 9 from requirements Section 3.5)
// ──────────────────────────────────────────────
const agencies = [
  {
    _id: 'agency-uia',
    _type: 'agency',
    name: 'Uganda Investment Authority',
    code: 'UIA',
    description: 'The lead agency for promoting and facilitating investment in Uganda. Provides investment licenses, facilitation services, and aftercare support to both local and foreign investors.',
    contactEmail: 'info@ugandainvest.go.ug',
    contactPhone: '+256-414-301000',
    website: 'https://www.ugandainvest.go.ug',
    services: ['Investment License Issuance', 'Investor Facilitation', 'Aftercare Services', 'Industrial Park Management', 'Investment Promotion', 'Policy Advocacy'],
    slaResponseHours: 4,
  },
  {
    _id: 'agency-ursb',
    _type: 'agency',
    name: 'Uganda Registration Services Bureau',
    code: 'URSB',
    description: 'Responsible for company registration, business name registration, and maintenance of the companies registry in Uganda.',
    contactEmail: 'info@ursb.go.ug',
    contactPhone: '+256-414-251684',
    website: 'https://www.ursb.go.ug',
    services: ['Company Registration', 'Business Name Registration', 'Document Search', 'Annual Returns Filing', 'Trademark Registration', 'Patent Registration'],
    slaResponseHours: 8,
  },
  {
    _id: 'agency-ura',
    _type: 'agency',
    name: 'Uganda Revenue Authority',
    code: 'URA',
    description: 'Administers and enforces tax laws in Uganda. Provides TIN registration, tax guidance, and customs services for investors.',
    contactEmail: 'services@ura.go.ug',
    contactPhone: '+256-417-442000',
    website: 'https://www.ura.go.ug',
    services: ['TIN Registration', 'Tax Guidance', 'Customs Services', 'Tax Clearance Certificates', 'VAT Registration', 'Import/Export Documentation'],
    slaResponseHours: 8,
  },
  {
    _id: 'agency-dcic',
    _type: 'agency',
    name: 'Directorate of Citizenship and Immigration Control',
    code: 'DCIC',
    description: 'Handles work permits, visas, special passes, and citizenship services for foreign investors and their employees.',
    contactEmail: 'info@immigration.go.ug',
    contactPhone: '+256-414-231551',
    website: 'https://www.immigration.go.ug',
    services: ['Work Permits', 'Business Visas', 'Special Passes', 'Dependent Passes', 'Entry Permits', 'Citizenship Applications'],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-nema',
    _type: 'agency',
    name: 'National Environment Management Authority',
    code: 'NEMA',
    description: 'The principal agency for environmental management in Uganda. Issues Environmental Impact Assessment certificates and ensures environmental compliance.',
    contactEmail: 'info@nema.go.ug',
    contactPhone: '+256-414-251064',
    website: 'https://www.nema.go.ug',
    services: ['EIA Certification', 'Environmental Compliance', 'Pollution Control', 'Waste Management Permits', 'Environmental Audits', 'Wetland Use Permits'],
    slaResponseHours: 48,
  },
  {
    _id: 'agency-kcca',
    _type: 'agency',
    name: 'Kampala Capital City Authority',
    code: 'KCCA',
    description: 'Administers Kampala City services including trading licenses, building permits, and business compliance within the capital.',
    contactEmail: 'info@kcca.go.ug',
    contactPhone: '+256-414-254011',
    website: 'https://www.kcca.go.ug',
    services: ['Trading License', 'Building Permits', 'Business Compliance', 'Road Access Permits', 'Signage Permits', 'Market Stall Allocation'],
    slaResponseHours: 12,
  },
  {
    _id: 'agency-lands',
    _type: 'agency',
    name: 'Ministry of Lands, Housing and Urban Development',
    code: 'LANDS',
    description: 'Manages land registration, land search services, and titles processing for investment projects across Uganda.',
    contactEmail: 'info@mlhud.go.ug',
    contactPhone: '+256-414-342931',
    website: 'https://www.mlhud.go.ug',
    services: ['Land Registration', 'Land Title Search', 'Survey Services', 'Land Valuation', 'Lease Processing', 'Land Use Planning'],
    slaResponseHours: 48,
  },
  {
    _id: 'agency-unbs',
    _type: 'agency',
    name: 'Uganda National Bureau of Standards',
    code: 'UNBS',
    description: 'Develops and enforces standards for products and services. Issues quality certification and import permits.',
    contactEmail: 'info@unbs.go.ug',
    contactPhone: '+256-414-505995',
    website: 'https://www.unbs.go.ug',
    services: ['Quality Certification', 'Import Permits (PVOC)', 'Product Testing', 'Standards Development', 'Metrology Services', 'Market Surveillance'],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-era',
    _type: 'agency',
    name: 'Electricity Regulatory Authority',
    code: 'ERA',
    description: 'Regulates the generation, transmission, distribution, sale, and use of electricity in Uganda.',
    contactEmail: 'era@era.or.ug',
    contactPhone: '+256-414-341852',
    website: 'https://www.era.or.ug',
    services: ['Power Generation Licenses', 'Electricity Distribution Permits', 'Tariff Regulation', 'Grid Connection Approvals', 'Renewable Energy Permits', 'Power Purchase Agreement Reviews'],
    slaResponseHours: 24,
  },
];

// ──────────────────────────────────────────────
// 2. EVENTS (Section 3.2 categories)
// ──────────────────────────────────────────────
const events = [
  {
    _type: 'event',
    title: 'Uganda Investment Forum 2026',
    slug: { _type: 'slug', current: 'uganda-investment-forum-2026' },
    date: '2026-05-15T09:00:00Z',
    endDate: '2026-05-17T17:00:00Z',
    category: 'UIA Forum',
    description: 'The flagship annual investment forum bringing together over 1,000 investors, government officials, and development partners. Features sector-specific panels on Agriculture, Manufacturing, ICT, and Energy. Includes B2B matchmaking sessions, industrial park tours, and the Presidential Investor Roundtable.',
    location: 'Kampala Serena Hotel, Kampala, Uganda',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'East African Community Investment Summit',
    slug: { _type: 'slug', current: 'eac-investment-summit-2026' },
    date: '2026-07-10T08:30:00Z',
    endDate: '2026-07-12T16:00:00Z',
    category: 'EAC Summit',
    description: 'Regional investment summit connecting investors with opportunities across Uganda, Kenya, Tanzania, Rwanda, Burundi, DRC, and South Sudan. Focus on cross-border investment, regional value chains, and the AfCFTA implementation roadmap.',
    location: 'Kigali Convention Centre, Kigali, Rwanda',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'Agribusiness Investment Symposium',
    slug: { _type: 'slug', current: 'agribusiness-symposium-2026' },
    date: '2026-04-22T09:00:00Z',
    endDate: '2026-04-23T17:00:00Z',
    category: 'Sector Symposium',
    description: 'Deep-dive into Uganda\'s agribusiness opportunities: coffee value chain, dairy processing, grain storage, and aquaculture. Features field visits to operational projects and matchmaking with local outgrower networks. Investment opportunities from $100K to $50M+.',
    location: 'Speke Resort Munyonyo, Kampala',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'Presidential Investor Roundtable — Dubai',
    slug: { _type: 'slug', current: 'presidential-roundtable-dubai-2026' },
    date: '2026-06-05T10:00:00Z',
    endDate: '2026-06-05T18:00:00Z',
    category: 'Government Mission',
    description: 'Exclusive roundtable with H.E. the President of Uganda and select high-net-worth investors from the Gulf region. Focus on energy, real estate, and tourism mega-projects. By invitation only — contact UIA for participation.',
    location: 'Atlantis The Royal, Dubai, UAE',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'Hannover Messe 2026 — Uganda Pavilion',
    slug: { _type: 'slug', current: 'hannover-messe-uganda-2026' },
    date: '2026-04-13T09:00:00Z',
    endDate: '2026-04-17T18:00:00Z',
    category: 'Global Event',
    description: 'Uganda\'s presence at the world\'s leading industrial technology fair. Showcasing manufacturing investment opportunities, mineral processing potential, and the Kampala Industrial & Business Park. Meet UIA officers at Hall 6, Stand B42.',
    location: 'Hannover Messe, Hannover, Germany',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'Weekly Investor Briefing: Doing Business in Uganda',
    slug: { _type: 'slug', current: 'weekly-investor-briefing-mar-2026' },
    date: '2026-03-20T14:00:00Z',
    endDate: '2026-03-20T15:30:00Z',
    category: 'Webinar',
    description: 'Weekly virtual briefing covering: investment procedures, tax incentives, industrial park availability, and Q&A with UIA facilitation officers. Open to all prospective investors. Register for the Zoom link.',
    location: 'Virtual — Zoom',
    registrationUrl: 'https://zoom.us/webinar/register',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'Mining & Mineral Processing Investment Forum',
    slug: { _type: 'slug', current: 'mining-forum-2026' },
    date: '2026-08-20T09:00:00Z',
    endDate: '2026-08-21T17:00:00Z',
    category: 'Sector Symposium',
    description: 'Exploring Uganda\'s untapped mineral wealth: gold, tin, tungsten, lithium, and rare earth elements. Presentations from the Directorate of Geological Survey, licensed mining companies, and international mining investors. Site visits to Karamoja region included.',
    location: 'Sheraton Kampala Hotel',
    isPublished: true,
    resources: [],
  },
  {
    _type: 'event',
    title: 'ICT & Digital Economy Webinar Series',
    slug: { _type: 'slug', current: 'ict-webinar-series-2026' },
    date: '2026-04-03T15:00:00Z',
    endDate: '2026-04-03T16:30:00Z',
    category: 'Webinar',
    description: 'Part 3 of 6: BPO & IT Services Export Potential. Uganda\'s young, English-speaking workforce and competitive costs make it a rising BPO destination. Guest speaker from one of Kampala\'s leading tech hubs.',
    location: 'Virtual — Microsoft Teams',
    isPublished: true,
    resources: [],
  },
];

// ──────────────────────────────────────────────
// 3. LICENSED PROJECTS (realistic data from Section 1.2)
// ──────────────────────────────────────────────
const projects = [
  {
    _type: 'licenseProject',
    companyName: 'Kakira Sugar Works Ltd',
    referenceNumber: 'UIA/LP/2021/0142',
    sector: 'Agriculture',
    subSector: 'Sugar Processing & Cogeneration',
    region: 'Eastern',
    district: 'Jinja',
    location: 'Kakira',
    coordinates: { _type: 'object', lat: 0.5027, lng: 33.2828 },
    investmentValueUSD: 65000000,
    investmentValueRange: '>$50M',
    employmentLocal: 8500,
    employmentForeign: 45,
    status: 'Operational',
    licenseDate: '2021-03-15',
    fiscalYear: '2020/21',
    nationality: 'Ugandan/Indian',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Cimerwa Rwanda-Uganda Cement',
    referenceNumber: 'UIA/LP/2022/0287',
    sector: 'Manufacturing',
    subSector: 'Cement Production',
    region: 'Western',
    district: 'Kasese',
    location: 'Hima',
    coordinates: { _type: 'object', lat: 0.3447, lng: 30.1303 },
    investmentValueUSD: 120000000,
    investmentValueRange: '>$50M',
    employmentLocal: 650,
    employmentForeign: 28,
    status: 'Operational',
    licenseDate: '2022-07-20',
    fiscalYear: '2022/23',
    nationality: 'Rwandan',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'TotalEnergies EP Uganda',
    referenceNumber: 'UIA/LP/2022/0301',
    sector: 'Energy',
    subSector: 'Oil & Gas Exploration',
    region: 'Western',
    district: 'Hoima',
    location: 'Kingfisher Development Area',
    coordinates: { _type: 'object', lat: 1.2000, lng: 30.7500 },
    investmentValueUSD: 4000000000,
    investmentValueRange: '>$50M',
    employmentLocal: 3200,
    employmentForeign: 450,
    status: 'Under Construction',
    licenseDate: '2022-02-01',
    fiscalYear: '2021/22',
    nationality: 'French',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Roofings Rolling Mills Ltd',
    referenceNumber: 'UIA/LP/2023/0089',
    sector: 'Manufacturing',
    subSector: 'Steel Products',
    region: 'Kampala',
    district: 'Kampala',
    location: 'Namanve Industrial Park',
    coordinates: { _type: 'object', lat: 0.3650, lng: 32.6897 },
    investmentValueUSD: 42000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 1200,
    employmentForeign: 35,
    status: 'Operational',
    licenseDate: '2023-01-10',
    fiscalYear: '2022/23',
    nationality: 'Ugandan/Indian',
    isIndustrialPark: true,
    industrialParkName: 'Namanve Industrial & Business Park',
  },
  {
    _type: 'licenseProject',
    companyName: 'Vivo Energy Uganda',
    referenceNumber: 'UIA/LP/2023/0156',
    sector: 'Energy',
    subSector: 'Petroleum Distribution',
    region: 'Kampala',
    district: 'Kampala',
    location: 'Port Bell',
    coordinates: { _type: 'object', lat: 0.3236, lng: 32.6459 },
    investmentValueUSD: 28000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 320,
    employmentForeign: 12,
    status: 'Operational',
    licenseDate: '2023-06-18',
    fiscalYear: '2022/23',
    nationality: 'British/Dutch',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Liao Shen Industrial Park',
    referenceNumber: 'UIA/LP/2024/0045',
    sector: 'Manufacturing',
    subSector: 'Multi-tenant Industrial Complex',
    region: 'Central',
    district: 'Mukono',
    location: 'Mukono',
    coordinates: { _type: 'object', lat: 0.3533, lng: 32.7553 },
    investmentValueUSD: 220000000,
    investmentValueRange: '>$50M',
    employmentLocal: 4500,
    employmentForeign: 200,
    status: 'Under Construction',
    licenseDate: '2024-02-05',
    fiscalYear: '2023/24',
    nationality: 'Chinese',
    isIndustrialPark: true,
    industrialParkName: 'Liao Shen Industrial Park',
  },
  {
    _type: 'licenseProject',
    companyName: 'Pearl Dairy Farms Ltd',
    referenceNumber: 'UIA/LP/2023/0211',
    sector: 'Agriculture',
    subSector: 'Dairy Processing',
    region: 'Western',
    district: 'Mbarara',
    location: 'Mbarara',
    coordinates: { _type: 'object', lat: -0.6074, lng: 30.6545 },
    investmentValueUSD: 18000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 850,
    employmentForeign: 15,
    status: 'Operational',
    licenseDate: '2023-09-12',
    fiscalYear: '2023/24',
    nationality: 'Ugandan',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Kiira Motors Corporation',
    referenceNumber: 'UIA/LP/2024/0078',
    sector: 'Manufacturing',
    subSector: 'Automotive Assembly',
    region: 'Eastern',
    district: 'Jinja',
    location: 'Jinja Industrial & Business Park',
    coordinates: { _type: 'object', lat: 0.4250, lng: 33.2040 },
    investmentValueUSD: 45000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 2000,
    employmentForeign: 60,
    status: 'Under Construction',
    licenseDate: '2024-04-01',
    fiscalYear: '2023/24',
    nationality: 'Ugandan',
    isIndustrialPark: true,
    industrialParkName: 'Jinja Industrial & Business Park',
  },
  {
    _type: 'licenseProject',
    companyName: 'Simba Telecom Uganda',
    referenceNumber: 'UIA/LP/2024/0192',
    sector: 'ICT',
    subSector: 'Telecom Infrastructure',
    region: 'Kampala',
    district: 'Kampala',
    location: 'Kololo',
    coordinates: { _type: 'object', lat: 0.3350, lng: 32.5918 },
    investmentValueUSD: 8500000,
    investmentValueRange: '$5M-$10M',
    employmentLocal: 280,
    employmentForeign: 22,
    status: 'Operational',
    licenseDate: '2024-08-15',
    fiscalYear: '2024/25',
    nationality: 'South African',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Lake Victoria Fisheries Ltd',
    referenceNumber: 'UIA/LP/2024/0225',
    sector: 'Agriculture',
    subSector: 'Fish Processing & Export',
    region: 'Central',
    district: 'Wakiso',
    location: 'Entebbe',
    coordinates: { _type: 'object', lat: 0.0512, lng: 32.4637 },
    investmentValueUSD: 5200000,
    investmentValueRange: '$5M-$10M',
    employmentLocal: 420,
    employmentForeign: 8,
    status: 'Operational',
    licenseDate: '2024-11-01',
    fiscalYear: '2024/25',
    nationality: 'Kenyan',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'SunBelt Solar Uganda',
    referenceNumber: 'UIA/LP/2025/0012',
    sector: 'Energy',
    subSector: 'Solar Power Generation',
    region: 'Northern',
    district: 'Gulu',
    location: 'Gulu Solar Park',
    coordinates: { _type: 'object', lat: 2.7747, lng: 32.2990 },
    investmentValueUSD: 35000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 180,
    employmentForeign: 25,
    status: 'Licensed',
    licenseDate: '2025-01-20',
    fiscalYear: '2024/25',
    nationality: 'German',
    isIndustrialPark: false,
  },
  {
    _type: 'licenseProject',
    companyName: 'Bujagali Eco-Lodge & Resorts',
    referenceNumber: 'UIA/LP/2024/0310',
    sector: 'Tourism',
    subSector: 'Eco-Tourism & Hospitality',
    region: 'Eastern',
    district: 'Jinja',
    location: 'Bujagali Falls',
    coordinates: { _type: 'object', lat: 0.4429, lng: 33.1567 },
    investmentValueUSD: 12000000,
    investmentValueRange: '$10M-$50M',
    employmentLocal: 350,
    employmentForeign: 15,
    status: 'Under Construction',
    licenseDate: '2024-12-10',
    fiscalYear: '2024/25',
    nationality: 'American',
    isIndustrialPark: false,
  },
];

// ──────────────────────────────────────────────
// 4. TICKETS (sample investor inquiries — Section 3.4)
// ──────────────────────────────────────────────
const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600000).toISOString();

const tickets = [
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0001',
    title: 'Investment license application for textile factory',
    description: 'We are a Turkish textile company looking to establish a garment manufacturing facility in Kampala Industrial Park. We need guidance on the investment license application process, required documentation, and expected timeline.',
    category: 'procedure_query',
    priority: 'medium',
    status: 'IN_PROGRESS',
    contactName: 'Mehmet Yilmaz',
    contactEmail: 'mehmet@anatoliatextiles.com',
    contactPhone: '+90-212-555-0142',
    investorNationality: 'Turkish',
    sector: 'Manufacturing',
    investmentSize: '$5M-$10M',
    assignee: 'Sarah Nakamya',
    assignedAgency: { _type: 'reference', _ref: 'agency-uia' },
    slaDeadlineHours: 24,
    slaDeadlineAt: hoursAgo(-20),
    isEscalated: false,
    createdAt: hoursAgo(28),
  },
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0002',
    title: 'Work permit delays for senior management team',
    description: 'Our company (Liao Shen Industrial Park) has been waiting 6 weeks for work permits for 12 Chinese engineers. The project timeline is at risk. Need urgent escalation.',
    category: 'license_delay',
    priority: 'high',
    status: 'PENDING_EXTERNAL',
    contactName: 'Wang Li',
    contactEmail: 'wang.li@liaoshen.cn',
    contactPhone: '+86-21-6888-0042',
    investorNationality: 'Chinese',
    sector: 'Manufacturing',
    investmentSize: '>$50M',
    assignee: 'James Opio',
    assignedAgency: { _type: 'reference', _ref: 'agency-dcic' },
    slaDeadlineHours: 8,
    slaDeadlineAt: hoursAgo(40),
    isEscalated: true,
    createdAt: hoursAgo(72),
  },
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0003',
    title: 'Tax incentives inquiry for agribusiness investment',
    description: 'I represent a consortium of Dutch investors interested in setting up a coffee processing plant in Mbale. What tax incentives are available under the Investment Code for agribusiness? Also interested in free zone status.',
    category: 'general_inquiry',
    priority: 'low',
    status: 'NEW',
    contactName: 'Jan van der Berg',
    contactEmail: 'jvdberg@dutchagri.nl',
    contactPhone: '+31-20-555-8832',
    investorNationality: 'Dutch',
    sector: 'Agriculture',
    investmentSize: '$1M-$5M',
    isEscalated: false,
    createdAt: hoursAgo(2),
  },
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0004',
    title: 'EIA certificate requirement for solar farm',
    description: 'Planning a 50MW solar farm in Gulu district. Need to understand the Environmental Impact Assessment process, timeline, and costs. Also need clarity on whether the project qualifies for fast-track EIA.',
    category: 'procedure_query',
    priority: 'medium',
    status: 'ASSIGNED',
    contactName: 'Dr. Klaus Schmidt',
    contactEmail: 'schmidt@sunbelt-energy.de',
    contactPhone: '+49-30-555-1234',
    investorNationality: 'German',
    sector: 'Energy',
    investmentSize: '$10M-$50M',
    assignee: 'Grace Atim',
    assignedAgency: { _type: 'reference', _ref: 'agency-nema' },
    slaDeadlineHours: 24,
    slaDeadlineAt: hoursAgo(-18),
    isEscalated: false,
    createdAt: hoursAgo(8),
  },
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0005',
    title: 'VIP: Major hotel chain — land acquisition inquiry',
    description: 'Marriott International exploring a 300-room luxury hotel development on the Kampala-Entebbe corridor. Need immediate facilitation for land identification, zoning clearance, and investment license. CEO visiting Kampala next week.',
    category: 'vip',
    priority: 'critical',
    status: 'IN_PROGRESS',
    contactName: 'David Johnson',
    contactEmail: 'd.johnson@marriott.com',
    contactPhone: '+1-301-555-9800',
    investorNationality: 'American',
    sector: 'Tourism',
    investmentSize: '>$50M',
    assignee: 'Director General',
    assignedAgency: { _type: 'reference', _ref: 'agency-uia' },
    slaDeadlineHours: 4,
    slaDeadlineAt: hoursAgo(-2),
    isEscalated: false,
    createdAt: hoursAgo(3),
  },
  {
    _type: 'ticket',
    referenceNumber: 'UIA-2026-0006',
    title: 'Company registration process for foreign entity',
    description: 'Indian IT company wanting to register a subsidiary in Uganda for BPO operations. Need guidance on URSB process, required documents, minimum share capital, and timeline.',
    category: 'procedure_query',
    priority: 'medium',
    status: 'RESOLVED',
    contactName: 'Priya Sharma',
    contactEmail: 'priya@techservices.in',
    contactPhone: '+91-80-4444-5566',
    investorNationality: 'Indian',
    sector: 'ICT',
    investmentSize: '$500K-$1M',
    assignee: 'Moses Kirumira',
    assignedAgency: { _type: 'reference', _ref: 'agency-ursb' },
    slaDeadlineHours: 24,
    satisfactionRating: 4,
    satisfactionComment: 'Very helpful guidance. Process was clearly explained.',
    isEscalated: false,
    createdAt: hoursAgo(120),
    resolvedAt: hoursAgo(96),
  },
];

// ──────────────────────────────────────────────
// 5. TICKET MESSAGES
// ──────────────────────────────────────────────
const ticketMessages = [
  {
    _type: 'ticketMessage',
    content: 'Thank you for your inquiry. I have reviewed your request and assigned it to our Investment Facilitation team. You will need the following documents: Certificate of Incorporation from your home country, Business Plan, Financial Statements (3 years), Board Resolution to invest in Uganda, and passport copies of directors.',
    authorName: 'Sarah Nakamya',
    authorRole: 'officer',
    authorEmail: 'snakamya@ugandainvest.go.ug',
    sentAt: hoursAgo(24),
    isInternal: false,
  },
  {
    _type: 'ticketMessage',
    content: 'This case has been escalated to the DG\'s office due to 6-week delay. Immigration has confirmed the applications are in final review. Expected resolution within 5 working days.',
    authorName: 'James Opio',
    authorRole: 'officer',
    authorEmail: 'jopio@ugandainvest.go.ug',
    sentAt: hoursAgo(48),
    isInternal: false,
  },
  {
    _type: 'ticketMessage',
    content: 'Internal note: DCIC Deputy Director confirmed backlog due to system upgrade. Prioritizing UIA-referred cases. Follow up on Friday.',
    authorName: 'James Opio',
    authorRole: 'officer',
    authorEmail: 'jopio@ugandainvest.go.ug',
    sentAt: hoursAgo(24),
    isInternal: true,
  },
];

// ──────────────────────────────────────────────
// 6. ANALYTICS METADATA (Section 3.3)
// ──────────────────────────────────────────────
const analytics = [
  {
    _type: 'analyticsMetadata',
    period: '2025-Q4',
    totalInquiries: 487,
    resolvedInquiries: 412,
    avgResolutionHours: 18.5,
    slaComplianceRate: 87,
    satisfactionAverage: 4.1,
    inquiriesByRegion: [
      { _key: randomUUID(), region: 'Europe', count: 142 },
      { _key: randomUUID(), region: 'Asia', count: 118 },
      { _key: randomUUID(), region: 'Middle East', count: 76 },
      { _key: randomUUID(), region: 'Africa', count: 89 },
      { _key: randomUUID(), region: 'Americas', count: 42 },
      { _key: randomUUID(), region: 'Domestic', count: 20 },
    ],
    inquiriesBySector: [
      { _key: randomUUID(), sector: 'Agriculture', count: 98 },
      { _key: randomUUID(), sector: 'Manufacturing', count: 124 },
      { _key: randomUUID(), sector: 'Energy', count: 76 },
      { _key: randomUUID(), sector: 'ICT', count: 65 },
      { _key: randomUUID(), sector: 'Tourism', count: 52 },
      { _key: randomUUID(), sector: 'Mining', count: 38 },
      { _key: randomUUID(), sector: 'Services', count: 22 },
      { _key: randomUUID(), sector: 'Real Estate', count: 12 },
    ],
    funnelData: {
      _type: 'object',
      inquiries: 487,
      facilitation: 298,
      applications: 156,
      licensing: 112,
      operational: 78,
    },
  },
  {
    _type: 'analyticsMetadata',
    period: '2026-Q1',
    totalInquiries: 523,
    resolvedInquiries: 389,
    avgResolutionHours: 16.2,
    slaComplianceRate: 91,
    satisfactionAverage: 4.3,
    inquiriesByRegion: [
      { _key: randomUUID(), region: 'Europe', count: 156 },
      { _key: randomUUID(), region: 'Asia', count: 132 },
      { _key: randomUUID(), region: 'Middle East', count: 84 },
      { _key: randomUUID(), region: 'Africa', count: 95 },
      { _key: randomUUID(), region: 'Americas', count: 38 },
      { _key: randomUUID(), region: 'Domestic', count: 18 },
    ],
    inquiriesBySector: [
      { _key: randomUUID(), sector: 'Agriculture', count: 105 },
      { _key: randomUUID(), sector: 'Manufacturing', count: 138 },
      { _key: randomUUID(), sector: 'Energy', count: 89 },
      { _key: randomUUID(), sector: 'ICT', count: 72 },
      { _key: randomUUID(), sector: 'Tourism', count: 48 },
      { _key: randomUUID(), sector: 'Mining', count: 41 },
      { _key: randomUUID(), sector: 'Services', count: 18 },
      { _key: randomUUID(), sector: 'Real Estate', count: 12 },
    ],
    funnelData: {
      _type: 'object',
      inquiries: 523,
      facilitation: 342,
      applications: 178,
      licensing: 126,
      operational: 84,
    },
  },
];

// ──────────────────────────────────────────────
// 7. DASHBOARD CONFIG (Section 3.7)
// ──────────────────────────────────────────────
const dashboardConfigs = [
  {
    _type: 'dashboardConfig',
    key: 'total_licensed_projects',
    label: 'Total Licensed Projects (since 1991)',
    value: '9,922',
    numericValue: 9922,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'total_planned_investment',
    label: 'Total Planned Investment',
    value: 'US$ 49.5 Billion',
    numericValue: 49494701079,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'total_planned_employment',
    label: 'Total Planned Employment',
    value: '1,250,382 jobs',
    numericValue: 1250382,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'avg_investment_per_project',
    label: 'Average Investment Per Project',
    value: 'US$ 4.99 Million',
    numericValue: 4990000,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'current_fy_projects',
    label: 'FY 2024/25 Licensed Projects',
    value: '481',
    numericValue: 481,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'current_fy_investment',
    label: 'FY 2024/25 Investment Value',
    value: 'US$ 3.2 Billion',
    numericValue: 3200867013,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'sla_vip_response_hours',
    label: 'VIP Investor SLA',
    value: '1 hour response, same-day resolution',
    numericValue: 1,
    alertThreshold: 1,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'sla_high_response_hours',
    label: 'High Priority SLA',
    value: '2 hours response, 3-5 days resolution',
    numericValue: 2,
    alertThreshold: 2,
    isActive: true,
  },
  {
    _type: 'dashboardConfig',
    key: 'daily_inquiry_threshold',
    label: 'High Volume Alert Threshold',
    value: 'Triggers at 150% of daily average',
    numericValue: 25,
    alertThreshold: 25,
    isActive: true,
  },
];

// ──────────────────────────────────────────────
// 8. AGENCY PROFILES (sample officers)
// ──────────────────────────────────────────────
const agencyProfiles = [
  {
    _type: 'agencyProfile',
    name: 'Sarah Nakamya',
    email: 'snakamya@ugandainvest.go.ug',
    agency: { _type: 'reference', _ref: 'agency-uia' },
    role: 'Senior Officer',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'James Opio',
    email: 'jopio@ugandainvest.go.ug',
    agency: { _type: 'reference', _ref: 'agency-uia' },
    role: 'Manager',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'Grace Atim',
    email: 'gatim@nema.go.ug',
    agency: { _type: 'reference', _ref: 'agency-nema' },
    role: 'Senior Officer',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'Moses Kirumira',
    email: 'mkirumira@ursb.go.ug',
    agency: { _type: 'reference', _ref: 'agency-ursb' },
    role: 'Officer',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'Dr. Robert Kasule',
    email: 'rkasule@ugandainvest.go.ug',
    agency: { _type: 'reference', _ref: 'agency-uia' },
    role: 'Director',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'Florence Nassimbwa',
    email: 'fnassimbwa@ura.go.ug',
    agency: { _type: 'reference', _ref: 'agency-ura' },
    role: 'Senior Officer',
    isActive: true,
  },
  {
    _type: 'agencyProfile',
    name: 'Peter Mugisha',
    email: 'pmugisha@immigration.go.ug',
    agency: { _type: 'reference', _ref: 'agency-dcic' },
    role: 'Manager',
    isActive: true,
  },
];

// ──────────────────────────────────────────────
// EXECUTE SEED
// ──────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding Sanity CMS with UIA OneStop Centre content...\n');

  const transaction = client.transaction();

  // Agencies (with fixed IDs for references)
  console.log('📋 Adding 9 agencies...');
  for (const agency of agencies) {
    transaction.createOrReplace(agency);
  }

  // Events
  console.log('📅 Adding 8 events...');
  for (const event of events) {
    transaction.create(event);
  }

  // Licensed Projects
  console.log('🏭 Adding 12 licensed projects...');
  for (const project of projects) {
    transaction.create(project);
  }

  // Tickets
  console.log('🎫 Adding 6 tickets...');
  const ticketIds = [];
  for (const ticket of tickets) {
    const id = `ticket-${ticket.referenceNumber.replace(/[^a-zA-Z0-9]/g, '-')}`;
    ticketIds.push(id);
    transaction.createOrReplace({ _id: id, ...ticket });
  }

  // Ticket Messages (linked to first two tickets)
  console.log('💬 Adding 3 ticket messages...');
  ticketMessages[0].ticket = { _type: 'reference', _ref: ticketIds[0] };
  ticketMessages[1].ticket = { _type: 'reference', _ref: ticketIds[1] };
  ticketMessages[2].ticket = { _type: 'reference', _ref: ticketIds[1] };
  for (const msg of ticketMessages) {
    transaction.create(msg);
  }

  // Analytics
  console.log('📊 Adding 2 analytics periods...');
  for (const analytic of analytics) {
    transaction.create(analytic);
  }

  // Dashboard Config
  console.log('⚙️  Adding 9 dashboard configs...');
  for (const config of dashboardConfigs) {
    transaction.create(config);
  }

  // Agency Profiles
  console.log('👤 Adding 7 agency officer profiles...');
  for (const profile of agencyProfiles) {
    transaction.create(profile);
  }

  console.log('\n⏳ Committing transaction...');
  try {
    const result = await transaction.commit();
    console.log(`\n✅ Successfully seeded ${result.results.length} documents!`);
    console.log('\nBreakdown:');
    console.log('  • 9 Agencies');
    console.log('  • 8 Events');
    console.log('  • 12 Licensed Projects');
    console.log('  • 6 Tickets');
    console.log('  • 3 Ticket Messages');
    console.log('  • 2 Analytics Periods');
    console.log('  • 9 Dashboard Configs');
    console.log('  • 7 Agency Profiles');
    console.log('\n🎉 Total: 56 documents');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
