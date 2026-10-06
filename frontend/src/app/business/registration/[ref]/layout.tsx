import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Registration status",
  description: "Status of a business registration application.",
  path: "/business/registration/[ref]/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
