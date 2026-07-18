import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { getDb } from '../db/client';
import { tickets, ticketMessages } from '../db/schema';
import { optionalAuth, requireStaff } from '../middleware/auth';
import { resolveAgencyScope } from '../lib/agency-scope';
import { computeSla } from '../lib/sla';
import { stripHtml } from '../lib/sanitize';
import { toPascalCase } from '../schemas/tickets';
import { generateTicketReference, withUniqueReferenceRetry } from '../lib/reference-number';
import { checkRateLimit, clientIp, RateLimitPolicy } from '../lib/rate-limit';
import {
  sendTicketConfirmationEmail, sendTicketStatusUpdateEmail, sendEscalationNotificationEmail,
} from '../lib/email';
import { getEscalationEmails, getSetting, ESCALATION_MESSAGE_KEY } from '../lib/settings';
import { normalizePagination, MAX_PAGE_SIZE } from '../lib/pagination';
import { ok, fail } from '../lib/response';
import {
  createTicketSchema, updateTicketSchema, publicTicketUpdateSchema,
  staffMessageSchema, publicCommentSchema,
} from '../schemas/tickets';
import type { AppEnv } from '../app-env';

export const ticketsRoute = new Hono<AppEnv>();

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const VALID_STATUSES = ['new', 'assigned', 'in_progress', 'pending_external', 'resolved', 'closed'] as const;

// ── GET / — list (staff only, agency-scoped) ─────────────────────────────

ticketsRoute.get('/', requireStaff, async (c) => {
  const q = c.req.query();
  const page = q.page ? parseInt(q.page, 10) : undefined;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : undefined;
  const from = q.from ? parseInt(q.from, 10) : undefined;
  const to = q.to ? parseInt(q.to, 10) : undefined;

  let start = 0, end = 50;
  if (page !== undefined || pageSize !== undefined) {
    const p = page ?? 1;
    const ps = pageSize ?? 50;
    if (p < 1 || ps < 1 || ps > MAX_PAGE_SIZE) {
      return c.json(fail(`Invalid pagination parameters: page must be >= 1, pageSize must be between 1 and ${MAX_PAGE_SIZE}`), 400);
    }
    start = (p - 1) * ps;
    end = start + ps;
  } else if (from !== undefined || to !== undefined) {
    start = from ?? 0;
    end = to ?? 50;
  }

  const { scope, misconfigured } = resolveAgencyScope(c.get('session'));
  if (misconfigured) return c.json(fail('Forbidden'), 403);

  const db = getDb(c.env);
  const { skip, take } = normalizePagination(start, end);

  const whereClause = scope ? eq(tickets.assignedAgencyCode, scope) : undefined;

  const [rows, [{ total } = { total: 0 }]] = await Promise.all([
    db.select().from(tickets).where(whereClause).orderBy(desc(tickets.createdAt)).limit(take).offset(skip),
    db.select({ total: sql<number>`count(*)::int` }).from(tickets).where(whereClause),
  ]);

  const ids = rows.map((t) => t.id);
  const counts = ids.length
    ? await db.select({ ticketId: ticketMessages.ticketId, count: sql<number>`count(*)::int` })
        .from(ticketMessages).where(inArray(ticketMessages.ticketId, ids)).groupBy(ticketMessages.ticketId)
    : [];
  const countByTicket = new Map(counts.map((r) => [r.ticketId, r.count]));

  const ticketsOut = rows.map((t) => ({
    referenceNumber: t.referenceNumber, title: t.title, category: t.category, priority: t.priority, status: t.status,
    contactName: t.contactName, contactEmail: t.contactEmail, assignedAgencyCode: t.assignedAgencyCode,
    assignee: t.assignee, isEscalated: t.isEscalated, slaDeadlineAt: t.slaDeadlineAt, createdAt: t.createdAt,
    resolvedAt: t.resolvedAt, messageCount: countByTicket.get(t.id) ?? 0,
  }));

  return c.json(ok({ tickets: ticketsOut, total }));
});

// ── POST / — create (public, rate-limited) ───────────────────────────────

