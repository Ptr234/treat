import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { Env } from '../types';

/**
 * One `postgres.js` client per isolate, created lazily and reused across
 * requests handled by the same isolate (Hyperdrive owns the actual
 * connection pooling to Neon, so we don't need to pool on this side too).
 * `fetch_types: false` and `prepare: false` are Cloudflare's documented
 * settings for postgres.js over Hyperdrive — see
 * https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgresjs/
 */
let cachedSql: ReturnType<typeof postgres> | null = null;
let cachedConnectionString: string | null = null;

export function getDb(env: Env) {
  if (!cachedSql || cachedConnectionString !== env.HYPERDRIVE.connectionString) {
    cachedSql?.end({ timeout: 0 }).catch(() => {});
    cachedConnectionString = env.HYPERDRIVE.connectionString;
    cachedSql = postgres(env.HYPERDRIVE.connectionString, {
      max: 5,
      fetch_types: false,
      prepare: false,
    });
  }
  return drizzle(cachedSql, { schema });
}

export type Db = ReturnType<typeof getDb>;
