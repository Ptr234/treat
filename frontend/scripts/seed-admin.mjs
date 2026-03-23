#!/usr/bin/env node
/**
 * Seed admin user into Sanity CMS.
 *
 * Usage:
 *   node scripts/seed-admin.mjs
 *   node scripts/seed-admin.mjs --email admin@uia.go.ug --password YourPassword --name "Director General"
 *
 * Requires: SANITY_API_TOKEN in .env.local
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'juhrlluw',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Parse CLI args
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const email = getArg('--email', 'admin@uia.go.ug');
const password = getArg('--password', 'OneStop2026!');
const name = getArg('--name', 'DG Administrator');

// SHA-256 hash using Node crypto
import { createHash } from 'crypto';

function hashPassword(pw) {
  return createHash('sha256').update(pw).digest('hex');
}

async function main() {
  console.log(`\nSeeding admin user...`);
  console.log(`  Email:    ${email}`);
  console.log(`  Name:     ${name}`);
  console.log(`  Password: ${'*'.repeat(password.length)}\n`);

  const passwordHash = await hashPassword(password);

  const doc = {
    _id: 'admin-dg',
    _type: 'adminUser',
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'admin',
    isActive: true,
  };

  const result = await client.createOrReplace(doc);
  console.log(`Admin user seeded: ${result._id}`);
  console.log(`\nYou can now sign in at your app with:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}\n`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
