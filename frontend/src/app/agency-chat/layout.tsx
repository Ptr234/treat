import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Inter-agency chat",
  description: "Secure chat between government agency officers.",
  path: "/agency-chat/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
