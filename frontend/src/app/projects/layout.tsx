import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Licensed projects map",
  description: "Explore licensed investment projects across Uganda on an interactive map, filtered by sector, region, investment size and status.",
  path: "/projects/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
