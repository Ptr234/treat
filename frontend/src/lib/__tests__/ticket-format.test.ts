import {
  normalizeStatus,
  normalizePriority,
  normalizeCategory,
  normalizeAuthorRole,
  hoursBetween,
} from '@/lib/ticket-format';

describe('ticket-format normalizers', () => {
  it('maps backend PascalCase status to the frontend union', () => {
    expect(normalizeStatus('New')).toBe('NEW');
    expect(normalizeStatus('InProgress')).toBe('IN_PROGRESS');
    expect(normalizeStatus('PendingExternal')).toBe('PENDING_EXTERNAL');
    expect(normalizeStatus('Resolved')).toBe('RESOLVED');
    expect(normalizeStatus('Closed')).toBe('CLOSED');
  });

  it('is idempotent for values already in frontend format', () => {
    expect(normalizeStatus('IN_PROGRESS')).toBe('IN_PROGRESS');
    expect(normalizePriority('low')).toBe('low');
    expect(normalizeCategory('general_inquiry')).toBe('general_inquiry');
  });

  it('maps priority and category casing', () => {
    expect(normalizePriority('Low')).toBe('low');
    expect(normalizePriority('Critical')).toBe('critical');
    expect(normalizeCategory('GeneralInquiry')).toBe('general_inquiry');
    expect(normalizeCategory('LicenseDelay')).toBe('license_delay');
    expect(normalizeCategory('Vip')).toBe('vip');
  });

  it('maps author roles and falls back safely on unknowns', () => {
    expect(normalizeAuthorRole('Officer')).toBe('officer');
    expect(normalizeAuthorRole('System')).toBe('system');
    expect(normalizeAuthorRole('garbage')).toBe('investor');
    expect(normalizeStatus(undefined)).toBe('NEW');
    expect(normalizePriority(null)).toBe('medium');
  });

  it('computes whole hours between timestamps, guarding bad input', () => {
    expect(hoursBetween('2026-07-01T00:00:00Z', '2026-07-01T06:00:00Z')).toBe(6);
    expect(hoursBetween('2026-07-01T00:00:00Z', undefined)).toBeNull();
    // end before start is treated as no data rather than a negative duration
    expect(hoursBetween('2026-07-01T06:00:00Z', '2026-07-01T00:00:00Z')).toBeNull();
  });
});
