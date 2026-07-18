import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db/client';
import { agencyMessages, tickets } from '../db/schema';
import { requireStaff } from '../middleware/auth';
import { isAgencyOfficer } from '../lib/roles';
import { stripHtml } from '../lib/sanitize';
import { sendMessageSchema } from '../schemas/messages';
import { ok, fail } from '../lib/response';
import type { AppEnv } from '../app-env';
import type { Db } from '../db/client';

/** Mirrors backend/src/OscApi/Controllers/MessagesController.cs. */
export const messagesRoute = new Hono<AppEnv>();

messagesRoute.use('*', requireStaff);

/** Mirrors OfficerCanAccessChannelAsync: "general", or a ticket channel assigned to the officer's own agency. */
async function officerCanAccessChannel(db: Db, agencyCode: string | undefined, channel: string): Promise<boolean> {
  if (channel === 'general') return true;
  if (!agencyCode) return false;
  const [row] = await db.select({ id: tickets.id }).from(tickets)
    .where(and(eq(tickets.referenceNumber, channel), eq(tickets.assignedAgencyCode, agencyCode))).limit(1);
  return !!row;
}

messagesRoute.get('/', async (c) => {
  const session = c.get('session')!;
  const isOfficer = isAgencyOfficer(session.role);
  const db = getDb(c.env);
  const channel = c.req.query('channel');

  if (!channel) {
    // Two queries total regardless of channel count (counts, and one DISTINCT
    // ON for the last message per channel) — avoids an N+1 round-trip per
    // channel, the exact class of issue SCALABILITY_AUDIT.md flagged for the
    // ASP.NET version's LINQ GroupBy translation.
    const [channels, lastMessages] = await Promise.all([
      db.select({
        channel: agencyMessages.channel,
        lastAt: sql<string>`max(${agencyMessages.sentAt})`,
        count: sql<number>`count(*)::int`,
      }).from(agencyMessages).groupBy(agencyMessages.channel).orderBy(sql`max(${agencyMessages.sentAt}) desc`),

      db.execute<{ channel: string; content: string; senderName: string }>(sql`
        SELECT DISTINCT ON ("Channel") "Channel" AS channel, "Content" AS content, "SenderName" AS "senderName"
        FROM agency_messages
        ORDER BY "Channel", "SentAt" DESC
      `),
    ]);

    const lastByChannel = new Map((lastMessages as unknown as { channel: string; content: string; senderName: string }[])
      .map((r) => [r.channel, r]));

    const withLast = channels.map((ch) => {
      const last = lastByChannel.get(ch.channel);
      return { channel: ch.channel, lastMessage: last?.content ?? '', lastSender: last?.senderName ?? '', lastAt: ch.lastAt, count: ch.count };
    });

    let visible = withLast;
    if (isOfficer) {
      const agencyTickets = await db.select({ ref: tickets.referenceNumber }).from(tickets)
        .where(eq(tickets.assignedAgencyCode, session.agencyCode ?? ''));
      const visibleRefs = new Set([...agencyTickets.map((t) => t.ref), 'general']);
      visible = withLast.filter((ch) => visibleRefs.has(ch.channel));
    }

    return c.json(ok(visible));
  }

  if (isOfficer && !(await officerCanAccessChannel(db, session.agencyCode, channel))) {
    return c.json(fail('Channel not found'), 404);
  }

  const messages = await db.select().from(agencyMessages).where(eq(agencyMessages.channel, channel)).orderBy(agencyMessages.sentAt);
  return c.json(ok(messages.map((m) => ({
    _id: m.id, channel: m.channel, content: m.content, senderName: m.senderName,
    senderAgencyCode: m.senderAgencyCode, senderEmail: m.senderEmail, isInternal: m.isInternal, sentAt: m.sentAt,
  }))));
});

messagesRoute.post('/', zValidator('json', sendMessageSchema), async (c) => {
  const session = c.get('session')!;
  const db = getDb(c.env);
  const body = c.req.valid('json');

  if (isAgencyOfficer(session.role) && !(await officerCanAccessChannel(db, session.agencyCode, body.channel))) {
    return c.json(fail('Channel not found'), 404);
  }

  const [message] = await db.insert(agencyMessages).values({
    channel: body.channel,
    content: stripHtml(body.content),
    senderName: session.name || 'Unknown',
    senderAgencyCode: session.agencyCode ?? body.senderAgencyCode,
    senderEmail: session.email,
    isInternal: body.isInternal,
  }).returning();

  return c.json(ok({
    _id: message!.id, channel: message!.channel, content: message!.content, senderName: message!.senderName,
    senderAgencyCode: message!.senderAgencyCode, senderEmail: message!.senderEmail, isInternal: message!.isInternal, sentAt: message!.sentAt,
  }), 201);
});
