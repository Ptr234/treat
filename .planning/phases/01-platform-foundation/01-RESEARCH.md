# Phase 1: Platform Foundation - Research

**Researched:** 2026-03-01
**Domain:** CMS Migration, Next.js Infrastructure, Admin Authentication, Frontend Cleanup
**Confidence:** HIGH

## Summary

Phase 1 is the foundational migration from Firebase to Sanity CMS + Vercel while establishing admin authentication and cleaning the codebase to production quality. This phase enables all downstream features (ticket system, analytics, dashboards, collaborations) by providing a stable, content-managed backend and deployment infrastructure.

**Key complexity:** This phase requires simultaneous work on multiple tracks — CMS schema design (must be early to unblock dependent phases), API route conversion, auth implementation, and responsive design validation. Firebase removal is straightforward (clean deletions) but requires thorough search across 100+ components to prevent console errors.

**Primary recommendation:** Establish Sanity CMS schema first (Week 1) with all 9 content types to unblock parallel work in Phase 2+. Convert API routes in parallel (Week 1-2). Deploy early to Vercel staging to validate environment configuration. Reserve final week for responsive design audit (375px/768px/1440px) and console error cleanup using browser DevTools.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLAT-01 | Sanity CMS schema deployed with all content types (events, projects, agencies, tickets, analytics metadata, dashboard config) | Standard schema structure documented; free tier supports 10K documents; plan early to include reference fields for ticket system, project map, agency profiles |
| PLAT-02 | Next.js app deployed on Vercel with all API routes functional (replacing Firebase Cloud Functions) | Next.js 15 API routes auto-convert to Vercel serverless; no configuration needed; environment variables handled via Vercel dashboard |
| PLAT-03 | Admin staff can log into Sanity Studio and edit content — authentication required for all sensitive operations | Sanity provides built-in role-based access control; no custom auth required for Studio; API token-based access for app |
| PLAT-04 | All existing pages render without console errors, broken links, or dead features — codebase is clean and functional | Requires systematic Firebase import removal and validation using DevTools; linting catches dead code; test each page type |
| PLAT-05 | Responsive design verified on mobile (375px), tablet (768px), and desktop (1440px) viewports — all layouts adapt correctly | Tailwind CSS with mobile-first breakpoints; existing Tailwind v4 setup; browser testing at 3 viewports |
| PLAT-06 | All Firebase dependencies removed — no references to Firebase SDK, Firestore, or Cloud Functions remain | Search-and-replace Firebase imports; verify no client-side auth context; remove firebase.json and functions/ directory |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.5 | React framework, API routes, deployment to Vercel | Already in use; zero-config Vercel deployment; App Router support |
| React | 19.1.0 | UI library | Already in use; paired with Next.js 15 |
| TypeScript | 5.3.0+ | Type safety | Already in use; strict mode enabled (good); prevents runtime errors |
| Tailwind CSS | 4.0.0+ | Responsive styling, utility-first | Already in use; v4 no longer needs PostCSS dependency; built-in Rust engine |
| Sanity CMS | Latest free tier | Headless CMS for content, admin Studio | Replaces Firebase; free tier: 1 dataset, 10K docs, 200K API requests/mo, 20 users |
| @sanity/client | Latest | Query/mutation SDK for Sanity | Official package; Next.js fetch cache integration; GROQ queries |
| next-sanity | Latest | Sanity toolkit for Next.js | Official package; live editing preview, embedded Studio, TypeGen |
| Vercel | Hosting | Deployment, serverless functions, CDN | Free tier: 100GB bandwidth, 100K function invocations, unlimited deployments |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @heroicons/react | 2.2.0 | Icon library | For UI buttons, navigation, status indicators (already in use) |
| framer-motion | 11.11.17 | Animation library | For loading states, transitions (already in use; avoid overuse) |
| lucide-react | 0.532.0 | Icon library | Alternative to Heroicons; already present |
| recharts | 3.7.0 | Charting library | For analytics dashboards in Phase 3 (already in use) |
| @headlessui/react | 2.2.6 | Accessible components | For modals, dropdowns, tabs (already in use) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sanity | Strapi, ContentfulCMS | Sanity free tier sufficient; Strapi requires self-hosting; Contentful more expensive |
| Vercel | Railway, Netlify, Render | Vercel optimized for Next.js; free tier generous; no lock-in |
| Tailwind CSS | Styled Components, CSS Modules | Tailwind existing; utility-first proven; small bundle with purging |
| next-sanity | @sanity/client only | next-sanity adds live preview, Studio embedding, TypeGen — worth the small overhead |

