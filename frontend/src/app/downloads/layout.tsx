import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Downloads and resources",
  description: "Official forms, guides and documents for business registration, tax and investment in Uganda, available to download.",
  path: "/downloads/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
