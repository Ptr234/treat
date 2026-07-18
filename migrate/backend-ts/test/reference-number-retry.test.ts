import { describe, it, expect, vi } from 'vitest';
import { withUniqueReferenceRetry } from '../src/lib/reference-number';

function pgUniqueViolation(): Error & { code: string } {
  const err = new Error('duplicate key value violates unique constraint') as Error & { code: string };
  err.code = '23505';
  return err;
}

describe('withUniqueReferenceRetry (matches DbRetry.cs\'s SaveWithUniqueReferenceAsync)', () => {
  it('returns the result on first success', async () => {
    const attempt = vi.fn().mockResolvedValue('ok');
    expect(await withUniqueReferenceRetry(attempt)).toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('retries on a Postgres unique-violation (23505) and succeeds on a later attempt', async () => {
    const attempt = vi.fn()
      .mockRejectedValueOnce(pgUniqueViolation())
      .mockRejectedValueOnce(pgUniqueViolation())
      .mockResolvedValueOnce('ok-third-try');
    expect(await withUniqueReferenceRetry(attempt)).toBe('ok-third-try');
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-unique-violation error', async () => {
    const attempt = vi.fn().mockRejectedValue(new Error('some other DB error'));
    await expect(withUniqueReferenceRetry(attempt)).rejects.toThrow('some other DB error');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxAttempts', async () => {
    const attempt = vi.fn().mockRejectedValue(pgUniqueViolation());
    await expect(withUniqueReferenceRetry(attempt, 3)).rejects.toMatchObject({ code: '23505' });
    expect(attempt).toHaveBeenCalledTimes(3);
  });
});
