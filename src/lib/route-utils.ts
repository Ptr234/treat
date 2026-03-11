// Route utilities for handling dynamic routing in Next.js with TypeScript

export function createDynamicRoute(path: string): string {
  // Helper function to handle dynamic routes that TypeScript can't validate at compile time
  return path;
}

// Type-safe route builder for known routes
export const routes = {
  home: '/',
  about: '/about',
  services: '/services',
  investments: '/investments',
  business: {
    registration: '/business/registration',
  },
  tools: {
    base: '/tools',
    taxCalculator: '/tools/tax-calculator',
    roiCalculator: '/tools/roi-calculator',
    invoiceGenerator: '/tools/invoice-generator',
    documentChecklist: '/tools/document-checklist',
  },
  downloads: '/downloads',
  support: '/support',
  profile: '/profile',
  search: '/search',
  agencies: '/agencies',
  admin: {
    base: '/admin',
    applications: '/admin/applications',
    users: '/admin/users',
    reports: '/admin/reports',
    settings: '/admin/settings',
    alerts: '/admin/alerts',
  },
} as const;

// Helper for external links
export function createExternalLink(url: string): string {
  return url;
}