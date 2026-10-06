import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Events and investment activities",
  description: "Investment forums, missions, summits and webinars in Uganda. Find upcoming events and register to meet investors and officials.",
  path: "/events/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
