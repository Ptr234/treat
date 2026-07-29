import { createClient, type SanityClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!projectId) {
  console.error('[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — Sanity queries will fail');
}
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

const sanityToken = process.env.SANITY_API_TOKEN;

/**
 * Clients are built on first use, not at module load.
 *
 * `createClient` throws "Configuration must contain `projectId`" immediately if
 * the id is blank. Because these are module-level exports imported by ~20 route
 * handlers, an eager call made `next build` fail outright ("Failed to collect
 * page data for /api/auth/profile") whenever NEXT_PUBLIC_SANITY_PROJECT_ID was
 * unset — so the app could not even be built without CMS credentials. Deferring
 * the call keeps the build working and moves the failure to the request that
 * actually needs Sanity.
 */
function build(useCdn: boolean, withToken: boolean): SanityClient {
  if (!projectId) {
    throw new Error(
      '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. ' +
      'Sanity-backed content is unavailable until it is configured.'
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    ...(withToken ? { token: sanityToken } : {}),
  });
}

/** Memoise so repeated property access does not rebuild the client. */
function lazyClient(useCdn: boolean, withToken: boolean): SanityClient {
  let real: SanityClient | null = null;
  const resolve = (): SanityClient => (real ??= build(useCdn, withToken));
  return new Proxy({} as SanityClient, {
    get(_t, prop) {
      const target = resolve();
      const value = Reflect.get(target, prop);
      // Bind to the real client, and never forward the proxy as the receiver:
      // SanityClient stores state in private class fields (`#…`), which throw
      // "Cannot read private member" if `this` is anything but the instance.
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set(_t, prop, value) {
      return Reflect.set(resolve(), prop, value);
    },
    has: (_t, prop) => prop in resolve(),
  });
}

// Public read-only client (CDN-cached, safe for client components)
export const client: SanityClient = lazyClient(true, false);

// Server-side write client (NEVER expose to browser — uses token)
export const serverClient: SanityClient = lazyClient(false, true);

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
