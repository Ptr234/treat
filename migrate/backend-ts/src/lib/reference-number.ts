import { like } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import { tickets, investorProfiles } from '../db/schema';
import type { Db } from '../db/client';

/**
 * Mirrors backend/src/OscApi/Common/ReferenceNumberGenerator.cs: fetch only
 * references matching the year prefix (a LIKE, same as the EF version) and
 * take the numeric MAX of their suffixes in memory — parsing as int rather
 * than sorting the strings, so "UIA-2026-10000" doesn't sort below
 * "UIA-2026-9999" as text past 9999.
 */
async function nextNumber(db: Db, table: PgTable, refColumn: AnyPgColumn, prefix: string): Promise<number> {
  const rows = await db.select({ ref: refColumn }).from(table).where(like(refColumn, `${prefix}%`));
  let max = 0;
  for (const row of rows as { ref: string }[]) {
    const suffix = row.ref.slice(prefix.length);
    const n = parseInt(suffix, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

export async function generateTicketReference(db: Db): Promise<string> {
  const prefix = `UIA-${new Date().getUTCFullYear()}-`;
  const next = await nextNumber(db, tickets, tickets.referenceNumber, prefix);
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export async function generateInvestorReference(db: Db): Promise<string> {
  const prefix = `INV-${new Date().getUTCFullYear()}-`;
  const next = await nextNumber(db, investorProfiles, investorProfiles.referenceNumber, prefix);
  return `${prefix}${String(next).padStart(4, '0')}`;
}

/**
 * Mirrors DbRetry.cs's SaveWithUniqueReferenceAsync: retries `attempt` (which
 * should regenerate the reference number each time) on a Postgres unique-
 * violation (SQLSTATE 23505), so two concurrent submissions racing for the
 * same generated number don't lose one to a 500.
 */
export async function withUniqueReferenceRetry<T>(attempt: () => Promise<T>, maxAttempts = 5): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await attempt();
    } catch (err) {
      const code = (err as { code?: string } | undefined)?.code;
      if (code === '23505' && i < maxAttempts) continue;
      throw err;
    }
  }
}
