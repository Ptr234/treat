import { Hono } from 'hono';
import { eq, count } from 'drizzle-orm';
import { getDb } from '../db/client';
import { tickets, ticketDocuments } from '../db/schema';
import { optionalAuth } from '../middleware/auth';
import { resolveAgencyScope } from '../lib/agency-scope';
import { isAdminLevel, isAgencyOfficer } from '../lib/roles';
import { stripHtml } from '../lib/sanitize';
import { checkRateLimit, clientIp, RateLimitPolicy } from '../lib/rate-limit';
import { ok, fail } from '../lib/response';
import type { AppEnv } from '../app-env';

/**
 * Mirrors backend/src/OscApi/Controllers/UploadController.cs, including the
 * byte-signature check (never trust the client's Content-Type alone) — but
 * writes to R2 (binding: DOCUMENTS) instead of local disk.
 */
export const uploadRoute = new Hono<AppEnv>();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_REQUEST = 5;
const MAX_DOCUMENTS_PER_TICKET = 20;

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'text/plain': '.txt',
};

/**
 * Structural stand-in for the Web File type. @cloudflare/vitest-pool-workers
 * transitively bundles its own nested `wrangler` dependency, which pulls in
 * the OLDEST dated @cloudflare/workers-types snapshot (predates FormData
 * returning File from getAll()) into the global scope alongside whatever
 * this project's tsconfig points at, and the two merge unpredictably. Using
 * our own structural type for exactly the members this file touches sidesteps
 * that conflict entirely — the runtime object is a real Workers File either way.
 */
interface UploadedFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number): { arrayBuffer(): Promise<ArrayBuffer> };
}

async function hasValidSignature(file: UploadedFile): Promise<boolean> {
  const buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (sig: number[]) => buffer.length >= sig.length && sig.every((b, i) => buffer[i] === b);
  const contentType = file.type.toLowerCase();

  switch (contentType) {
    case 'application/pdf': return startsWith([0x25, 0x50, 0x44, 0x46]);
    case 'image/jpeg': return startsWith([0xff, 0xd8, 0xff]);
    case 'image/png': return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/webp':
      return startsWith([0x52, 0x49, 0x46, 0x46]) && buffer.length >= 12 &&
        String.fromCharCode(...buffer.slice(8, 12)) === 'WEBP';
    case 'application/msword':
    case 'application/vnd.ms-excel':
      return startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return startsWith([0x50, 0x4b, 0x03, 0x04]);
    case 'text/plain': return true; // no reliable magic number; the extension is inert in a browser
    default: return false;
  }
}

uploadRoute.post('/', optionalAuth, async (c) => {
  if (!(await checkRateLimit(c.env, RateLimitPolicy.PublicForm, clientIp(c.req.raw)))) {
    return c.json(fail('Too many requests'), 429);
  }

  const formData = await c.req.formData();
  // Cast past the ambient FormData.getAll() typing (see UploadedFile's
  // comment above) rather than fight it with a type predicate, then filter
  // out any plain string values a client might send under this field name.
  const files = (formData.getAll('files') as unknown as UploadedFile[])
    .filter((f) => typeof f === 'object' && f !== null);
  const ticketRefNumber = formData.get('ticketRefNumber');
  const contactEmail = formData.get('contactEmail');

  if (files.length === 0) return c.json(fail('No files provided'), 400);
  if (files.length > MAX_FILES_PER_REQUEST) return c.json(fail(`Maximum ${MAX_FILES_PER_REQUEST} files per upload`), 400);
  if (typeof ticketRefNumber !== 'string' || !ticketRefNumber.trim()) return c.json(fail('ticketRefNumber is required'), 400);

  const db = getDb(c.env);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceNumber, ticketRefNumber)).limit(1);
  if (!ticket) return c.json(fail('Ticket not found'), 404);

  const session = c.get('session');
  const isStaff = isAdminLevel(session?.role) || isAgencyOfficer(session?.role);
  if (isStaff) {
    if (isAgencyOfficer(session?.role)) {
      const { scope, misconfigured } = resolveAgencyScope(session);
      if (misconfigured) return c.json(fail('Forbidden'), 403);
      if (ticket.assignedAgencyCode !== scope) return c.json(fail('Ticket not found'), 404);
    }
  } else {
    if (typeof contactEmail !== 'string' || contactEmail.toLowerCase().trim() !== ticket.contactEmail) {
      return c.json(fail('Email does not match ticket'), 403);
    }
  }

  const existingCountRows = await db.select({ existingCount: count() }).from(ticketDocuments).where(eq(ticketDocuments.ticketId, ticket.id));
  const existingCount = existingCountRows[0]?.existingCount ?? 0;
  if (existingCount + files.length > MAX_DOCUMENTS_PER_TICKET) {
    return c.json(fail(`A ticket can hold at most ${MAX_DOCUMENTS_PER_TICKET} documents`), 400);
  }

  for (const file of files) {
    if (file.size === 0) return c.json(fail(`File '${file.name}' is empty`), 400);
    if (file.size > MAX_FILE_SIZE) return c.json(fail(`File '${file.name}' exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`), 400);
    if (!MIME_TO_EXT[file.type]) return c.json(fail(`File type '${file.type}' is not allowed`), 400);
    if (!(await hasValidSignature(file))) {
      return c.json(fail(`File '${file.name}' does not match its declared type '${file.type}'`), 400);
    }
  }

  const results: { id: string; fileName: string; mimeType: string; fileSize: number; storageUrl: string }[] = [];

  for (const file of files) {
    const key = `${crypto.randomUUID()}${MIME_TO_EXT[file.type]}`;
    await c.env.DOCUMENTS.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

    let displayName = stripHtml(file.name);
    if (displayName.length > 255) displayName = displayName.slice(-255);

    const [doc] = await db.insert(ticketDocuments).values({
      ticketId: ticket.id, fileName: displayName, mimeType: file.type, fileSize: file.size, storageUrl: key,
    }).returning();

    results.push({ id: doc!.id, fileName: doc!.fileName, mimeType: doc!.mimeType, fileSize: doc!.fileSize, storageUrl: doc!.storageUrl });
  }

  return c.json(ok({ files: results }));
});
