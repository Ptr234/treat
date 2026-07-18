import { describe, it, expect } from 'vitest';
import { computeSla } from '../src/lib/sla';

describe('computeSla (matches SlaCalculator.cs exactly)', () => {
  it('uses the category baseline at medium priority', () => {
    expect(computeSla('GeneralInquiry', 'Medium').hours).toBe(24);
    expect(computeSla('ProcedureQuery', 'Medium').hours).toBe(8);
    expect(computeSla('ApplicationSupport', 'Medium').hours).toBe(4);
    expect(computeSla('LicenseDelay', 'Medium').hours).toBe(2);
    expect(computeSla('Complaint', 'Medium').hours).toBe(2);
    expect(computeSla('Vip', 'Medium').hours).toBe(1);
  });

  it('takes the stricter of category baseline and priority ceiling', () => {
    // Critical priority ceiling (2h) is stricter than GeneralInquiry's 24h baseline.
    expect(computeSla('GeneralInquiry', 'Critical').hours).toBe(2);
    // Vip's 1h baseline is stricter than Low priority's 48h ceiling.
    expect(computeSla('Vip', 'Low').hours).toBe(1);
  });

  it('defaults to Medium priority when omitted', () => {
    expect(computeSla('GeneralInquiry').hours).toBe(24);
  });

  it('deadline is now + hours', () => {
    const before = Date.now();
    const { hours, deadline } = computeSla('LicenseDelay', 'Medium');
    const delta = deadline.getTime() - before;
    expect(delta).toBeGreaterThan((hours * 3600_000) - 5000);
    expect(delta).toBeLessThanOrEqual(hours * 3600_000 + 5000);
  });
});
