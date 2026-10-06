import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "My submissions",
  description: "Track your submissions to the OneStop Centre.",
  path: "/account/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
