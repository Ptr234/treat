import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!projectId) {
  console.error('[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — Sanity queries will fail');
}
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

// Public read-only client (CDN-cached, safe for client components)
// projectId defaults to placeholder during build — real ID must be set via env vars at runtime
export const client = createClient({
  projectId: projectId ?? '',
  dataset,
  apiVersion,
  useCdn: true,
});

// Server-side write client (NEVER expose to browser — uses token)
// Token gated: SANITY_API_TOKEN must be set in Vercel environment variables
export const serverClient = createClient({
  projectId: projectId ?? '',
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