ticketsRoute.post('/', zValidator('json', createTicketSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const body = c.req.valid('json');
  const category = toPascalCase(body.category) as (typeof tickets.$inferSelect)['category'];
  const priorityText = body.priority?.trim() || 'medium';
  const priority = (priorityText[0]!.toUpperCase() + priorityText.slice(1)) as (typeof tickets.$inferSelect)['priority'];
  const { hours: slaHours, deadline: slaDeadline } = computeSla(category, priority);

  const db = getDb(c.env);
  const contactEmail = body.contactEmail.toLowerCase().trim();
  const contactName = stripHtml(body.contactName);
  const title = stripHtml(body.title);

  const created = await withUniqueReferenceRetry(async () => {
    const referenceNumber = await generateTicketReference(db);
    const [row] = await db.insert(tickets).values({
      referenceNumber,
      title,
      description: stripHtml(body.description),
      category,
      priority,
      contactName,
      contactEmail,
      contactPhone: body.contactPhone,
      investorNationality: body.investorNationality,
      sector: body.sector,
      investmentSize: body.investmentSize,
      slaDeadlineHours: slaHours,
      slaDeadlineAt: slaDeadline,
      isEscalated: body.isEscalated,
    }).returning();
    return row!;
  });

  c.executionCtx.waitUntil(
    sendTicketConfirmationEmail(c.env, { to: contactEmail, contactName, referenceNumber: created.referenceNumber, title })
  );

  return c.json(ok({
    referenceNumber: created.referenceNumber, title: created.title, status: created.status, slaDeadlineAt: created.slaDeadlineAt,
  }), 201);
});

// ── GET /:refNumber — get by reference (public w/ email, or staff) ───────

ticketsRoute.get('/:refNumber', optionalAuth, async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const refNumber = c.req.param('refNumber');
  const email = c.req.query('email');
  const session = c.get('session');
  const isStaffCaller = session ? (session.role === 'dg' || session.role === 'admin' || session.role === 'agency_officer') : false;
  const { scope, misconfigured } = resolveAgencyScope(session);
  if (misconfigured) return c.json(fail('Forbidden'), 403);

  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);

  const notFoundOrForbidden = () => (isStaffCaller
    ? c.json(fail('Ticket not found'), 404)
    : c.json(fail('Email does not match ticket'), 403));

  if (!ticket) return notFoundOrForbidden();

  if (!isStaffCaller) {
    if (!email || email.toLowerCase().trim() !== ticket.contactEmail) return notFoundOrForbidden();
  } else if (scope && ticket.assignedAgencyCode !== scope) {
    return c.json(fail('Ticket not found'), 404);
  }

  const msgs = await db.select().from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticket.id)).orderBy(ticketMessages.sentAt);
  const visibleMessages = msgs
    .filter((m) => isStaffCaller || !m.isInternal)
    .map((m) => ({ content: m.content, authorName: m.authorName, authorRole: m.authorRole, authorEmail: m.authorEmail, isInternal: m.isInternal, sentAt: m.sentAt }));

  return c.json(ok({
    referenceNumber: ticket.referenceNumber, title: ticket.title, description: ticket.description,
    category: ticket.category, priority: ticket.priority, status: ticket.status,
    contactName: ticket.contactName, contactEmail: ticket.contactEmail, contactPhone: ticket.contactPhone,
    investorNationality: ticket.investorNationality, sector: ticket.sector, investmentSize: ticket.investmentSize,
    assignee: ticket.assignee, assignedAgencyCode: ticket.assignedAgencyCode,
    slaDeadlineHours: ticket.slaDeadlineHours, slaDeadlineAt: ticket.slaDeadlineAt,
    satisfactionRating: ticket.satisfactionRating, satisfactionComment: ticket.satisfactionComment,
    isEscalated: ticket.isEscalated, escalatedAt: ticket.escalatedAt,
    createdAt: ticket.createdAt, resolvedAt: ticket.resolvedAt, closedAt: ticket.closedAt,
    messages: visibleMessages,
  }));
});

