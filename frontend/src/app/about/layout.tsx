import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "About",
  description: "About the OneStop Centre Uganda: our mission, the services we offer and the results we report for investment and business in Uganda.",
  path: "/about/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
