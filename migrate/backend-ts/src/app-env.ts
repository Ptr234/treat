import type { Env } from './types';
import type { SessionClaims } from './lib/jwt';

/** Hono's generic app-env: Cloudflare bindings + per-request variables set by middleware. */
export interface AppEnv {
  Bindings: Env;
  Variables: {
    session?: SessionClaims;
  };
}
