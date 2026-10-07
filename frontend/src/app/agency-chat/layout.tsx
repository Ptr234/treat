import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const metadata = buildMetadata({
  title: "Inter-agency chat",
  description: "Secure chat between government agency officers.",
  path: "/agency-chat/",
  noIndex: true,
});

// Staff-only, same as /dashboard — wrapped in the shared shell so officers
// keep the persistent sidebar and a way back to the dashboard instead of
// landing on an orphaned page with no admin chrome at all.
export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
