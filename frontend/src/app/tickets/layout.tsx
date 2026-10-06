import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Track tickets",
  description: "Track and manage your OneStopCentre support tickets.",
  path: "/tickets/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
