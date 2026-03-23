// Shared enum constants — single source of truth for frontend and backend
// Backend (C#): OscApi.Models.Enums mirrors these values exactly

export const TICKET_CATEGORIES = [
  'general_inquiry',
  'procedure_query',
  'application_support',
  'license_delay',
  'complaint',
  'vip',
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  'New',
  'Assigned',
  'InProgress',
  'PendingExternal',
  'Resolved',
  'Closed',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const AUTHOR_ROLES = ['Investor', 'Officer', 'System'] as const;
export type AuthorRole = (typeof AUTHOR_ROLES)[number];

export const CHAT_LANGUAGES = ['En', 'Fr', 'Ar', 'Zh', 'Sw'] as const;
export type ChatLanguage = (typeof CHAT_LANGUAGES)[number];

export const CHAT_SENTIMENTS = ['Positive', 'Neutral', 'Negative'] as const;
export type ChatSentiment = (typeof CHAT_SENTIMENTS)[number];

export const CHAT_TIERS = ['Ai', 'Kb', 'Suggestions'] as const;
export type ChatTier = (typeof CHAT_TIERS)[number];

export const INVESTOR_TYPES = ['Individual', 'Institutional', 'Foreign'] as const;
export type InvestorType = (typeof INVESTOR_TYPES)[number];

export const SLA_HOURS: Record<TicketCategory, number> = {
  general_inquiry: 24,
  procedure_query: 8,
  application_support: 4,
  license_delay: 2,
  complaint: 2,
  vip: 1,
};
