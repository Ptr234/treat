import type { Metadata } from 'next';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, buildMetadata } from '@/lib/seo';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  ...buildMetadata({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: '/' }),
  title: { absolute: DEFAULT_TITLE },
};

export default function HomePage() {
  return <HomeContent />;
}
