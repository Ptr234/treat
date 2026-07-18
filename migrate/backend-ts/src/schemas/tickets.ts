import { z } from 'zod';

/** Mirrors Validators/CreateTicketValidator.cs's CreateTicketValidator exactly. */
const VALID_CATEGORIES = [
  'general_inquiry', 'procedure_query', 'application_support', 'license_delay', 'complaint', 'vip',
] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const createTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1).refine((c) => (VALID_CATEGORIES as readonly string[]).includes(c), 'Invalid category'),
  priority: z.string().optional().refine(
    (p) => !p || (VALID_PRIORITIES as readonly string[]).includes(p),
    'Invalid priority'
  ),
  contactEmail: z.string().min(1).email(),
  contactName: z.string().min(1).max(100),
  contactPhone: z.string().max(30).optional(),
  investorNationality: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
  investmentSize: z.string().max(50).optional(),
  isEscalated: z.boolean().optional().default(false),
});

/** No FluentValidation validator exists for this in ASP.NET — TicketService's own TryParse handles status/priority validity. */
export const updateTicketSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
  assignedAgencyCode: z.string().optional(),
  satisfactionRating: z.number().int().optional(),
  satisfactionComment: z.string().optional(),
  isEscalated: z.boolean().optional(),
});

export const publicTicketUpdateSchema = z.object({
  email: z.string().min(1),
  isEscalated: z.boolean().optional(),
  satisfactionRating: z.number().int().optional(),
  satisfactionComment: z.string().optional(),
});

export const staffMessageSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional().default(false),
});

export const publicCommentSchema = z.object({
  content: z.string().min(1),
  authorName: z.string().min(1),
  authorEmail: z.string().min(1),
});

/** Converts the API's snake_case category/priority values to the PascalCase stored/enum form — mirrors TicketService.ToPascalCase. */
export function toPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((s) => (s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s))
    .join('');
}
