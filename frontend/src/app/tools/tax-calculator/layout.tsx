import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Tax calculator 2026",
  description: "Estimate Uganda individual income tax, corporate tax and VAT. Rates shown are for 2026 and should be verified with the Uganda Revenue Authority.",
  path: "/tools/tax-calculator/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
