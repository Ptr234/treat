import type { Context } from 'hono';
import { auditLogs } from '../db/schema';
import { getDb } from '../db/client';
import { clientIp } from './rate-limit';
import type { AppEnv } from '../app-env';

/**
 * Best-effort audit entry, mirrors AuthController.cs's AuditAsync. Queued via
 * `executionCtx.waitUntil` so it never delays the response — the Workers-
 * native equivalent of the ASP.NET AuditMiddleware's fire-and-forget
 * `Task.Run`, but without that code's original DI-scope-disposal bug (there's
 * no per-request DI scope to outlive here; `getDb` is isolate-scoped).
 */
export function auditAsync(
  c: Context<AppEnv>,
  entry: { email: string; role: string; action: string; details?: string | null; status: number }
): void {
  c.executionCtx.waitUntil(
    getDb(c.env)
      .insert(auditLogs)
      .values({
        actorEmail: entry.email,
        actorRole: entry.role,
        action: entry.action,
        details: entry.details ?? null,
        statusCode: entry.status,
        ipAddress: clientIp(c.req.raw),
      })
      .then(() => {})
      .catch((err) => console.error('[audit] failed to write entry', err))
  );
}