// ── PATCH /:refNumber — update (staff only, agency-scoped) ───────────────

ticketsRoute.patch('/:refNumber', requireStaff, zValidator('json', updateTicketSchema), async (c) => {
  const refNumber = c.req.param('refNumber');
  const { scope, misconfigured } = resolveAgencyScope(c.get('session'));
  if (misconfigured) return c.json(fail('Forbidden'), 403);

  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);
  if (!ticket) return c.json(fail('Ticket not found'), 404);
  if (scope && ticket.assignedAgencyCode !== scope) return c.json(fail('Ticket not found'), 404);

  const body = c.req.valid('json');
  const patch: Partial<typeof tickets.$inferInsert> = {};

  if (body.status !== undefined) {
    const pascal = toPascalCase(body.status);
    const match = VALID_STATUSES.find((s) => toPascalCase(s) === pascal);
    if (!match) return c.json(fail(`Invalid status '${body.status}'`), 400);
    patch.status = toPascalCase(match) as typeof patch.status;
    if (patch.status === 'Resolved') patch.resolvedAt = new Date();
    if (patch.status === 'Closed') patch.closedAt = new Date();
  }
  if (body.priority !== undefined) {
    const match = VALID_PRIORITIES.find((p) => p.toLowerCase() === body.priority!.toLowerCase());
    if (!match) return c.json(fail(`Invalid priority '${body.priority}'`), 400);
    patch.priority = (match[0]!.toUpperCase() + match.slice(1)) as typeof patch.priority;
  }
  if (body.assignee !== undefined) patch.assignee = body.assignee;
  if (body.assignedAgencyCode !== undefined) patch.assignedAgencyCode = body.assignedAgencyCode;
  if (body.satisfactionRating !== undefined) patch.satisfactionRating = body.satisfactionRating;
  if (body.satisfactionComment !== undefined) patch.satisfactionComment = body.satisfactionComment;

  let newlyEscalated = false;
  if (body.isEscalated === true && !ticket.isEscalated) {
    patch.isEscalated = true;
    patch.escalatedAt = new Date();
    newlyEscalated = true;
  }

  await db.update(tickets).set(patch).where(eq(tickets.id, ticket.id));

  if (newlyEscalated) {
    c.executionCtx.waitUntil(sendEscalationEmail(c, { ...ticket, ...patch }));
  }
  if (body.status !== undefined) {
    c.executionCtx.waitUntil(sendTicketStatusUpdateEmail(c.env, {
      to: ticket.contactEmail, contactName: ticket.contactName, referenceNumber: ticket.referenceNumber, newStatus: body.status,
    }));
  }

  return c.json(ok({ referenceNumber: ticket.referenceNumber, status: patch.status ?? ticket.status }));
});

async function sendEscalationEmail(c: Context<AppEnv>, ticket: typeof tickets.$inferSelect) {
  const db = getDb(c.env);
  const [emails, customMessage] = await Promise.all([
    getEscalationEmails(db),
    getSetting(db, ESCALATION_MESSAGE_KEY, ''),
  ]);
  await sendEscalationNotificationEmail(c.env, {
    referenceNumber: ticket.referenceNumber, title: ticket.title, contactName: ticket.contactName,
    additionalRecipients: emails.length > 0 ? emails : undefined,
    customMessage: customMessage || null,
  });
}

// ── GET /:refNumber/messages ──────────────────────────────────────────────

ticketsRoute.get('/:refNumber/messages', optionalAuth, async (c) => {
  const refNumber = c.req.param('refNumber');
  const email = c.req.query('email');
  const session = c.get('session');
  const isStaffCaller = session ? (session.role === 'dg' || session.role === 'admin' || session.role === 'agency_officer') : false;
  const { scope, misconfigured } = resolveAgencyScope(session);
  if (misconfigured) return c.json(fail('Forbidden'), 403);

  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);
  if (!ticket) return c.json(fail('Ticket not found'), 404);

  if (!isStaffCaller) {
    if (!email || email.toLowerCase().trim() !== ticket.contactEmail) return c.json(fail('Ticket not found'), 404);
  } else if (scope && ticket.assignedAgencyCode !== scope) {
    return c.json(fail('Ticket not found'), 404);
  }

  const msgs = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticket.id)).orderBy(ticketMessages.sentAt);
  const visible = msgs.filter((m) => isStaffCaller || !m.isInternal)
    .map((m) => ({ content: m.content, authorName: m.authorName, authorRole: m.authorRole, authorEmail: m.authorEmail, isInternal: m.isInternal, sentAt: m.sentAt }));

  return c.json(ok(visible));
});

