import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Support",
  description: "Contact the OneStopCentre support team by live chat, phone, email or in person, read answers to common questions, and request urgent help.",
  path: "/support/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
