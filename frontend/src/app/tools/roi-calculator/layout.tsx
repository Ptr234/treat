import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "ROI calculator",
  description: "Calculate return on investment for Uganda business opportunities with sector multipliers, ATMS tax incentives and location risk.",
  path: "/tools/roi-calculator/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
