import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Investment process',
  description: 'The steps to set up and license an investment in Uganda: company registration with URSB, tax registration with URA, the UIA investment licence, sector licences and work permits.',
  path: '/investments/process/',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
