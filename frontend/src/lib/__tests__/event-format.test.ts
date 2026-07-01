import { mapSanityEvent, mapSanityEventCategory, deriveEventStatus } from '@/lib/event-format';
import type { SanityEvent } from '@/types/sanity';

const base: SanityEvent = {
  _id: 'abc123',
  _type: 'event',
  title: 'Uganda Investment Forum',
  slug: { current: 'uganda-investment-forum' },
  date: '2999-01-01',
  category: 'UIA Forum',
  isPublished: true,
};

describe('event-format', () => {
  it('maps Sanity categories to the UI union', () => {
    expect(mapSanityEventCategory('UIA Forum')).toBe('forum');
    expect(mapSanityEventCategory('Government Mission')).toBe('mission');
    expect(mapSanityEventCategory('Sector Symposium')).toBe('symposium');
    expect(mapSanityEventCategory('EAC Summit')).toBe('summit');
    expect(mapSanityEventCategory('Webinar')).toBe('webinar');
    expect(mapSanityEventCategory('Anything else')).toBe('forum');
  });

  it('derives status from dates', () => {
    expect(deriveEventStatus('2999-01-01')).toBe('upcoming');
    expect(deriveEventStatus('2000-01-01')).toBe('completed');
  });

  it('prefers slug as the id for clean URLs', () => {
    expect(mapSanityEvent(base).id).toBe('uganda-investment-forum');
    expect(mapSanityEvent({ ...base, slug: undefined as unknown as SanityEvent['slug'] }).id).toBe('abc123');
  });

  it('fills lean-schema gaps with hide-sentinels', () => {
    const e = mapSanityEvent(base);
    expect(e.capacity).toBe(0); // hides the registration block
    expect(e.speakers).toEqual([]); // hides the speakers section
    expect(e.time).toBe(''); // hides the start-time line
    expect(e.registrationDeadline).toBe('');
    expect(e.organizer).toBeTruthy();
  });

  it('keeps only resources that have a usable url', () => {
    const e = mapSanityEvent({
      ...base,
      resources: [
        { title: 'Agenda', url: 'https://example.com/agenda.pdf' },
        { title: 'Broken', file: undefined },
        { title: 'Asset', file: { asset: { url: 'https://cdn.sanity.io/x.pdf' } } },
      ],
    });
    expect(e.resources).toHaveLength(2);
    expect(e.resources[0]).toEqual({ name: 'Agenda', type: 'Document', url: 'https://example.com/agenda.pdf' });
  });
});
