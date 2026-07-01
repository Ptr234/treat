/**
 * Normalizers that bridge the ASP.NET backend's enum serialization (PascalCase,
 * e.g. "InProgress", "GeneralInquiry", "Low") to the string literal unions the
 * frontend uses ("IN_PROGRESS", "general_inquiry", "low").
 *
 * Without this, status/priority filtering, sorting, stats, SLA "completed"
 * detection and colour/label lookups all silently fail because the raw backend
 * values never match the expected keys. Each function is tolerant of values that
 * are already in the frontend format, so it is safe to apply unconditionally.
 */
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types';

export type AuthorRole = 'investor' | 'officer' | 'system';

// Reduce any casing/separator style to a bare alphanumeric key for lookup.
const canon = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

const STATUS_MAP: Record<string, TicketStatus> = {
  new: 'NEW',
  assigned: 'ASSIGNED',
  inprogress: 'IN_PROGRESS',
  pendingexternal: 'PENDING_EXTERNAL',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

const PRIORITY_MAP: Record<string, TicketPriority> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

const CATEGORY_MAP: Record<string, TicketCategory> = {
  generalinquiry: 'general_inquiry',
  procedurequery: 'procedure_query',
  applicationsupport: 'application_support',
  licensedelay: 'license_delay',
  complaint: 'complaint',
  vip: 'vip',
};

const ROLE_MAP: Record<string, AuthorRole> = {
  investor: 'investor',
  officer: 'officer',
  system: 'system',
};

export const normalizeStatus = (raw: string | undefined | null): TicketStatus =>
  STATUS_MAP[canon(raw ?? '')] ?? 'NEW';

export const normalizePriority = (raw: string | undefined | null): TicketPriority =>
  PRIORITY_MAP[canon(raw ?? '')] ?? 'medium';

export const normalizeCategory = (raw: string | undefined | null): TicketCategory =>
  CATEGORY_MAP[canon(raw ?? '')] ?? 'general_inquiry';

export const normalizeAuthorRole = (raw: string | undefined | null): AuthorRole =>
  ROLE_MAP[canon(raw ?? '')] ?? 'investor';

/** Whole hours between two ISO timestamps, or null if either is missing/invalid. */
export function hoursBetween(startIso: string | undefined | null, endIso: string | undefined | null): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return (end - start) / (1000 * 60 * 60);
}
