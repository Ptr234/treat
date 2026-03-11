import { z } from 'zod';

// ── Enum constants (single source of truth) ─────────────────────────

export const TICKET_CATEGORIES = [
  'general_inquiry',
  'procedure_query',
  'application_support',
  'license_delay',
  'complaint',
  'vip',
] as const;

export const TICKET_STATUSES = [
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_EXTERNAL',
  'RESOLVED',
  'CLOSED',
] as const;

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const AUTHOR_ROLES = ['investor', 'officer', 'system'] as const;

export const CHAT_LANGUAGES = ['en', 'fr', 'ar', 'zh', 'sw'] as const;

// ── SLA hours per category ──────────────────────────────────────────

export const SLA_HOURS: Record<string, number> = {
  general_inquiry: 24,
  procedure_query: 8,
  application_support: 4,
  license_delay: 2,
  complaint: 2,
  vip: 1,
};

// ── Zod schemas ─────────────────────────────────────────────────────

const sanityFileRefSchema = z.object({
  _type: z.literal('file'),
  _key: z.string().optional(),
  asset: z.object({
    _type: z.literal('reference'),
    _ref: z.string(),
  }),
});

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES).default('medium'),
  contactEmail: z.string().email('Invalid email address'),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactPhone: z.string().max(30).optional().default(''),
  investorNationality: z.string().max(100).optional().default(''),
  sector: z.string().max(100).optional().default(''),
  investmentSize: z.string().max(50).optional().default(''),
  documents: z.array(sanityFileRefSchema).max(5).optional().default([]),
});

export const ticketUpdateSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assignee: z.string().max(100).optional(),
    assignedAgency: z.string().optional(), // Sanity document _id
    satisfactionRating: z.number().min(1).max(5).optional(),
    satisfactionComment: z.string().max(1000).optional(),
    isEscalated: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

export const ticketMessageSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
  authorName: z.string().min(1, 'Author name is required').max(100),
  authorRole: z.enum(AUTHOR_ROLES),
  authorEmail: z.string().email().optional(),
  isInternal: z.boolean().default(false),
});

export const paginationSchema = z.object({
  from: z.coerce.number().int().min(0).default(0),
  to: z.coerce.number().int().min(1).default(50),
}).refine((data) => data.to > data.from, {
  message: '"to" must be greater than "from"',
});

export const projectsQuerySchema = z.object({
  sector: z.string().optional(),
  mapOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const createInvestorProfileSchema = z.object({
  // Contact info
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(30),
  nationality: z.string().min(1, 'Nationality is required').max(100),
  companyName: z.string().max(200).optional().default(''),
  position: z.string().max(100).optional().default(''),
  // Investment profile
  investorType: z.enum(['individual', 'institutional', 'foreign']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  investmentGoal: z.enum(['growth', 'income', 'diversification', 'strategic']),
  // Capacity
  investmentAmount: z.string().min(1),
  timeHorizon: z.enum(['short-term', 'medium-term', 'long-term']),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  // Sector
  primarySector: z.string().min(1),
  secondarySectors: z.array(z.string()).optional().default([]),
  specificInterests: z.string().max(2000).optional().default(''),
  // Readiness
  capitalSource: z.enum(['savings', 'loan', 'partnership', 'grant']),
  timeframe: z.enum(['immediate', '3-months', '6-months', '1-year']),
  supportNeeded: z.array(z.string()).optional().default([]),
});

// Public-facing ticket update (email-verified escalation & rating only)
export const publicTicketUpdateSchema = z
  .object({
    email: z.string().email('Email is required for verification'),
    isEscalated: z.literal(true).optional(),
    satisfactionRating: z.number().min(1).max(5).optional(),
    satisfactionComment: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.isEscalated !== undefined ||
      data.satisfactionRating !== undefined ||
      data.satisfactionComment !== undefined,
    { message: 'At least one update field must be provided' }
  );

// Public comment on a ticket (email-verified)
export const publicCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(5000),
  authorName: z.string().min(1, 'Name is required').max(100),
  authorEmail: z.string().email('Email is required for verification'),
});

export const chatbotMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
  language: z.enum(CHAT_LANGUAGES).default('en'),
  sessionId: z.string().optional(),
});
