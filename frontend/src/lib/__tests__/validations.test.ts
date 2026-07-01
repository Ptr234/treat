import { createTicketSchema, paginationSchema, SLA_HOURS } from '@/lib/validations';

describe('createTicketSchema', () => {
  const valid = {
    title: 'Business registration query',
    description: 'I need help registering my company through URSB.',
    category: 'general_inquiry',
    priority: 'medium',
    contactName: 'Jane Investor',
    contactEmail: 'jane@example.com',
  };

  it('accepts a valid ticket and applies defaults', () => {
    const result = createTicketSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isEscalated).toBe(false);
      expect(result.data.documents).toEqual([]);
    }
  });

  it('rejects an invalid email', () => {
    expect(createTicketSchema.safeParse({ ...valid, contactEmail: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an unknown category', () => {
    expect(createTicketSchema.safeParse({ ...valid, category: 'BUSINESS_REGISTRATION' }).success).toBe(false);
  });

  it('requires a non-empty title', () => {
    expect(createTicketSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });

  it('defaults priority to medium when omitted', () => {
    const { priority, ...withoutPriority } = valid;
    void priority;
    const result = createTicketSchema.safeParse(withoutPriority);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.priority).toBe('medium');
  });
});

describe('paginationSchema', () => {
  it('coerces string query params to numbers', () => {
    const result = paginationSchema.safeParse({ from: '10', to: '20' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ from: 10, to: 20 });
  });

  it('rejects when "to" is not greater than "from"', () => {
    expect(paginationSchema.safeParse({ from: 50, to: 50 }).success).toBe(false);
  });

  it('applies defaults', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ from: 0, to: 50 });
  });
});

describe('SLA_HOURS', () => {
  it('defines an SLA for every ticket category', () => {
    for (const category of ['general_inquiry', 'procedure_query', 'application_support', 'license_delay', 'complaint', 'vip']) {
      expect(typeof SLA_HOURS[category]).toBe('number');
    }
  });

  it('gives VIP the tightest SLA', () => {
    expect(SLA_HOURS.vip ?? Infinity).toBeLessThanOrEqual(SLA_HOURS.general_inquiry ?? 0);
  });
});
