import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Invoice generator",
  description: "Create tax-compliant invoices with 18% VAT for your business transactions in Uganda.",
  path: "/tools/invoice-generator/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
