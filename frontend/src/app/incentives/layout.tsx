import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Investment incentives',
  description: 'Tax holidays, exemptions and allowances for investors in Uganda under the Investment Code Act 2019, the Income Tax Act and the free zones regime, with eligibility conditions and sources.',
  path: '/incentives/',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
