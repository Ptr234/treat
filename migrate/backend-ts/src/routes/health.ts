import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/client';
import { ok } from '../lib/response';
import type { AppEnv } from '../app-env';

/** Mirrors backend/src/OscApi/Controllers/HealthController.cs's response shape. */
export const health = new Hono<AppEnv>();

health.get('/', async (c) => {
  let dbOk = false;
  try {
    await getDb(c.env).execute(sql`select 1`);
    dbOk = true;
  } catch {
    // DB not configured/reachable yet — health check still returns 200 so
    // Cloudflare's healthCheckPath doesn't flap the Worker during Phase 1
    // before Hyperdrive is wired to a real Neon branch.
  }

  return c.json(
    ok({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      database: dbOk ? 'connected' : 'unavailable',
    })
  );
});
