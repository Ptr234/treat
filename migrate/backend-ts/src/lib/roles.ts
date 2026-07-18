/** Mirrors backend/src/OscApi/Common/Roles.cs — keep in sync until that file is deleted. */
export const Roles = {
  Dg: 'dg',
  Admin: 'admin',
  AgencyOfficer: 'agency_officer',
  User: 'user',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

/** Roles with unrestricted back-office access. */
export const ADMIN_LEVEL_ROLES: Role[] = [Roles.Dg, Roles.Admin];

/** All back-office staff (admin-level plus agency officers, who are then scoped to their own agency per-query). */
export const STAFF_ROLES: Role[] = [Roles.Dg, Roles.Admin, Roles.AgencyOfficer];

export function isAdminLevel(role: string | undefined): boolean {
  return !!role && (ADMIN_LEVEL_ROLES as string[]).includes(role);
}

export function isAgencyOfficer(role: string | undefined): boolean {
  return role === Roles.AgencyOfficer;
}

export function isStaff(role: string | undefined): boolean {
  return !!role && (STAFF_ROLES as string[]).includes(role);
}
