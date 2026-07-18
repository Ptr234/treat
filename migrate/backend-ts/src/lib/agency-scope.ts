import { isAgencyOfficer } from './roles';
import type { SessionClaims } from './jwt';

/**
 * Mirrors the identical `ResolveAgencyScope`/`AgencyScope` private helper
 * duplicated in TicketsController.cs and DocumentsController.cs: the agency
 * an agency_officer is limited to, or null for admin-level staff (who see
 * everything). `misconfigured` is true when an officer has no agency code on
 * their session — the caller should 403 in that case.
 */
export function resolveAgencyScope(session: SessionClaims | undefined): { scope: string | null; misconfigured: boolean } {
  if (!session || !isAgencyOfficer(session.role)) return { scope: null, misconfigured: false };
  if (!session.agencyCode) return { scope: null, misconfigured: true };
  return { scope: session.agencyCode, misconfigured: false };
}
