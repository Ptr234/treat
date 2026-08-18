/**
 * Centralized API client for the OSC Digital Tool.
 *
 * Routes that have been migrated to the ASP.NET backend are proxied
 * to NEXT_PUBLIC_BACKEND_URL. All others stay on the Next.js server.
 *
 * Usage:
 *   const res = await apiFetch('/api/auth/login', { method: 'POST', body: ... });
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

// Routes that are served by the ASP.NET backend.
// Add routes here as they are migrated.
const MIGRATED_PREFIXES = [
  '/api/auth/',
  '/api/me',
  '/api/tickets',
  '/api/dashboard',
  '/api/chatbot',
  '/api/investors',
  '/api/business-registrations',
  '/api/messages',
  '/api/upload',
  '/api/health',
  '/api/contact',
  '/api/settings',
  '/api/admin',
  '/api/analytics',
  '/api/audit',
];

/**
 * Resolve an /api path to the ASP.NET backend when configured, otherwise keep
 * it relative (Next.js route). Exported for callers that need a raw URL
 * (file uploads, download links) rather than a JSON fetch.
 */
export function resolveApiUrl(path: string): string {
  if (BACKEND_URL && MIGRATED_PREFIXES.some((p) => path.startsWith(p))) {
    return `${BACKEND_URL}${path}`;
  }
  return path; // relative — same Next.js origin
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const url = resolveApiUrl(path);

  // Don't force a JSON content type onto FormData bodies — the browser must
  // set multipart/form-data with its boundary itself.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers };

  const res = await fetch(url, {
    ...options,
    credentials: 'include', // always send cookies cross-origin
    headers,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? `Request failed with status ${res.status}`,
    };
  }

  return json ?? { success: true };
}
