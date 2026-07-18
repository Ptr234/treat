import { eq } from 'drizzle-orm';
import { systemSettings } from '../db/schema';
import type { Db } from '../db/client';

/**
 * Minimal read-only port of the two SettingsService.cs methods TicketService
 * needs for escalation notifications. Full settings CRUD (SettingsController)
 * — including the in-memory caching SettingsService.cs layers on top of
 * these same reads — is its own later admin-surface slice; ported here only
 * as far as escalation emails actually require, not speculatively further.
 */
export const ESCALATION_EMAILS_KEY = 'escalation.emails';
export const ESCALATION_MESSAGE_KEY = 'escalation.notification_message';

export async function getSetting(db: Db, key: string, defaultValue = ''): Promise<string> {
  const [row] = await db.select({ value: systemSettings.value }).from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return row?.value ?? defaultValue;
}

export async function getEscalationEmails(db: Db): Promise<string[]> {
  const raw = await getSetting(db, ESCALATION_EMAILS_KEY, '');
  if (!raw.trim()) return [];
  return raw.split(',').map((e) => e.trim()).filter((e) => e.length > 0 && e.includes('@'));
}
