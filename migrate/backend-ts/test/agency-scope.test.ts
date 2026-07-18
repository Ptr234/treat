import { describe, it, expect } from 'vitest';
import { resolveAgencyScope } from '../src/lib/agency-scope';
import type { SessionClaims } from '../src/lib/jwt';

function session(overrides: Partial<SessionClaims>): SessionClaims {
  return { sub: '1', email: 'a@b.com', name: 'A', role: 'agency_officer', ...overrides };
}

describe('resolveAgencyScope (matches the duplicated ResolveAgencyScope/AgencyScope helpers)', () => {
  it('returns no scope and not misconfigured for admin-level roles', () => {
    expect(resolveAgencyScope(session({ role: 'admin' }))).toEqual({ scope: null, misconfigured: false });
    expect(resolveAgencyScope(session({ role: 'dg' }))).toEqual({ scope: null, misconfigured: false });
  });

  it('returns the agency code for a properly configured officer', () => {
    expect(resolveAgencyScope(session({ role: 'agency_officer', agencyCode: 'URSB' })))
      .toEqual({ scope: 'URSB', misconfigured: false });
  });

  it('flags misconfigured when an officer has no agency code', () => {
    expect(resolveAgencyScope(session({ role: 'agency_officer', agencyCode: undefined })))
      .toEqual({ scope: null, misconfigured: true });
  });

  it('returns no scope for an undefined session (unauthenticated)', () => {
    expect(resolveAgencyScope(undefined)).toEqual({ scope: null, misconfigured: false });
  });
});