**Installation:**
```bash
# Already present in project; verify versions
npm ls next react typescript tailwindcss

# Add Sanity if not present
npm install @sanity/client @sanity/image-url next-sanity

# Add Sanity CLI globally (one-time for schema development)
npm install -g @sanity/cli
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── page.tsx           # Homepage
│   ├── api/               # API routes (replace Cloud Functions here)
│   │   ├── tickets/       # Ticket submission, status
│   │   ├── analytics/     # Analytics aggregation
│   │   └── webhooks/      # Sanity webhooks (for real-time updates)
│   ├── admin/             # Admin-only routes
│   └── [pages]/           # Public pages
├── components/            # React components
│   ├── ui/               # Base UI (buttons, cards, forms)
│   ├── content/          # Content-driven components (news, events)
│   └── admin/            # Admin-specific UI
├── lib/                   # Utilities
│   ├── sanity.ts         # Sanity client config + queries
│   ├── sanity-queries.ts # GROQ queries for each content type
│   └── api-routes.ts     # Helper functions for API routes
├── types/               # TypeScript types
│   └── sanity.d.ts      # Generated Sanity schema types
└── data/                # Static/seed data
```

### Pattern 1: Sanity Query with Next.js Caching
**What:** Server-side GROQ queries with automatic revalidation
**When to use:** Fetching content (events, projects, ticket templates) from Sanity
**Example:**
```typescript
// lib/sanity.ts
import { defineQuery } from 'next-sanity';
import { client } from './sanity-client';

export const EVENTS_QUERY = defineQuery(`
  *[_type == "event"] {
    _id,
    title,
    date,
    category,
    description,
    image {
      asset->{url}
    }
  }
