import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Market analytics",
  description: "Market data on licensed investment projects, sector distribution, investment trends and pipelines in Uganda.",
  path: "/analytics/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
