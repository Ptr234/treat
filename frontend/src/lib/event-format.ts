/**
 * Maps a Sanity `event` document to the richer `InvestmentEvent` shape the
 * public events UI was originally built around (from sample data).
 *
 * The Sanity schema is intentionally lean (title, date, category, description,
 * location, registrationUrl, image, resources), so fields the UI can show but
 * Sanity does not track are set to "empty" sentinels — capacity 0, no speakers,
 * blank time/deadline — and the components hide those sections accordingly.
 */
import type { InvestmentEvent, EventCategory, EventStatus } from '@/types';
import type { SanityEvent } from '@/types/sanity';

const CATEGORY_MAP: Record<string, EventCategory> = {
  'uia forum': 'forum',
  'government mission': 'mission',
  'sector symposium': 'symposium',
  'eac summit': 'summit',
  'global event': 'forum',
  webinar: 'webinar',
};

export function mapSanityEventCategory(raw: string | undefined): EventCategory {
  return CATEGORY_MAP[(raw ?? '').toLowerCase()] ?? 'forum';
}

/** Derive a lifecycle status from the event dates (Sanity has no status field). */
export function deriveEventStatus(date: string, endDate?: string): EventStatus {
  const now = Date.now();
  const start = new Date(date).getTime();
  if (Number.isNaN(start)) return 'upcoming';
  const end = endDate ? new Date(endDate).getTime() : start;
  if (now < start) return 'upcoming';
  if (now > (Number.isNaN(end) ? start : end)) return 'completed';
  return 'ongoing';
}

export function mapSanityEvent(s: SanityEvent): InvestmentEvent {
  return {
    // Prefer the slug for clean URLs; fall back to the document id.
    id: s.slug?.current || s._id,
    title: s.title,
    description: s.description ?? '',
    category: mapSanityEventCategory(s.category),
    date: s.date,
    endDate: s.endDate,
    time: '', // not tracked in Sanity — the UI omits the start time when blank
    location: s.location ?? 'To be announced',
    isVirtual: false,
    virtualLink: undefined,
    registrationDeadline: '', // not tracked — hidden when blank
    capacity: 0, // not tracked — hides the registration progress block
    registered: 0,
    speakers: [], // not tracked — hides the speakers section
    resources: (s.resources ?? [])
      .filter((r) => r.url || r.file?.asset?.url)
      .map((r) => ({
        name: r.title,
        type: 'Document',
        url: (r.url || r.file?.asset?.url) as string,
      })),
    status: deriveEventStatus(s.date, s.endDate),
    imageUrl: s.image?.asset?.url,
    organizer: 'Uganda Investment Authority',
  };
}
