import { describe, it, expect } from 'vitest';
import { createTicketSchema, publicCommentSchema, toPascalCase } from '../src/schemas/tickets';

describe('toPascalCase (matches TicketService.ToPascalCase)', () => {
  it('converts snake_case to PascalCase', () => {
    expect(toPascalCase('general_inquiry')).toBe('GeneralInquiry');
    expect(toPascalCase('in_progress')).toBe('InProgress');
    expect(toPascalCase('vip')).toBe('Vip');
  });
});

describe('createTicketSchema (matches CreateTicketValidator.cs)', () => {
  const base = {
    title: 'Test', description: 'Desc', category: 'general_inquiry',
    contactEmail: 'a@b.com', contactName: 'Alice',
  };

  it('accepts a minimal valid payload', () => {
    expect(createTicketSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an invalid category', () => {
    expect(createTicketSchema.safeParse({ ...base, category: 'not_a_category' }).success).toBe(false);
  });

  it('rejects an invalid priority when provided', () => {
    expect(createTicketSchema.safeParse({ ...base, priority: 'urgent' }).success).toBe(false);
  });

  it('accepts an omitted priority (defaults applied downstream, not by the schema)', () => {
    expect(createTicketSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(createTicketSchema.safeParse({ ...base, contactEmail: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a title over 200 chars', () => {
    expect(createTicketSchema.safeParse({ ...base, title: 'x'.repeat(201) }).success).toBe(false);
  });
});

describe('publicCommentSchema', () => {
  it('requires content, authorName, authorEmail', () => {
    expect(publicCommentSchema.safeParse({ content: 'x', authorName: 'A', authorEmail: 'a@b.com' }).success).toBe(true);
    expect(publicCommentSchema.safeParse({ content: 'x', authorName: 'A' }).success).toBe(false);
  });
});
