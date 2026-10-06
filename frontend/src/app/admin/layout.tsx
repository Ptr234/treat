import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// Administrator area: never indexed.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
