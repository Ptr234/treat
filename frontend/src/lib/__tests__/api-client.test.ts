/**
 * apiFetch reads NEXT_PUBLIC_BACKEND_URL at module load, so each scenario
 * resets modules and re-imports with a controlled env value.
 */
describe('apiFetch URL resolution', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    jest.resetModules();
  });

  async function load(backendUrl?: string) {
    jest.resetModules();
    if (backendUrl === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = backendUrl;
    return (await import('@/lib/api-client')).apiFetch;
  }

  function mockFetch(body: unknown, ok = true, status = 200) {
    const fn = jest.fn().mockResolvedValue({ ok, status, json: async () => body });
    global.fetch = fn as unknown as typeof fetch;
    return fn;
  }

  it('routes migrated prefixes to the backend when BACKEND_URL is set', async () => {
    const fetchMock = mockFetch({ success: true, data: 1 });
    const apiFetch = await load('http://backend:5082');

    await apiFetch('/api/tickets');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend:5082/api/tickets',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('keeps non-migrated (Sanity) routes on the same origin', async () => {
    const fetchMock = mockFetch({ success: true });
    const apiFetch = await load('http://backend:5082');

    await apiFetch('/api/agencies');

    expect(fetchMock).toHaveBeenCalledWith('/api/agencies', expect.anything());
  });

  it('uses relative URLs when BACKEND_URL is empty', async () => {
    const fetchMock = mockFetch({ success: true });
    const apiFetch = await load('');

    await apiFetch('/api/tickets');

    expect(fetchMock).toHaveBeenCalledWith('/api/tickets', expect.anything());
  });

  it('normalizes a non-ok response into { success:false, error }', async () => {
    mockFetch({ error: 'Authentication required' }, false, 401);
    const apiFetch = await load('');

    const res = await apiFetch('/api/dashboard');

    expect(res).toEqual({ success: false, error: 'Authentication required' });
  });
});
