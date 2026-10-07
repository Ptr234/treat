import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import DashboardShell from '@/components/dashboard/DashboardShell';

// Staff-only area: never indexed.
export const metadata: Metadata = {
  title: 'Staff dashboard',
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