// ── POST /:refNumber/messages — staff reply ───────────────────────────────

ticketsRoute.post('/:refNumber/messages', requireStaff, zValidator('json', staffMessageSchema), async (c) => {
  const refNumber = c.req.param('refNumber');
  const { scope, misconfigured } = resolveAgencyScope(c.get('session'));
  if (misconfigured) return c.json(fail('Forbidden'), 403);

  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);
  if (!ticket) return c.json(fail('Ticket not found'), 404);
  if (scope && ticket.assignedAgencyCode !== scope) return c.json(fail('Ticket not found'), 404);

  const session = c.get('session')!;
  const body = c.req.valid('json');

  const [message] = await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    content: stripHtml(body.content),
    authorName: stripHtml(session.name || 'UIA Officer'),
    authorRole: 'Officer',
    authorEmail: session.email,
    isInternal: body.isInternal,
  }).returning();

  return c.json(ok({
    content: message!.content, authorName: message!.authorName, authorRole: message!.authorRole, isInternal: message!.isInternal, sentAt: message!.sentAt,
  }), 201);
});

// ── POST /:refNumber/comments — public reply ──────────────────────────────

ticketsRoute.post('/:refNumber/comments', zValidator('json', publicCommentSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const refNumber = c.req.param('refNumber');
  const body = c.req.valid('json');
  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);

  if (!ticket || body.authorEmail.toLowerCase().trim() !== ticket.contactEmail) {
    return c.json(fail('Ticket not found or email does not match'), 403);
  }

  const [message] = await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    content: stripHtml(body.content),
    authorName: stripHtml(body.authorName),
    authorRole: 'Investor',
    authorEmail: ticket.contactEmail,
    isInternal: false,
  }).returning();

  return c.json(ok({ content: message!.content, authorName: message!.authorName, authorRole: message!.authorRole, sentAt: message!.sentAt }), 201);
});

// ── PATCH /:refNumber/public — public self-service (escalate/rate) ───────

ticketsRoute.patch('/:refNumber/public', zValidator('json', publicTicketUpdateSchema), async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const refNumber = c.req.param('refNumber');
  const body = c.req.valid('json');
  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);

  const denied = () => c.json(fail('Not permitted, or the action is not available for this ticket'), 403);
  if (!ticket || body.email.toLowerCase().trim() !== ticket.contactEmail) return denied();

  const patch: Partial<typeof tickets.$inferInsert> = {};
  let newlyEscalated = false;
  if (body.isEscalated === true && !ticket.isEscalated) {
    patch.isEscalated = true;
    patch.escalatedAt = new Date();
    newlyEscalated = true;
  }

  if (body.satisfactionRating !== undefined) {
    if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') return denied();
    if (body.satisfactionRating < 1 || body.satisfactionRating > 5) return denied();
    patch.satisfactionRating = body.satisfactionRating;
    if (body.satisfactionComment !== undefined) patch.satisfactionComment = stripHtml(body.satisfactionComment);
  }

  await db.update(tickets).set(patch).where(eq(tickets.id, ticket.id));

  if (newlyEscalated) {
    c.executionCtx.waitUntil(sendEscalationEmail(c, { ...ticket, ...patch }));
  }

  return c.json(ok({
    referenceNumber: ticket.referenceNumber,
    isEscalated: patch.isEscalated ?? ticket.isEscalated,
    satisfactionRating: patch.satisfactionRating ?? ticket.satisfactionRating,
  }));
});
