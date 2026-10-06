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

  it('routes migrated prefixes to the backend, versioned, when BACKEND_URL is set', async () => {
    const fetchMock = mockFetch({ success: true, data: 1 });
    const apiFetch = await load('http://backend:5082');

    await apiFetch('/api/tickets');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend:5082/api/v1/tickets',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('keeps the backend health check unversioned', async () => {
    const fetchMock = mockFetch({ success: true });
    const apiFetch = await load('http://backend:5082');

    await apiFetch('/api/health');

    expect(fetchMock).toHaveBeenCalledWith('http://backend:5082/api/health', expect.anything());
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

  it('normalizes an RFC 7807 problem+json backend error into { success:false, error }', async () => {
    mockFetch(
      { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Investor profile not found', instance: '/api/v1/investors/x' },
      false,
      404,
    );
    const apiFetch = await load('http://backend:5082');

    const res = await apiFetch('/api/investors/x');

    expect(res).toEqual({ success: false, error: 'Investor profile not found' });
  });

  it('times out a hung request instead of leaving callers stuck forever', async () => {
    // Mirrors a fetch that never settles on its own (a stalled connection) —
    // it only resolves/rejects if the signal it was given aborts.
    global.fetch = jest.fn((_url, init?: RequestInit) => new Promise((resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    })) as unknown as typeof fetch;
    jest.useFakeTimers();
    const apiFetch = await load('');

    const pending = apiFetch('/api/dashboard');
    await jest.advanceTimersByTimeAsync(20_000);
    const res = await pending;

    expect(res).toEqual({
      success: false,
      error: 'Request timed out. Please check your connection and try again.',
    });
    jest.useRealTimers();
  });
});
