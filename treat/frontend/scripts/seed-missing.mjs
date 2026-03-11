#!/usr/bin/env node
/**
 * Seed missing agencies (8) + all 19 investment opportunities into Sanity
 * Usage: SANITY_API_TOKEN=<token> node scripts/seed-missing.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = createClient({
  projectId: 'juhrlluw',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// ──────────────────────────────────────────────
// 1. MISSING AGENCIES (8 not in original seed)
// ──────────────────────────────────────────────
const missingAgencies = [
  {
    _id: 'agency-nssf',
    _type: 'agency',
    name: 'National Social Security Fund',
    code: 'NSSF',
    description: 'A National Saving Scheme mandated by Government through the NSSF Act.',
    contactEmail: 'customerservice@nssfug.org',
    contactPhone: '+256-414-316000',
    website: 'https://www.nssfug.org',
    services: [
      'Employee / Employer Registration',
      'Clearance Certificate application',
      'Information on Investment products (Real Estate, etc.)',
      'General information about NSSF services (Claims, Contributions, Smart Life for private sector)',
    ],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-cma',
    _type: 'agency',
    name: 'Capital Markets Authority',
    code: 'CMA',
    description: 'A statutory body responsible for promoting, developing and regulating the capital markets industry in Uganda.',
    contactEmail: 'info@cmauganda.co.ug',
    contactPhone: '+256-414-342788',
    website: 'https://cmauganda.co.ug',
    services: [
      'Investing in Capital Markets',
      'Licensing requirements',
      'Facilitating businesses with capital raising options in the capital markets',
      'Providing info on participation in the capital markets',
    ],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-umeme',
    _type: 'agency',
    name: 'UMEME',
    code: 'UMEME',
    description: "Uganda's main electricity distribution company.",
    contactEmail: 'customercare@umeme.co.ug',
    contactPhone: '+256-312-360600',
    website: 'https://www.umeme.co.ug',
    services: [
      'Site inspection',
      'Connection/reconnection',
      'Resolution of technical complaints',
      'Replacement of faults',
      'Notification of planned shutdowns',
    ],
    slaResponseHours: 48,
  },
  {
    _id: 'agency-nwsc',
    _type: 'agency',
    name: 'National Water and Sewerage Corporation',
    code: 'NWSC',
    description: 'Provides water and sewerage services in urban areas of Uganda.',
    contactEmail: 'info@nwsc.co.ug',
    contactPhone: '+256-414-315000',
    website: 'https://www.nwsc.co.ug',
    services: [
      'Application and processing of Industrial water connections',
      'Faults resolutions',
      'Notification of planned interruptions',
      'Advisory on water and sewerage services requirements',
    ],
    slaResponseHours: 48,
  },
  {
    _id: 'agency-utb',
    _type: 'agency',
    name: 'Uganda Tourism Board',
    code: 'UTB',
    description: 'The official tourism promotion agency of Uganda.',
    contactEmail: 'info@utb.go.ug',
    contactPhone: '+256-414-342196',
    website: 'https://www.utb.go.ug',
    services: [
      'Provide Information on Tourism Investment Opportunities in Uganda',
      'Registration of Tourism Establishment in Uganda',
      'Provide Information on Licensing, Classification and Grading of Tourism Establishment',
      'Provide Tourism Sector Advisory Services in Uganda',
    ],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-ufza',
    _type: 'agency',
    name: 'Uganda Free Zones Authority',
    code: 'UFZA',
    description: 'Manages and promotes free zones for industrial and commercial development.',
    contactEmail: 'info@ufza.go.ug',
    contactPhone: '+256-414-234567',
    website: 'https://www.ufza.go.ug',
    services: ['Issuance of free zones licenses'],
    slaResponseHours: 24,
  },
  {
    _id: 'agency-fue',
    _type: 'agency',
    name: 'Federation of Uganda Employers',
    code: 'FUE',
    description: 'The voice of employers in Uganda on all social and economic policy issues.',
    contactEmail: 'fue@fue.or.ug',
    contactPhone: '+256-414-220201',
    website: 'https://www.fue.or.ug',
    services: [
      'Employment relations and legal services',
      'Research, policy & advocacy – as per ILO mandate',
      'Business support services',
      'Employer representation before labor administration and industrial court',
    ],
    slaResponseHours: 48,
  },
  {
    _id: 'agency-giants-club',
    _type: 'agency',
    name: 'The Giants Club',
    code: 'GIANTS_CLUB',
    description: 'An initiative of Space for Giants, that unites visionary leaders of African states with philanthropists, and scientists to protect Africa\'s remaining wildernesses.',
    contactEmail: 'info@spaceforgiants.org',
    contactPhone: '+254-720-779598',
    website: 'https://www.giantsclub.org',
    services: [
      'Information on Tourism investment opportunities',
      'Promotion of conservation projects',
      'International Media and public relations services',
    ],
    slaResponseHours: 48,
  },
];

// ──────────────────────────────────────────────
// 2. INVESTMENT OPPORTUNITIES (all 19 from JSON)
// ──────────────────────────────────────────────
const opportunitiesRaw = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'investment-opportunities.json'), 'utf8')
);

const investmentOpportunities = opportunitiesRaw.map((opp) => ({
  _id: `investment-opp-${opp.id}`,
  _type: 'investmentOpportunity',
  title: opp.title,
  category: opp.category,
  description: opp.description,
  fullDescription: opp.fullDescription || '',
  investmentRange: opp.investmentRange,
  roi: opp.roi,
  timeline: opp.timeline,
  agency: opp.agency,
  priority: opp.priority,
  keyRisks: opp.keyRisks || '',
  contact: opp.contact
    ? {
        _type: 'object',
        email: opp.contact.email,
        phone: opp.contact.phone,
        website: opp.contact.website,
        address: opp.contact.address,
      }
    : undefined,
  projectContact: opp.projectContact
    ? {
        _type: 'object',
        name: opp.projectContact.name,
        email: opp.projectContact.email,
        phone: opp.projectContact.phone,
        company: opp.projectContact.company,
      }
    : undefined,
  investmentPromoter: opp.investmentPromoter || '',
  logoPath: opp.logoPath || '',
  marketSize: opp.marketSize || '',
  competitiveAdvantage: opp.competitiveAdvantage || '',
  requiredLicenses: opp.requiredLicenses || [],
  incentives: opp.incentives || [],
  keyMetrics: opp.keyMetrics
    ? {
        _type: 'object',
        marketGrowth: opp.keyMetrics.marketGrowth,
        exportValue: opp.keyMetrics.exportValue,
        employmentPotential: opp.keyMetrics.employmentPotential,
        paybackPeriod: opp.keyMetrics.paybackPeriod,
      }
    : undefined,
  projectType: opp.projectType || '',
  investmentType: opp.investmentType || '',
}));

// ──────────────────────────────────────────────
// EXECUTE SEED
// ──────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding missing agencies + investment opportunities...\n');

  const transaction = client.transaction();

  // Missing Agencies
  console.log(`📋 Adding ${missingAgencies.length} missing agencies...`);
  for (const agency of missingAgencies) {
    transaction.createOrReplace(agency);
  }

  // Investment Opportunities
  console.log(`💰 Adding ${investmentOpportunities.length} investment opportunities...`);
  for (const opp of investmentOpportunities) {
    transaction.createOrReplace(opp);
  }

  console.log('\n⏳ Committing transaction...');
  try {
    const result = await transaction.commit();
    console.log(`\n✅ Successfully seeded ${result.results.length} documents!`);
    console.log('\nBreakdown:');
    console.log(`  • ${missingAgencies.length} Agencies (NSSF, CMA, UMEME, NWSC, UTB, UFZA, FUE, Giants Club)`);
    console.log(`  • ${investmentOpportunities.length} Investment Opportunities`);
    console.log(`\n🎉 Total: ${result.results.length} documents`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
