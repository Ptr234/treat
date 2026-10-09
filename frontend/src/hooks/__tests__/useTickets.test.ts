import { buildTicketListPath, type TicketQuery } from '../useTickets';

const base: TicketQuery = { page: 1, pageSize: 24, status: 'ALL', priority: 'ALL', search: '', sort: 'newest' };

describe('buildTicketListPath', () => {
  it('sends only paging and sort when nothing is filtered', () => {
    expect(buildTicketListPath(base)).toBe('/api/tickets?page=1&pageSize=24&sort=newest');
  });

  it('maps UI statuses to the API values and trims the search', () => {
    const path = buildTicketListPath({
      ...base,
      page: 3,
      status: 'PENDING_EXTERNAL',
      priority: 'critical',
      search: '  land title ',
      sort: 'sla',
    });
    const params = new URL(path, 'http://x').searchParams;
    expect(params.get('page')).toBe('3');
    expect(params.get('status')).toBe('pending_external');
    expect(params.get('priority')).toBe('critical');
    expect(params.get('q')).toBe('land title');
    expect(params.get('sort')).toBe('sla');
  });
});
