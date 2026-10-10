/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('jose', () => ({ jwtVerify: jest.fn().mockRejectedValue(new Error('no session')) }));

const ORIGINAL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function run(path: string, backendUrl: string | undefined) {
  jest.resetModules();
  if (backendUrl === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
  else process.env.NEXT_PUBLIC_BACKEND_URL = backendUrl;
  const { middleware } = await import('@/middleware');
  return middleware(new NextRequest(`https://oscdigitaltool.com${path}`, { method: 'POST' }));
}

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
  else process.env.NEXT_PUBLIC_BACKEND_URL = ORIGINAL;
});

describe('superseded Next.js API routes', () => {
  it.each(['/api/tickets/', '/api/investors/', '/api/upload/', '/api/auth/login/', '/api/health/', '/api/tickets/UIA-2026-0001/messages/'])(
    'returns 404 for %s when the backend serves it',
    async (path) => {
      const res = await run(path, 'https://api.oscdigitaltool.com');
      expect(res.status).toBe(404);
    },
  );

  it('leaves Sanity content routes alone', async () => {
    const res = await run('/api/events/', 'https://api.oscdigitaltool.com');
    expect(res.status).toBe(200);
  });

  it('does not block a route that merely shares a prefix', async () => {
    const res = await run('/api/healthcheck-other/', 'https://api.oscdigitaltool.com');
    expect(res.status).toBe(200);
  });

  it('keeps the routes for local development without a backend', async () => {
    const res = await run('/api/tickets/', undefined);
    expect(res.status).toBe(200);
  });
});
