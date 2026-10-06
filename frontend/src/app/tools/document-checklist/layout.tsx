import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Document checklist",
  description: "Checklist of documents needed for business registration, tax registration and investment licensing in Uganda.",
  path: "/tools/document-checklist/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
