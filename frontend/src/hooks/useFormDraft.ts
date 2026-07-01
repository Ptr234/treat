'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

interface DraftEnvelope<T> {
  formType: string;
  data: T;
  updatedAt: string;
}

/**
 * Server-side draft persistence for a multi-step form, tied to the signed-in
 * user (resumable across devices). For anonymous users it's a no-op.
 *
 * - `loadedDraft` — the previously saved draft, once fetched (or null).
 * - `draftLoaded` — true once the initial fetch has settled (so callers can
 *   avoid saving over a draft before it has been read back).
 * - `saveDraft` — debounced upsert of the current form state.
 * - `clearDraft` — delete the draft (call after a successful submit).
 */
export function useFormDraft<T extends object>(formType: string) {
  const { isAuthenticated } = useAuth();
  const [loadedDraft, setLoadedDraft] = useState<T | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setDraftLoaded(true);
      return;
    }
    (async () => {
      try {
        const res = await apiFetch<DraftEnvelope<T>>(`/api/me/drafts/${formType}`);
        if (!cancelled && res.success && res.data?.data) {
          setLoadedDraft(res.data.data);
        }
      } catch {
        /* ignore — drafts are best-effort */
      } finally {
        if (!cancelled) setDraftLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, formType]);

  const saveDraft = useCallback(
    (data: T) => {
      if (!isAuthenticated) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        apiFetch(`/api/me/drafts/${formType}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }).catch(() => {});
      }, 800);
    },
    [isAuthenticated, formType],
  );

  const clearDraft = useCallback(() => {
    if (!isAuthenticated) return;
    if (timer.current) clearTimeout(timer.current);
    apiFetch(`/api/me/drafts/${formType}`, { method: 'DELETE' }).catch(() => {});
  }, [isAuthenticated, formType]);

  return { loadedDraft, draftLoaded, saveDraft, clearDraft };
}

export default useFormDraft;
