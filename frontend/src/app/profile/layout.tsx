import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Profile",
  description: "Your OneStopCentre profile.",
  path: "/profile/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