`);

// app/events/page.tsx (App Router)
export default async function EventsPage() {
  const events = await client.fetch(EVENTS_QUERY);
  return <div>{/* render events */}</div>;
}
```
**Source:** [next-sanity documentation](https://github.com/sanity-io/next-sanity), [Sanity guides](https://www.sanity.io/guides/sanity-nextjs-tailwindcss)

### Pattern 2: API Routes for External Services
**What:** Next.js API routes (converted from Cloud Functions) for Sanity mutations, webhooks, external API calls
**When to use:** Ticket submission, webhook processing, Gemini chatbot calls (Phase 4)
**Example:**
```typescript
// app/api/tickets/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity-client';

export async function POST(request: NextRequest) {
  const { title, description, investorEmail } = await request.json();

  try {
    // Create ticket document in Sanity
    const ticket = await sanityClient.create({
      _type: 'ticket',
      title,
      description,
      investorEmail,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      referenceNumber: `UIA-${Date.now()}`
    });

    return NextResponse.json({
      success: true,
      referenceNumber: ticket.referenceNumber
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
```
**Source:** [Next.js API Routes docs](https://nextjs.org/docs/pages/building-your-application/routing/api-routes), [Vercel Functions](https://vercel.com/docs/functions)

### Pattern 3: Responsive Design with Tailwind + Mobile-First
**What:** Tailwind utility classes with breakpoint prefixes (sm, md, lg, xl)
**When to use:** All components to ensure 375px/768px/1440px coverage
**Example:**
```typescript
// Responsive grid that changes columns by viewport
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

// Responsive text sizes
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Heading
</h1>

// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">Content</div>
```
**Source:** [Tailwind CSS responsive design docs](https://tailwindcss.com/docs/responsive-design)

### Pattern 4: Admin Authentication with Sanity Studio
**What:** Sanity-managed auth for Studio; API tokens for app-to-Sanity calls
**When to use:** Admin access control (PLAT-03)
**Setup:**
```typescript
// sanity.config.ts (in sanity/ folder)
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [deskTool()],
  // Auth is automatic — managed by Sanity via user accounts
});

// Environment variables in .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<server-side-only-token>  // Never expose to client
```
**Source:** [Sanity authentication docs](https://www.sanity.io/docs/content-lake/http-auth), [Custom auth options](https://www.sanity.io/docs/studio/custom-auth)

### Anti-Patterns to Avoid
- **Hardcoding API tokens in client code:** Sanity API tokens MUST stay server-side. Use env variables with NEXT_PUBLIC_ prefix only for public project ID/dataset. `SANITY_API_TOKEN` (no prefix) stays in Vercel secrets.
- **Mixing Firebase and Sanity queries:** Remove all firebase imports before adding Sanity. Don't try to migrate gradually—causes console errors and debugging nightmares.
- **Ignoring responsive breakpoints:** Don't assume "mobile will work" then polish. Test at 375px/768px/1440px from the start. Tailwind's mobile-first means base styles apply everywhere.
- **Forgetting environment variable mapping:** Vercel requires manual setup in Dashboard > Settings > Environment Variables. Code `process.env.X` but platform configuration is separate.
- **Over-optimizing before deployment:** Ship to Vercel staging first, then optimize. Free tier is generous; premature edge case handling causes complexity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content management UI for admins | Custom admin dashboard | Sanity Studio (free, included) | Studio provides rich editing, role-based access, preview; custom UI is 10+ components |
| CMS API querying | REST query builder | GROQ (Sanity) or GraphQL (optional) | GROQ is powerful, type-safe, single query language; custom parser is fragile |
| Responsive layout system | Media queries + CSS | Tailwind breakpoints | Tailwind's utility-first is proven; manual breakpoints cause inconsistency |
| Image optimization | Manual resizing | Next.js Image component + Sanity CDN | Next.js Image handles srcset, lazy load, WebP; Sanity CDN crops/resizes server-side |
| Environment variable management | .env file parsing | Vercel dashboard + process.env | Vercel auto-loads variables; custom parsing misses preview/prod/dev tiers |
| Serverless function routing | Custom Express server | Next.js API routes | Next.js routes auto-convert to serverless on Vercel; Express adds unnecessary overhead |

**Key insight:** Sanity and Next.js are designed to work together. Trying to build a custom admin interface, CMS, or auth system replicates features already in Sanity Studio (which is free). Same with Tailwind vs custom CSS—the framework handles edge cases.

## Common Pitfalls

### Pitfall 1: Firebase Imports Left in Client-Side Code
**What goes wrong:** After removing Firebase, some components still import from `firebase/app` or `firebase/firestore`, causing console errors even if the imports aren't used. Browser bundles the SDK, increasing load time and risking undefined behavior.
**Why it happens:** Search-and-replace misses nested imports, or files are deleted without confirming no imports remain. Build doesn't fail (tree-shaking removes unused code), but DevTools shows "Cannot find module" warnings.
**How to avoid:** After removing Firebase, run a grep to catch all imports: `grep -r "from.*firebase" src/`. Verify count goes to 0. Use VSCode Find to verify visually. Check DevTools after deploying to Vercel.
**Warning signs:** Console shows "Failed to load Firebase config," undefined auth errors, or spurious network requests to Firebase APIs.

### Pitfall 2: Environment Variables Not Synced Between .env.local and Vercel Dashboard
**What goes wrong:** App works locally but API routes fail on Vercel with "undefined" environment variable errors. SANITY_API_TOKEN is set locally but missing in production.
**Why it happens:** Developers assume .env.local syncs to Vercel (it doesn't). Only `NEXT_PUBLIC_*` vars can be in .env; secrets stay in Vercel Settings > Environment Variables. Easy to forget the Vercel step.
**How to avoid:** After deploying, test API routes from browser DevTools (Network tab) or Vercel logs. For sensitive vars (SANITY_API_TOKEN), always set in Vercel dashboard, never commit to git. Use pre-commit hook to prevent accidental leaks.
**Warning signs:** API routes return 500 errors. Logs show "process.env.SANITY_API_TOKEN is undefined." Mutation attempts fail silently.

### Pitfall 3: Sanity Free Tier Limits Hit Unexpectedly
**What goes wrong:** After deploying, API requests suddenly fail with HTTP 429. Monthly request limit (200K) is reached because of over-fetching or inefficient queries.
**Why it happens:** Developers query all fields on every page load, or cache is disabled. Single page doing `client.fetch('*[_type == "project"]')` with 9,922 documents can burn quota in days.
**How to avoid:** Use Next.js caching (`revalidate: 3600` for 1-hour cache). Query only needed fields with GROQ projections: `*[_type == "project"] { _id, title, location }` not `*[_type == "project"]`. Monitor quota in Sanity Dashboard > API Usage. Plan to add Growth tier ($99/mo) if quota needs exceed 200K/mo.
**Warning signs:** Sanity Dashboard shows 80% quota used. API responses slow. Users see "CMS temporarily unavailable" errors.

### Pitfall 4: Responsive Design Assumptions (Not Testing Early)
**What goes wrong:** Assume desktop CSS will "just work" on mobile (375px). After launch, discovery: text wraps awkwardly, buttons are too small, images overflow. Rewrite spans multiple components.
**Why it happens:** Testing only at desktop or tablet. Tailwind's mobile-first means unprefixed classes apply everywhere, so base styles must be mobile-appropriate.
**How to avoid:** Test responsive breakpoints (375px, 768px, 1440px) from day 1. Use browser DevTools mobile view or physical devices. For each page, verify: typography scales, images don't overflow, buttons are 44px+ touch targets, spacing adapts.
**Warning signs:** Mobile breakpoint classes added last-minute. Buttons are 32px (too small for touch). Images crop unexpectedly on tablets.

### Pitfall 5: Admin Authentication Not Configured
**What goes wrong:** Deploy Sanity Studio without role-based access control. All users (including interns) can edit/delete sensitive content (archived projects, completed tickets).
**Why it happens:** Sanity's default auth is "anyone with project access," which works for small teams but isn't enterprise-ready. Forgot to define role-based policies.
**How to avoid:** Before Phase 2, configure Sanity RBAC: define roles (Editor, Reviewer, Admin) and grant permissions per content type. Document which roles can edit events, projects, tickets. Restrict sensitive fields (SLA config, archived records) to Admins only.
**Warning signs:** All users see edit buttons on all content. Deletion is unrestricted. No audit trail for changes.

### Pitfall 6: Vercel Free Tier Exceeded During Development
**What goes wrong:** Deploy to Vercel, then iterate rapidly (20+ deployments, heavy API route usage in development). Hit 100K function invocations or 100GB bandwidth limit mid-month.
**Why it happens:** Each `npm run build && vercel --prod` = 1 build (counts toward invocations). API routes called in development count. Free tier seems generous until actual usage revealed.
**How to avoid:** Monitor Vercel Dashboard > Usage during development. Use preview deployments for testing (don't trigger production). Cache API responses aggressively (ISR, revalidate). Plan for Growth tier ($20/mo) if usage exceeds free limits.
**Warning signs:** Vercel dashboard shows 80% invocation usage. Builds slow down mid-month. Email from Vercel: "You've reached your monthly limit."

## Code Examples

Verified patterns from official sources:

### Sanity Client Setup
```typescript
// lib/sanity-client.ts
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN, // Server-side only
});
```
**Source:** [next-sanity GitHub](https://github.com/sanity-io/next-sanity), [Sanity client setup docs](https://www.sanity.io/docs/client-libraries/js-client)

### Sanity Schema Example (Content Type: Event)
```typescript
// sanity/schemaTypes/event.ts
export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'date', title: 'Date', type: 'datetime' },
    { name: 'category', title: 'Category', type: 'string',
      options: { list: ['UIA Forum', 'Government Mission', 'Sector Symposium', 'EAC Summit', 'Webinar'] } },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
    { name: 'registrationUrl', title: 'Registration URL', type: 'url' },
  ],
  preview: {
    select: { title: 'title', date: 'date' },
    prepare(selection) {
      return { title: selection.title, subtitle: selection.date };
    }
  }
};
```
**Source:** [Sanity schema docs](https://www.sanity.io/docs/apis-and-sdks/introduction-to-schemas)

### Next.js API Route (Replace Cloud Function)
```typescript
// app/api/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await client.fetch(`*[_type == "ticket" && referenceNumber == $ref][0]`, {
      ref: params.id
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
```
**Source:** [Next.js API Routes docs](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

### Responsive Grid Component
```typescript
// components/ProjectGrid.tsx
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6 lg:p-8">
      {projects.map(project => (
        <div key={project._id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2">{project.title}</h3>
          <p className="text-sm sm:text-base text-gray-600">{project.sector}</p>
        </div>
      ))}
    </div>
  );
}
```
**Source:** [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Firebase Cloud Functions | Next.js API routes | 2023+ | Simpler local dev, zero config on Vercel, better TypeScript support |
| Firestore for content | Headless CMS (Sanity/Strapi) | 2022+ | Dedicated admin UI, content versioning, workflow approval, easier content import |
| Manual responsive CSS media queries | Tailwind utility-first with breakpoints | 2020+ | Consistent spacing/sizing, smaller CSS bundle, faster development |
| Custom admin dashboards | Studio-provided tools | 2020+ | Less code, built-in RBAC, live preview, no maintenance |
| process.env in .env files | Environment management via host platform | 2023+ | Separation of secrets, per-deployment configuration, no git risk |

**Deprecated/outdated:**
- **Firebase Hosting for Next.js:** Firebase Hosting can host Next.js but Vercel is purpose-built for it (zero-config, better DX, built-in edge functions). Verdict: Use Vercel.
- **Custom CMS with Firestore:** Sanity/Strapi provide editorial workflow, preview, versioning. Rolling your own = maintenance burden. Verdict: Use managed CMS.
- **Manual responsive breakpoints:** CSS media queries are fragile, inconsistent across components. Tailwind breakpoints are atomic, reusable. Verdict: Tailwind.

## Open Questions

1. **What is the current size of Firebase data to be exported/imported?**
   - What we know: Existing pages suggest some project/event/agency data exists in Firestore
   - What's unclear: Volume of historical data (especially tickets from Phase 2 forward)
   - Recommendation: Export Firebase data early (Week 0) to estimate Sanity quota impact. If >10K documents, plan for Growth tier.

2. **Are there existing API Cloud Functions that do complex logic (not just CRUD)?**
   - What we know: package.json shows `firebase:deploy:functions` — some functions exist
   - What's unclear: Which functions need conversion vs. can be deleted
   - Recommendation: Audit `treat/functions` directory. Document each function's purpose and map to Next.js API routes.

3. **Who will manage Sanity content after Phase 1?**
   - What we know: Phase success includes "admin staff can log in and edit content"
   - What's unclear: Training needed? Role structure? Will client use Sanity CLI or only web Studio?
   - Recommendation: Document Studio role-based access after Phase 1. Plan training session.

4. **What are the exact mobile breakpoints for this project's design system?**
   - What we know: Requirement is 375px (mobile), 768px (tablet), 1440px (desktop)
   - What's unclear: Are there sub-breakpoints (e.g., 480px for landscape mobile)?
   - Recommendation: Test at specified 3 breakpoints as baseline. Add sm:, lg:, xl: prefixes in Tailwind. Refine later if needed.

5. **Is there a design system or component library guide?**
   - What we know: Existing components use Heroicons, Tailwind, Framer Motion
   - What's unclear: Button sizes, color palette, typography scale consistency
   - Recommendation: Audit existing components and document pattern before Phase 2. Establish consistent spacing (4px grid).

## Validation Architecture

> This phase is primarily infrastructure + cleanup. Validation happens via:
> 1. **Manual testing:** DevTools, responsive viewport testing, console error check
> 2. **Linting:** `npm run lint` to catch dead code, unused imports
> 3. **Type checking:** `npm run type-check` to catch TypeScript errors
> 4. **Build verification:** `npm run build` and `npm run start` locally
> 5. **Deployment check:** Deploy to Vercel staging, verify all API routes work, check environment variables

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Validation Method | Automated? |
|--------|----------|-----------|-------------------|-----------|
| PLAT-01 | Sanity schema deployed with 9 content types | Integration | Query each type via Sanity API/Studio; confirm fields match spec | Manual (Sanity Dashboard) |
| PLAT-02 | Next.js API routes work (no Firebase deps) | API + Integration | `npm run build`, deploy to Vercel staging, test `/api/` endpoints | Manual + DevTools |
| PLAT-03 | Admin auth works; roles assigned | Integration | Log into Sanity Studio with test user; verify role-based visibility | Manual (Studio) |
| PLAT-04 | No console errors; no broken links | Smoke test | Open DevTools on each page; verify console is clean (0 errors) | Manual |
| PLAT-05 | Responsive design works at 3 breakpoints | Visual regression | DevTools mobile emulation: 375px, 768px, 1440px; verify no overflow/wrap | Manual |
| PLAT-06 | No Firebase imports in codebase | Code analysis | `grep -r "firebase" src/ && echo "FAIL" \|\| echo "PASS"` | ✅ Automated |

### Sampling Rate
- **Per task commit:** After removing Firebase, run linting: `npm run lint && npm run type-check`
- **Per wave merge:** Full build: `npm run build`. Deploy to Vercel preview. Test at 375px/768px/1440px.
- **Phase gate:** Before `/gsd:verify-work`, run full suite:
  ```bash
  npm run lint
  npm run type-check
  npm run build
  grep -r "firebase" src/ || echo "✓ No Firebase imports"
  ```
  All must pass green.

### Wave 0 Gaps
None — existing test infrastructure (lint, type-check, build) covers Phase 1 validation needs. No automated test framework needed yet (Jest is available but no test suite exists). Phase 1 is manual validation + linting.

## Sources

### Primary (HIGH confidence)
- [next-sanity GitHub](https://github.com/sanity-io/next-sanity) - Official Sanity toolkit for Next.js with setup, caching, live preview patterns
- [Sanity documentation](https://www.sanity.io/docs/) - Official CMS docs covering schema design, authentication, API limits
- [Next.js 15 documentation](https://nextjs.org/docs) - Official Next.js docs for App Router, API routes, environment variables
- [Tailwind CSS 4 documentation](https://tailwindcss.com/docs) - Official responsive design patterns and utility classes
- [Vercel documentation](https://vercel.com/docs) - Official Vercel deployment, environment variables, free tier specs

### Secondary (MEDIUM confidence)
- [Integrating Sanity CMS into an Existing Next.js 15 & TypeScript App](https://dilani-jay.medium.com/integrating-sanity-cms-into-an-existing-next-js-15-typescript-app-a5d3d054727e) - Medium article verified against official Sanity docs
- [Sanity + Next.js integration guides](https://www.sanity.io/exchange/framework=nextjs) - Sanity official integrations page with curated resources
- [Responsive design breakpoints 2026](https://www.browserstack.com/guide/responsive-design-breakpoints) - Industry standard breakpoints with testing approaches
- [Next.js Vercel deployment guide 2026](https://dev.to/zahg_81752b307f5df5d56035/the-complete-guide-to-deploying-nextjs-apps-in-2026-vercel-self-hosted-and-everything-in-between-48ia) - Community guide updated for current Vercel features

### Tertiary (LOW confidence — context only)
- Firebase/Next.js integration articles referenced for troubleshooting, not adoption

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH - All libraries verified in package.json; versions match official docs
- **Architecture patterns:** HIGH - All patterns sourced from official Next.js/Sanity docs
- **Pitfalls:** HIGH - Derived from common issues in official docs + community discussions
- **Free tier limits:** MEDIUM - Sanity free tier specs confirmed in pricing docs; actual quota impact depends on data volume (not yet measured)

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable for 30 days; Next.js and Sanity rarely break in minor releases)

---

*Research complete. Phase 1 is ready for planning. Recommend establishing Sanity schema as first task to unblock parallel work in downstream phases.*
