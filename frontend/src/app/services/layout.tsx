import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Government services",
  description: "Find business registration, licensing, tax and compliance services from the agencies that deliver them in Uganda, with indicative timelines and costs.",
  path: "/services/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
