/**
 * Drizzle schema for the existing Neon Postgres database — hand-translated
 * from backend/src/OscApi/Models/*.cs + Data/OscDbContext.cs (not generated
 * by `drizzle-kit introspect`, since that requires live DB network access
 * this environment doesn't have). Before trusting this for a real migration
 * slice, diff it against an actual introspection run or `\d+ <table>` in
 * psql — in particular the enum-string values below (see note).
 *
 * ── Two non-obvious conventions carried over from the C#/EF Core side ──
 *
 * 1. COLUMN NAMES ARE PascalCase, QUOTED. OscDbContext never calls
 *    `.UseSnakeCaseNamingConvention()`, so Npgsql's EF Core provider uses the
 *    raw C# property name as the column name (e.g. "CreatedAt", not
 *    "created_at"), and always double-quotes identifiers in generated SQL.
 *    Table names ARE snake_case, but only because every model has an
 *    explicit `[Table("snake_case_name")]` attribute overriding the default.
 *    Every column below passes its exact PascalCase name explicitly for
 *    this reason — do not "fix" these to snake_case.
 *
 * 2. ENUM COLUMNS ARE PLAIN VARCHAR, NOT A POSTGRES ENUM TYPE. Each C#
 *    enum property uses `.HasConversion<string>()`, which EF stores as the
 *    literal enum member name (e.g. TicketStatus.InProgress -> "InProgress"),
 *    not a native `CREATE TYPE ... AS ENUM`. So these are typed here as
 *    varchar with a TS union for the app-level type, not `pgEnum`.
 *    VERIFY THE EXACT STORED CASING against a real row before Phase 2
 *    (tickets slice) — this is the single highest-risk assumption in this
 *    file, since a mismatch would silently produce empty result sets rather
 *    than an error.
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  jsonb,
  date,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ── Enum value unions (mirrors backend/src/OscApi/Models/Enums.cs) ──────

export const TICKET_CATEGORIES = [
  'GeneralInquiry', 'ProcedureQuery', 'ApplicationSupport', 'LicenseDelay', 'Complaint', 'Vip',
] as const;
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const TICKET_STATUSES = [
  'New', 'Assigned', 'InProgress', 'PendingExternal', 'Resolved', 'Closed',
] as const;
export const AUTHOR_ROLES = ['Investor', 'Officer', 'System'] as const;
export const CHAT_LANGUAGES = ['En', 'Fr', 'Ar', 'Zh', 'Sw'] as const;
export const CHAT_SENTIMENTS = ['Positive', 'Neutral', 'Negative'] as const;
export const CHAT_TIERS = ['Ai', 'Kb', 'Suggestions', 'Escalation'] as const;
export const INVESTOR_TYPES = ['Individual', 'Institutional', 'Foreign'] as const;
export const INVESTOR_EXPERIENCES = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const INVESTMENT_GOALS = ['Growth', 'Income', 'Diversification', 'Strategic'] as const;
export const TIME_HORIZONS = ['ShortTerm', 'MediumTerm', 'LongTerm'] as const;
export const RISK_TOLERANCES = ['Conservative', 'Moderate', 'Aggressive'] as const;
export const CAPITAL_SOURCES = ['Savings', 'Loan', 'Partnership', 'Grant'] as const;
export const INVESTOR_TIMEFRAMES = ['Immediate', 'ThreeMonths', 'SixMonths', 'OneYear'] as const;
export const INVESTOR_STATUSES = ['New', 'Contacted', 'Active', 'Inactive'] as const;
export const CONTACT_URGENCIES = ['Low', 'Normal', 'Urgent'] as const;
export const CONTACT_INQUIRY_STATUSES = ['Pending', 'InProgress', 'Responded', 'Closed'] as const;
export const MEETING_TYPES = ['InPerson', 'Virtual', 'Phone'] as const;
export const APPOINTMENT_STATUSES = [
  'Requested', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed',
] as const;

// ── admin_users ───────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
  id: uuid('Id').primaryKey().defaultRandom(),
  name: varchar('Name', { length: 100 }).notNull(),
  email: varchar('Email', { length: 255 }).notNull(),
  passwordHash: varchar('PasswordHash', { length: 500 }),
  role: varchar('Role', { length: 50 }).notNull().default('admin'),
  agencyCode: varchar('AgencyCode', { length: 20 }),
  isActive: boolean('IsActive').notNull().default(true),
  passwordResetToken: varchar('PasswordResetToken', { length: 200 }),
  passwordResetExpiresAt: timestamp('PasswordResetExpiresAt', { withTimezone: true }),
  mfaSecret: varchar('MfaSecret', { length: 64 }),
  mfaEnabled: boolean('MfaEnabled').notNull().default(false),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_admin_users_Email').on(t.email),
  index('IX_admin_users_PasswordResetToken').on(t.passwordResetToken),
  index('IX_admin_users_AgencyCode').on(t.agencyCode),
]);

// ── users (regular end users / investors) ────────────────────────────────

export const users = pgTable('users', {
  id: uuid('Id').primaryKey().defaultRandom(),
  name: varchar('Name', { length: 100 }).notNull(),
  email: varchar('Email', { length: 255 }).notNull(),
  passwordHash: varchar('PasswordHash', { length: 500 }),
  role: varchar('Role', { length: 50 }).notNull().default('user'),
  googleSubject: varchar('GoogleSubject', { length: 255 }),
  picture: varchar('Picture', { length: 500 }),
  isActive: boolean('IsActive').notNull().default(true),
  passwordResetToken: varchar('PasswordResetToken', { length: 200 }),
  passwordResetExpiresAt: timestamp('PasswordResetExpiresAt', { withTimezone: true }),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_users_Email').on(t.email),
]);

// ── form_drafts ───────────────────────────────────────────────────────────

export const formDrafts = pgTable('form_drafts', {
  id: uuid('Id').primaryKey().defaultRandom(),
  userEmail: varchar('UserEmail', { length: 255 }).notNull(),
  formType: varchar('FormType', { length: 50 }).notNull(),
  data: text('Data').notNull().default('{}'),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_form_drafts_UserEmail_FormType').on(t.userEmail, t.formType),
]);

// ── tickets ───────────────────────────────────────────────────────────────

export const tickets = pgTable('tickets', {
  id: uuid('Id').primaryKey().defaultRandom(),
  referenceNumber: varchar('ReferenceNumber', { length: 20 }).notNull(),
  title: varchar('Title', { length: 200 }).notNull(),
  description: varchar('Description', { length: 5000 }).notNull(),
  category: varchar('Category', { length: 30 }).notNull().$type<(typeof TICKET_CATEGORIES)[number]>(),
  priority: varchar('Priority', { length: 20 }).notNull().default('Medium').$type<(typeof TICKET_PRIORITIES)[number]>(),
  status: varchar('Status', { length: 20 }).notNull().default('New').$type<(typeof TICKET_STATUSES)[number]>(),
  contactName: varchar('ContactName', { length: 100 }).notNull(),
  contactEmail: varchar('ContactEmail', { length: 255 }).notNull(),
  contactPhone: varchar('ContactPhone', { length: 30 }),
  investorNationality: varchar('InvestorNationality', { length: 100 }),
  sector: varchar('Sector', { length: 100 }),
  investmentSize: varchar('InvestmentSize', { length: 50 }),
  assignee: varchar('Assignee', { length: 100 }),
  assignedAgencyCode: varchar('AssignedAgencyCode', { length: 20 }),
  slaDeadlineHours: integer('SlaDeadlineHours'),
  slaDeadlineAt: timestamp('SlaDeadlineAt', { withTimezone: true }),
  satisfactionRating: integer('SatisfactionRating'),
  satisfactionComment: varchar('SatisfactionComment', { length: 1000 }),
  isEscalated: boolean('IsEscalated').notNull().default(false),
  escalatedAt: timestamp('EscalatedAt', { withTimezone: true }),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('ResolvedAt', { withTimezone: true }),
  closedAt: timestamp('ClosedAt', { withTimezone: true }),
}, (t) => [
  uniqueIndex('IX_tickets_ReferenceNumber').on(t.referenceNumber),
  index('IX_tickets_ContactEmail').on(t.contactEmail),
  index('IX_tickets_Status_CreatedAt').on(t.status, t.createdAt),
  index('IX_tickets_IsEscalated').on(t.isEscalated).where(sql`"IsEscalated" = true`),
]);

export const ticketsRelations = relations(tickets, ({ many }) => ({
  messages: many(ticketMessages),
  documents: many(ticketDocuments),
}));

// ── ticket_documents ──────────────────────────────────────────────────────

export const ticketDocuments = pgTable('ticket_documents', {
  id: uuid('Id').primaryKey().defaultRandom(),
  ticketId: uuid('TicketId').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  fileName: varchar('FileName', { length: 255 }).notNull(),
  mimeType: varchar('MimeType', { length: 100 }).notNull(),
  fileSize: bigint('FileSize', { mode: 'number' }).notNull(),
  storageUrl: text('StorageUrl').notNull(),
  uploadedAt: timestamp('UploadedAt', { withTimezone: true }).notNull().defaultNow(),
});

// ── ticket_messages ───────────────────────────────────────────────────────

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('Id').primaryKey().defaultRandom(),
  ticketId: uuid('TicketId').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  content: varchar('Content', { length: 5000 }).notNull(),
  authorName: varchar('AuthorName', { length: 100 }).notNull(),
  authorRole: varchar('AuthorRole', { length: 20 }).notNull().$type<(typeof AUTHOR_ROLES)[number]>(),
  authorEmail: varchar('AuthorEmail', { length: 255 }),
  isInternal: boolean('IsInternal').notNull().default(false),
  sentAt: timestamp('SentAt', { withTimezone: true }).notNull().defaultNow(),
});

// ── investor_profiles ─────────────────────────────────────────────────────

export const investorProfiles = pgTable('investor_profiles', {
  id: uuid('Id').primaryKey().defaultRandom(),
  referenceNumber: varchar('ReferenceNumber', { length: 20 }).notNull(),
  name: varchar('Name', { length: 100 }).notNull(),
  email: varchar('Email', { length: 255 }).notNull(),
  phone: varchar('Phone', { length: 30 }).notNull(),
  nationality: varchar('Nationality', { length: 100 }).notNull(),
  companyName: varchar('CompanyName', { length: 200 }),
  position: varchar('Position', { length: 100 }),
  investorType: varchar('InvestorType', { length: 20 }).notNull().$type<(typeof INVESTOR_TYPES)[number]>(),
  experience: varchar('Experience', { length: 20 }).notNull().$type<(typeof INVESTOR_EXPERIENCES)[number]>(),
  investmentGoal: varchar('InvestmentGoal', { length: 20 }).notNull().$type<(typeof INVESTMENT_GOALS)[number]>(),
  investmentAmount: varchar('InvestmentAmount', { length: 50 }).notNull(),
  timeHorizon: varchar('TimeHorizon', { length: 20 }).notNull().$type<(typeof TIME_HORIZONS)[number]>(),
  riskTolerance: varchar('RiskTolerance', { length: 20 }).notNull().$type<(typeof RISK_TOLERANCES)[number]>(),
  primarySector: varchar('PrimarySector', { length: 100 }).notNull(),
  secondarySectors: jsonb('SecondarySectors').notNull().default([]).$type<string[]>(),
  specificInterests: varchar('SpecificInterests', { length: 2000 }),
  capitalSource: varchar('CapitalSource', { length: 20 }).notNull().$type<(typeof CAPITAL_SOURCES)[number]>(),
  timeframe: varchar('Timeframe', { length: 20 }).notNull().$type<(typeof INVESTOR_TIMEFRAMES)[number]>(),
  supportNeeded: jsonb('SupportNeeded').notNull().default([]).$type<string[]>(),
  status: varchar('Status', { length: 20 }).notNull().default('New').$type<(typeof INVESTOR_STATUSES)[number]>(),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_investor_profiles_ReferenceNumber').on(t.referenceNumber),
  uniqueIndex('IX_investor_profiles_Email').on(t.email),
]);

// ── agency_messages ───────────────────────────────────────────────────────

export const agencyMessages = pgTable('agency_messages', {
  id: uuid('Id').primaryKey().defaultRandom(),
  channel: varchar('Channel', { length: 100 }).notNull(),
  content: varchar('Content', { length: 5000 }).notNull(),
  senderName: varchar('SenderName', { length: 100 }).notNull(),
  senderAgencyCode: varchar('SenderAgencyCode', { length: 20 }),
  senderEmail: varchar('SenderEmail', { length: 255 }),
  isInternal: boolean('IsInternal').notNull().default(false),
  sentAt: timestamp('SentAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('IX_agency_messages_Channel_SentAt').on(t.channel, t.sentAt),
]);

// ── contact_inquiries ─────────────────────────────────────────────────────

export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('Id').primaryKey().defaultRandom(),
  referenceNumber: varchar('ReferenceNumber', { length: 20 }).notNull(),
  agencyCode: varchar('AgencyCode', { length: 20 }).notNull(),
  agencyName: varchar('AgencyName', { length: 200 }).notNull(),
  contactName: varchar('ContactName', { length: 100 }).notNull(),
  contactEmail: varchar('ContactEmail', { length: 255 }).notNull(),
  contactPhone: varchar('ContactPhone', { length: 30 }).notNull(),
  company: varchar('Company', { length: 200 }),
  serviceType: varchar('ServiceType', { length: 200 }).notNull(),
  subject: varchar('Subject', { length: 200 }).notNull(),
  message: varchar('Message', { length: 5000 }).notNull(),
  urgency: varchar('Urgency', { length: 20 }).notNull().default('Normal').$type<(typeof CONTACT_URGENCIES)[number]>(),
  status: varchar('Status', { length: 20 }).notNull().default('Pending').$type<(typeof CONTACT_INQUIRY_STATUSES)[number]>(),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_contact_inquiries_ReferenceNumber').on(t.referenceNumber),
  index('IX_contact_inquiries_AgencyCode').on(t.agencyCode),
  index('IX_contact_inquiries_ContactEmail').on(t.contactEmail),
]);

// ── appointments ──────────────────────────────────────────────────────────

export const appointments = pgTable('appointments', {
  id: uuid('Id').primaryKey().defaultRandom(),
  referenceNumber: varchar('ReferenceNumber', { length: 20 }).notNull(),
  agencyCode: varchar('AgencyCode', { length: 20 }).notNull(),
  agencyName: varchar('AgencyName', { length: 200 }).notNull(),
  contactName: varchar('ContactName', { length: 100 }).notNull(),
  contactEmail: varchar('ContactEmail', { length: 255 }).notNull(),
  contactPhone: varchar('ContactPhone', { length: 30 }).notNull(),
  company: varchar('Company', { length: 200 }),
  serviceType: varchar('ServiceType', { length: 200 }).notNull(),
  purpose: varchar('Purpose', { length: 2000 }).notNull(),
  durationMinutes: integer('DurationMinutes').notNull().default(30),
  meetingType: varchar('MeetingType', { length: 20 }).notNull().default('InPerson').$type<(typeof MEETING_TYPES)[number]>(),
  preferredDate: date('PreferredDate').notNull(),
  preferredTime: varchar('PreferredTime', { length: 10 }).notNull(),
  alternativeDate: date('AlternativeDate'),
  alternativeTime: varchar('AlternativeTime', { length: 10 }),
  specialRequirements: varchar('SpecialRequirements', { length: 2000 }),
  status: varchar('Status', { length: 20 }).notNull().default('Requested').$type<(typeof APPOINTMENT_STATUSES)[number]>(),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('IX_appointments_ReferenceNumber').on(t.referenceNumber),
  index('IX_appointments_AgencyCode').on(t.agencyCode),
  index('IX_appointments_ContactEmail').on(t.contactEmail),
]);

// ── system_settings (string primary key, not uuid) ───────────────────────

export const systemSettings = pgTable('system_settings', {
  key: varchar('Key', { length: 100 }).primaryKey(),
  value: varchar('Value', { length: 2000 }).notNull(),
  description: varchar('Description', { length: 200 }),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar('UpdatedBy', { length: 100 }),
});

// ── analytics_events ──────────────────────────────────────────────────────

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('Id').primaryKey().defaultRandom(),
  eventType: varchar('EventType', { length: 50 }).notNull(),
  eventName: varchar('EventName', { length: 100 }).notNull(),
  metadata: varchar('Metadata', { length: 500 }),
  userEmail: varchar('UserEmail', { length: 100 }),
  ipAddress: varchar('IpAddress', { length: 45 }),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('IX_analytics_events_EventType_CreatedAt').on(t.eventType, t.createdAt),
  index('IX_analytics_events_CreatedAt').on(t.createdAt),
]);

// ── audit_logs (append-only) ─────────────────────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('Id').primaryKey().defaultRandom(),
  timestamp: timestamp('Timestamp', { withTimezone: true }).notNull().defaultNow(),
  actorEmail: varchar('ActorEmail', { length: 255 }).notNull().default('(anonymous)'),
  actorRole: varchar('ActorRole', { length: 50 }).notNull().default('-'),
  action: varchar('Action', { length: 160 }).notNull(),
  details: varchar('Details', { length: 500 }),
  statusCode: integer('StatusCode').notNull(),
  ipAddress: varchar('IpAddress', { length: 45 }),
}, (t) => [
  index('IX_audit_logs_Timestamp').on(t.timestamp),
  index('IX_audit_logs_ActorEmail').on(t.actorEmail),
  index('IX_audit_logs_Action').on(t.action),
  index('IX_audit_logs_Timestamp_ActorEmail').on(t.timestamp, t.actorEmail),
]);

// ── chat_enquiries ────────────────────────────────────────────────────────

export const chatEnquiries = pgTable('chat_enquiries', {
  id: uuid('Id').primaryKey().defaultRandom(),
  sessionId: varchar('SessionId', { length: 100 }).notNull(),
  userName: varchar('UserName', { length: 100 }),
  userEmail: varchar('UserEmail', { length: 255 }),
  userPhone: varchar('UserPhone', { length: 30 }),
  userLocation: varchar('UserLocation', { length: 200 }),
  userMessage: varchar('UserMessage', { length: 2000 }).notNull(),
  botResponse: varchar('BotResponse', { length: 10000 }).notNull(),
  language: varchar('Language', { length: 10 }).notNull().default('En').$type<(typeof CHAT_LANGUAGES)[number]>(),
  sentiment: varchar('Sentiment', { length: 20 }).$type<(typeof CHAT_SENTIMENTS)[number] | null>(),
  tier: varchar('Tier', { length: 20 }).notNull().$type<(typeof CHAT_TIERS)[number]>(),
  createdAt: timestamp('CreatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('IX_chat_enquiries_SessionId_CreatedAt').on(t.sessionId, t.createdAt),
  index('IX_chat_enquiries_CreatedAt').on(t.createdAt),
]);

export const ticketDocumentsRelations = relations(ticketDocuments, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketDocuments.ticketId], references: [tickets.id] }),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
}));
