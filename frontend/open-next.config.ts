import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Almost every page is prerendered at build time (static or generateStaticParams).
// Without an incremental cache the Worker re-rendered each one on every request,
// which pushed requests past the Workers CPU limit (Cloudflare error 1102) and
// left others hanging. This serves the prerendered HTML from the Worker's static
// assets instead, and cache interception answers those requests before the
// Next.js server is loaded at all.
//
// Read-only: it suits this site because no page uses time-based revalidation
// (ISR). A page that adds `revalidate` needs an R2/KV incremental cache instead.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
