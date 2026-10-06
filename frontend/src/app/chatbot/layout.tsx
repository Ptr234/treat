import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "AI investment assistant",
  description: "Ask the multilingual AI investment assistant about investing in Uganda, business registration, tax incentives, permits and sector opportunities.",
  path: "/chatbot/",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
