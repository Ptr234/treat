import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Search",
  description: "Search services, agencies, investment opportunities, documents and guides on the OneStopCentre.",
  path: "/search/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
