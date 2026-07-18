import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/client';
import { tickets, ticketDocuments } from '../db/schema';
import { requireAdminLevel, optionalAuth } from '../middleware/auth';
import { resolveAgencyScope } from '../lib/agency-scope';
import { isAdminLevel, isAgencyOfficer } from '../lib/roles';
import { ok, fail } from '../lib/response';
import type { AppEnv } from '../app-env';

/**
 * Mirrors backend/src/OscApi/Controllers/DocumentsController.cs, mounted at
 * /api/tickets/:refNumber/documents. Files live in R2 (binding: DOCUMENTS)
 * instead of the ASP.NET backend's local-disk /uploads simulation — see
 * wrangler.toml's comment on that binding for why.
 */
export const documentsRoute = new Hono<AppEnv>();

documentsRoute.get('/', optionalAuth, async (c) => {
  // Non-null: :refNumber is defined on the PARENT mount pattern
  // (app.route('/api/tickets/:refNumber/documents', documentsRoute) in
  // index.ts), which Hono's per-file param-name inference can't see from
  // this file alone — it's always present at runtime for any matched request.
  const refNumber = c.req.param('refNumber')!;
  const email = c.req.query('email');
  const session = c.get('session');
  const db = getDb(c.env);

  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, refNumber)).limit(1);
  if (!ticket) return c.json(fail('Ticket not found'), 404);

  const isStaff = isAdminLevel(session?.role) || isAgencyOfficer(session?.role);
  if (!isStaff) {
    if (!email || email.toLowerCase().trim() !== ticket.contactEmail) {
      return c.json(fail('Email does not match ticket'), 403);
    }
  } else {
    const { scope, misconfigured } = resolveAgencyScope(session);
    if (misconfigured) return c.json(fail('Forbidden'), 403);
    if (scope && ticket.assignedAgencyCode !== scope) return c.json(fail('Ticket not found'), 404);
  }

  const docs = await db.select().from(ticketDocuments)
    .where(eq(ticketDocuments.ticketId, ticket.id))
    .orderBy(ticketDocuments.uploadedAt);

  return c.json(ok(docs.reverse().map((d) => ({
    id: d.id, fileName: d.fileName, mimeType: d.mimeType, fileSize: d.fileSize, storageUrl: d.storageUrl, uploadedAt: d.uploadedAt,
  }))));
});

documentsRoute.get('/:documentId/content', optionalAuth, async (c) => {
  // Non-null: :refNumber is defined on the PARENT mount pattern
  // (app.route('/api/tickets/:refNumber/documents', documentsRoute) in
  // index.ts), which Hono's per-file param-name inference can't see from
  // this file alone — it's always present at runtime for any matched request.
  const refNumber = c.req.param('refNumber')!;
  const documentId = c.req.param('documentId');
  const email = c.req.query('email');
  const session = c.get('session');
  const db = getDb(c.env);

  const [row] = await db.select({ doc: ticketDocuments, ticket: tickets })
    .from(ticketDocuments)
    .innerJoin(tickets, eq(ticketDocuments.ticketId, tickets.id))
    .where(and(eq(ticketDocuments.id, documentId), eq(tickets.referenceNumber, refNumber)))
    .limit(1);

  if (!row) return c.json(fail('Document not found'), 404);
  const { doc, ticket } = row;

  const isStaff = isAdminLevel(session?.role) || isAgencyOfficer(session?.role);
  if (!isStaff) {
    if (!email || email.toLowerCase().trim() !== ticket.contactEmail) {
      return c.json(fail('Email does not match ticket'), 403);
    }
  } else {
    const { scope, misconfigured } = resolveAgencyScope(session);
    if (misconfigured) return c.json(fail('Forbidden'), 403);
    if (scope && ticket.assignedAgencyCode !== scope) return c.json(fail('Document not found'), 404);
  }

  const object = await c.env.DOCUMENTS.get(doc.storageUrl);
  if (!object) return c.json(fail('File is no longer available'), 404);

  // Force download (attachment) so a mislabelled file can never render in the browser under this origin.
  return new Response(object.body, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${doc.fileName.replace(/"/g, '')}"`,
      'Content-Length': String(doc.fileSize),
    },
  });
});

documentsRoute.delete('/:documentId', requireAdminLevel, async (c) => {
  // Non-null: :refNumber is defined on the PARENT mount pattern
  // (app.route('/api/tickets/:refNumber/documents', documentsRoute) in
  // index.ts), which Hono's per-file param-name inference can't see from
  // this file alone — it's always present at runtime for any matched request.
  const refNumber = c.req.param('refNumber')!;
  const documentId = c.req.param('documentId');
  const db = getDb(c.env);

  const [row] = await db.select({ doc: ticketDocuments })
    .from(ticketDocuments)
    .innerJoin(tickets, eq(ticketDocuments.ticketId, tickets.id))
    .where(and(eq(ticketDocuments.id, documentId), eq(tickets.referenceNumber, refNumber)))
    .limit(1);

  if (!row) return c.json(fail('Document not found'), 404);

  await c.env.DOCUMENTS.delete(row.doc.storageUrl);
  await db.delete(ticketDocuments).where(eq(ticketDocuments.id, documentId));

  return c.json(ok());
});
