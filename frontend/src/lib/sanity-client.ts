import { createClient, type SanityClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!projectId) {
  console.error('[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — Sanity queries will fail');
}
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

// Public read-only client (CDN-cached, safe for client components)
export const client = createClient({
  projectId: projectId ?? '',
  dataset,
  apiVersion,
  useCdn: true,
});

// Server-side write client (NEVER expose to browser — uses token)
const sanityToken = process.env.SANITY_API_TOKEN;
export const serverClient = createClient({
  projectId: projectId ?? '',
  dataset,
  apiVersion,
  useCdn: false,
  token: sanityToken,
});

/**
 * Returns the write-capable Sanity client, throwing if the API token is missing.
 * Use this in any route that creates, patches, or deletes Sanity documents
 * to fail fast with a clear error instead of getting a cryptic 401.
 */
export function getWriteClient(): SanityClient {
  if (!sanityToken) {
    throw new Error(
      '[sanity] SANITY_API_TOKEN is not set. ' +
      'Sanity mutations (create/update/delete) require a write token. ' +
      'Set SANITY_API_TOKEN in your environment variables.'
    );
  }
  if (!projectId) {
    throw new Error(
      '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. ' +
      'Sanity operations require a valid project ID.'
    );
  }
  return serverClient;
}

/** Check if Sanity write operations are available */
export const canWriteToSanity = Boolean(sanityToken && projectId);
