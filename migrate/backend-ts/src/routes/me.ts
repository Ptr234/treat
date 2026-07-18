import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db/client';
import { tickets, contactInquiries, appointments, investorProfiles, formDrafts, adminUsers, users } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { isStaff } from '../lib/roles';
import { ok, fail } from '../lib/response';
import type { AppEnv } from '../app-env';

/**
 * Mirrors backend/src/OscApi/Controllers/MeController.cs — self-service
 * endpoints for the signed-in user, matched by login email.
 */
export const me = new Hono<AppEnv>();

me.use('*', requireAuth);

me.get('/submissions', async (c) => {
  const email = c.get('session')!.email.toLowerCase();
  const db = getDb(c.env);

  const [ticketRows, inquiryRows, appointmentRows, investor] = await Promise.all([
    db.select({
      referenceNumber: tickets.referenceNumber, title: tickets.title, category: tickets.category,
      priority: tickets.priority, status: tickets.status, slaDeadlineAt: tickets.slaDeadlineAt,
      isEscalated: tickets.isEscalated, createdAt: tickets.createdAt,
    }).from(tickets).where(eq(tickets.contactEmail, email)).orderBy(desc(tickets.createdAt)),

    db.select({
      referenceNumber: contactInquiries.referenceNumber, agencyCode: contactInquiries.agencyCode,
      agencyName: contactInquiries.agencyName, serviceType: contactInquiries.serviceType,
      subject: contactInquiries.subject, status: contactInquiries.status, createdAt: contactInquiries.createdAt,
    }).from(contactInquiries).where(eq(contactInquiries.contactEmail, email)).orderBy(desc(contactInquiries.createdAt)),

    db.select({
      referenceNumber: appointments.referenceNumber, agencyCode: appointments.agencyCode,
      agencyName: appointments.agencyName, serviceType: appointments.serviceType,
      preferredDate: appointments.preferredDate, preferredTime: appointments.preferredTime,
      meetingType: appointments.meetingType, status: appointments.status, createdAt: appointments.createdAt,
    }).from(appointments).where(eq(appointments.contactEmail, email)).orderBy(desc(appointments.createdAt)),

    db.select({
      referenceNumber: investorProfiles.referenceNumber, status: investorProfiles.status,
      primarySector: investorProfiles.primarySector, investmentAmount: investorProfiles.investmentAmount,
      investorType: investorProfiles.investorType, createdAt: investorProfiles.createdAt,
    }).from(investorProfiles).where(eq(investorProfiles.email, email)).limit(1),
  ]);

  return c.json(ok({
    tickets: ticketRows,
    inquiries: inquiryRows,
    appointments: appointmentRows,
    investor: investor[0] ?? null,
  }));
});

me.get('/drafts/:formType', async (c) => {
  const email = c.get('session')!.email.toLowerCase();
  const formType = c.req.param('formType');
  const db = getDb(c.env);

  const [draft] = await db.select().from(formDrafts)
    .where(and(eq(formDrafts.userEmail, email), eq(formDrafts.formType, formType)))
    .limit(1);
  if (!draft) return c.json(ok(null));

  let data: unknown;
  try {
    data = JSON.parse(draft.data);
  } catch {
    return c.json(ok(null));
  }

  return c.json(ok({ formType: draft.formType, data, updatedAt: draft.updatedAt }));
});

me.put('/drafts/:formType', async (c) => {
  const email = c.get('session')!.email.toLowerCase();
  const formType = c.req.param('formType');
  if (!formType || formType.length > 50) return c.json(fail('Invalid form type'), 400);

  let raw: string;
  try {
    const body = await c.req.json();
    raw = JSON.stringify(body ?? {});
  } catch {
    raw = '{}';
  }
  if (raw.length > 100_000) return c.json(fail('Draft is too large'), 400);

  const db = getDb(c.env);
  const [existingDraft] = await db.select({ id: formDrafts.id }).from(formDrafts)
    .where(and(eq(formDrafts.userEmail, email), eq(formDrafts.formType, formType)))
    .limit(1);

  if (!existingDraft) {
    await db.insert(formDrafts).values({ userEmail: email, formType, data: raw });
  } else {
    await db.update(formDrafts).set({ data: raw, updatedAt: new Date() }).where(eq(formDrafts.id, existingDraft.id));
  }

  return c.json(ok('Draft saved'));
});

me.delete('/drafts/:formType', async (c) => {
  const email = c.get('session')!.email.toLowerCase();
  const formType = c.req.param('formType');
  const db = getDb(c.env);

  await db.delete(formDrafts).where(and(eq(formDrafts.userEmail, email), eq(formDrafts.formType, formType)));

  return c.json(ok());
});

me.get('/profile', async (c) => {
  const session = c.get('session')!;
  const email = session.email.toLowerCase();
  const db = getDb(c.env);

  const name = isStaff(session.role)
    ? (await db.select({ name: adminUsers.name }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1))[0]?.name
    : (await db.select({ name: users.name }).from(users).where(eq(users.email, email)).limit(1))[0]?.name;

  return c.json(ok({ email, name: name ?? null }));
});

me.put('/profile', async (c) => {
  const session = c.get('session')!;
  const email = session.email.toLowerCase();

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(ok({ email }));
  }

  if (typeof body !== 'object' || body === null || typeof (body as Record<string, unknown>).name !== 'string') {
    return c.json(ok({ email }));
  }

  const name = ((body as Record<string, unknown>).name as string).trim();
  if (name.length < 2 || name.length > 100) return c.json(fail('Name must be 2-100 characters'), 400);

  const db = getDb(c.env);
  if (isStaff(session.role)) {
    const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!admin) return c.json(fail('Account not found'), 404);
    await db.update(adminUsers).set({ name, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  } else {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!user) return c.json(fail('Account not found'), 404);
    await db.update(users).set({ name }).where(eq(users.id, user.id));
  }

  return c.json(ok({ email, name }));
});

me.post('/delete-account', async (c) => {
  const email = c.get('session')!.email.toLowerCase();
  const db = getDb(c.env);

  await db.delete(investorProfiles).where(eq(investorProfiles.email, email));
  await db.delete(formDrafts).where(eq(formDrafts.userEmail, email));

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    await db.update(users).set({ isActive: false }).where(eq(users.id, user.id));
  }

  return c.json(ok('Account deleted'));
});
