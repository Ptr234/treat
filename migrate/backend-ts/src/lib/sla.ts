import type { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../db/schema';

type TicketCategory = (typeof TICKET_CATEGORIES)[number];
type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/** Mirrors backend/src/OscApi/Common/SlaCalculator.cs exactly. */
const SLA_HOURS: Record<TicketCategory, number> = {
  GeneralInquiry: 24,
  ProcedureQuery: 8,
  ApplicationSupport: 4,
  LicenseDelay: 2,
  Complaint: 2,
  Vip: 1,
};

// A high urgency can only tighten the deadline, never loosen the category's.
const PRIORITY_CEILING_HOURS: Record<TicketPriority, number> = {
  Critical: 2,
  High: 8,
  Medium: 24,
  Low: 48,
};

export function computeSla(
  category: TicketCategory,
  priority: TicketPriority = 'Medium'
): { hours: number; deadline: Date } {
  const baseHours = SLA_HOURS[category] ?? 24;
  const ceiling = PRIORITY_CEILING_HOURS[priority] ?? 24;
  const hours = Math.min(baseHours, ceiling);
  return { hours, deadline: new Date(Date.now() + hours * 3600_000) };
}
