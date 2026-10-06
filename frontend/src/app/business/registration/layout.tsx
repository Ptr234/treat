import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Business registration",
  description: "Register your company in Uganda with the step-by-step wizard. See estimated costs, required documents and timeframes for your business type.",
  path: "/business/registration/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
