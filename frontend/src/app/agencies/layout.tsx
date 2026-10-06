import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Agency hub",
  description: "Directory of Uganda government agencies that facilitate business and investment, with services, contacts, operating hours and direct service requests.",
  path: "/agencies/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
