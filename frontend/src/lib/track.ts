/**
 * Lightweight analytics event tracker.
 * Fire-and-forget — never blocks the UI.
 */

import { apiFetch } from './api-client';

export function trackEvent(
  eventType: 'tool_usage' | 'download' | 'search',
  eventName: string,
  metadata?: Record<string, unknown>,
) {
  apiFetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      eventName,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    }),
  }).catch(() => {
    // Fire-and-forget — never block UI for analytics
  });
}
