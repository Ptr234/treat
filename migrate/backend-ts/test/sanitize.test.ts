import { describe, it, expect } from 'vitest';
import { stripHtml } from '../src/lib/sanitize';

describe('stripHtml (matches SanitizeHelper.cs)', () => {
  it('removes HTML tags and trims', () => {
    expect(stripHtml('<b>Hello</b> <i>World</i>  ')).toBe('Hello World');
  });

  it('handles empty/falsy input without throwing', () => {
    expect(stripHtml('')).toBe('');
  });

  it('leaves plain text untouched (besides trimming)', () => {
    expect(stripHtml('  plain text  ')).toBe('plain text');
  });

  it('strips a script tag entirely (content stays, tags go)', () => {
    expect(stripHtml('<script>alert(1)</script>safe')).toBe('alert(1)safe');
  });
});
