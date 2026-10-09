'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  /** Primary action(s) — e.g. an "Add" button — rendered on the right. */
  actions?: ReactNode;
}

/**
 * Consistent header for every dashboard sub-page: back link, title,
 * subtitle, and a slot for the page's primary action. Replaces the
 * hand-rolled version of this block that each page used to duplicate.
 */
export default function PageHeader({ title, subtitle, backHref = '/dashboard', actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-8 flex-wrap border-b border-[#e1e7e1] pb-6">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="p-2.5 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#e1e7e1]"
          aria-label="Back to dashboard"
        >
          <ArrowLeftIcon className="w-5 h-5 text-neutral-700" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-black">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-700 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
