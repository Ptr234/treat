/**
 * Seed script for downloadable resources in Sanity.
 *
 * This creates placeholder resource documents in Sanity Studio.
 * After running this, upload the actual files via Sanity Studio
 * by editing each resource and attaching the real file.
 *
 * Usage:
 *   npx tsx scripts/seed-resources.ts
 *
 * Requires: SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET in .env.local
 */

import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  useCdn: false,
  token,
});

interface ResourceSeed {
  title: string;
  description: string;
  category: string;
  fileType: string;
  sortOrder: number;
}

const resources: ResourceSeed[] = [
  // Business Registration Forms
  { title: 'Company Registration Form', description: 'Form for registering a new company with URSB', category: 'business_registration', fileType: 'PDF', sortOrder: 1 },
  { title: 'Business License Application', description: 'Application for business operating license', category: 'business_registration', fileType: 'PDF', sortOrder: 2 },
  { title: 'Partnership Agreement Template', description: 'Template for partnership agreements', category: 'business_registration', fileType: 'DOCX', sortOrder: 3 },
  { title: 'Articles of Association Template', description: 'Template for company articles of association', category: 'business_registration', fileType: 'DOCX', sortOrder: 4 },

  // Tax Registration
  { title: 'TIN Registration Form', description: 'Tax Identification Number application', category: 'tax_registration', fileType: 'PDF', sortOrder: 1 },
  { title: 'VAT Registration Guide', description: 'Complete guide to VAT registration in Uganda', category: 'tax_registration', fileType: 'PDF', sortOrder: 2 },
  { title: 'PAYE Declaration Form', description: 'Monthly PAYE declaration template', category: 'tax_registration', fileType: 'XLSX', sortOrder: 3 },
  { title: 'Tax Compliance Certificate', description: 'Application for tax compliance certificate', category: 'tax_registration', fileType: 'PDF', sortOrder: 4 },

  // Investment Licenses
  { title: 'Investment License Application', description: 'UIA investment license application form', category: 'investment_licenses', fileType: 'PDF', sortOrder: 1 },
  { title: 'Business Plan Template', description: 'Comprehensive business plan template for investors', category: 'investment_licenses', fileType: 'DOCX', sortOrder: 2 },
  { title: 'Foreign Exchange Permit', description: 'Application for foreign exchange permit', category: 'investment_licenses', fileType: 'PDF', sortOrder: 3 },
  { title: 'Investment Incentives Guide', description: 'Complete guide to investment incentives in Uganda', category: 'investment_licenses', fileType: 'PDF', sortOrder: 4 },

  // Guides & Resources
  { title: 'Complete Business Setup Guide', description: 'Step-by-step business setup guide for Uganda', category: 'guides_resources', fileType: 'PDF', sortOrder: 1 },
  { title: 'Investment Opportunities in Uganda', description: 'Comprehensive overview of investment opportunities', category: 'guides_resources', fileType: 'PDF', sortOrder: 2 },
  { title: 'Legal Compliance Checklist', description: 'Essential legal compliance checklist for businesses', category: 'guides_resources', fileType: 'PDF', sortOrder: 3 },
  { title: 'Sector-Specific Guidelines', description: 'Guidelines for different business sectors', category: 'guides_resources', fileType: 'ZIP', sortOrder: 4 },
];

async function seed() {
  console.log(`Seeding ${resources.length} downloadable resources to Sanity (${dataset})...\n`);

  const transaction = client.transaction();

  for (const res of resources) {
    const docId = `resource-${res.category}-${res.sortOrder}`;

    transaction.createOrReplace({
      _id: docId,
      _type: 'downloadableResource',
      title: res.title,
      description: res.description,
      category: res.category,
      fileType: res.fileType,
      sortOrder: res.sortOrder,
      isPublished: true,
      // file field left empty — upload actual files via Sanity Studio
    });

    console.log(`  + ${res.title} (${res.fileType})`);
  }

  await transaction.commit();
  console.log('\nDone! Now go to Sanity Studio and upload actual files for each resource.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
