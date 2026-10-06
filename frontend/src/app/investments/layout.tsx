import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Investment opportunities",
  description: "Browse investment opportunities across Uganda in agriculture, tourism, mining, energy, ICT and infrastructure, with investment ranges, ROI and timelines.",
  path: "/investments/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
