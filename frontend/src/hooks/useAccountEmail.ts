'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * The signed-in investor's account email, or null for visitors and staff.
 *
 * Self-service records (tickets, enquiries, appointments, chats) are matched to
 * an account by email, and the API files anything a signed-in investor submits
 * under their account address. Forms use this to show that address — filled in
 * and read-only — so confirmations and replies go where the user expects and
 * the submission appears under "My submissions".
 *
 * `apply` is called with the address once it is known (e.g. to put it into the
 * form's state). Staff filing on someone's behalf still type any address.
 */
export function useAccountEmail(apply?: (email: string) => void): string | null {
  const { user, isAuthenticated } = useAuth();
  const email =
    isAuthenticated && user?.role === 'user' && user.email ? user.email.trim().toLowerCase() : null;

  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (email) applyRef.current?.(email);
  }, [email]);

  return email;
}
