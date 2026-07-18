import { describe, it, expect } from 'vitest';
import { env } from 'cloudflare:test';
import { health } from '../src/routes/health';
import type { ApiResponseBody } from '../src/lib/response';

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  database: string;
}

describe('GET /api/health', () => {
  it('responds 200 with the ApiResponse shape even when the DB binding is unavailable', async () => {
    // wrangler.test.toml intentionally omits Hyperdrive (see its top comment),
    // so this also exercises the "database unavailable, don't 500" path.
    const res = await health.request('/', {}, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as ApiResponseBody<HealthData>;
    expect(body.success).toBe(true);
    expect(body.data?.status).toBe('ok');
    expect(body.data?.database).toBe('unavailable');
    expect(typeof body.data?.timestamp).toBe('string');
  });
});
