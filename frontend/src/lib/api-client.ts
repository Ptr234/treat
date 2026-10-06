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

// The ASP.NET backend's public routes are versioned (/api/v1/...); its
// health check is an ops endpoint and stays unversioned by convention
// (ApiDesign.MD §5/§17). Next.js's own fallback routes are unversioned too —
// this prefix only applies once a path is routed to BACKEND_URL below.
const UNVERSIONED_BACKEND_PATHS = ['/api/health'];

/**
 * Resolve an /api path to the ASP.NET backend when configured, otherwise keep
 * it relative (Next.js route). Exported for callers that need a raw URL
 * (file uploads, download links) rather than a JSON fetch.
 */
export function resolveApiUrl(path: string): string {
  if (BACKEND_URL && MIGRATED_PREFIXES.some((p) => path.startsWith(p))) {
    const versioned = UNVERSIONED_BACKEND_PATHS.some((p) => path.startsWith(p))
      ? path
      : path.replace(/^\/api\//, '/api/v1/');
    return `${BACKEND_URL}${versioned}`;
  }
  return path; // relative — same Next.js origin
}

// Without a ceiling, a slow/stalled backend (cold start, DB contention, a
// dropped connection the browser never surfaces as an error) leaves the
// caller's promise pending forever — e.g. a "Signing in..." button stuck
// disabled indefinitely with no error and no way to retry. Callers that pass
// their own `signal` are trusted to manage their own lifetime.
const DEFAULT_TIMEOUT_MS = 20_000;

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

  const timeoutController = options.signal ? null : new AbortController();
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), DEFAULT_TIMEOUT_MS)
    : null;

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include', // always send cookies cross-origin
      headers,
      signal: options.signal ?? timeoutController?.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      // ASP.NET backend errors are RFC 7807 problem+json ({ detail, title, ... });
      // Next.js fallback routes still return the legacy { success, error } shape.
      // Normalise both to the one error string callers read.
      return {
        success: false,
        error: json?.detail ?? json?.error ?? json?.title ?? `Request failed with status ${res.status}`,
      };
    }

    return json ?? { success: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError' && !options.signal) {
      return { success: false, error: 'Request timed out. Please check your connection and try again.' };
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
