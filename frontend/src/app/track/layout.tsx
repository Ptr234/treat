import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track a business registration',
  description: 'Use your application reference to check the status of a business registration submitted through the Uganda OneStop Centre.',
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
