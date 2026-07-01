/**
 * Client-safe role predicates for the OSC back-office RBAC model.
 *
 * Mirrors the backend role model (backend/src/OscApi/Common/Roles.cs):
 *   - admin-level (full back-office access): `admin`, `dg` (Director General)
 *   - all staff (admin-level plus agency officers): + `agency_officer`
 *
 * Use these instead of comparing `role === 'admin'` directly, so the Director
 * General (a leadership superuser) is never accidentally locked out.
 */

export const ADMIN_LEVEL_ROLES = ['admin', 'dg'] as const;
export const STAFF_ROLES = ['admin', 'dg', 'agency_officer'] as const;

/** Full back-office access: system admins and the Director General. */
export function isAdminLevel(role: string | null | undefined): boolean {
  return ADMIN_LEVEL_ROLES.includes((role ?? '') as (typeof ADMIN_LEVEL_ROLES)[number]);
}

/** Any back-office staff member (admin-level plus agency officers). */
export function isStaff(role: string | null | undefined): boolean {
  return STAFF_ROLES.includes((role ?? '') as (typeof STAFF_ROLES)[number]);
}
