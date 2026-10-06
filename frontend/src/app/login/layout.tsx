import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Admin sign in",
  description: "Sign in for authorised UIA administrators.",
  path: "/login/",
  noIndex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
