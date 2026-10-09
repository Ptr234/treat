'use client';

import Link from 'next/link';
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
 * subtitle, and a slot for the page's primary action.
 */
export default function PageHeader({ title, subtitle, backHref = '/dashboard', actions }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b-2 border-black pb-5">
      <Link href={backHref} className="gov-link inline-flex items-center gap-1.5 text-sm font-normal">
        <span aria-hidden="true">←</span> Back to overview
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-4">
          <span className="gov-flagbar" aria-hidden="true" />
          <div>
            <h1 className="font-display text-3xl font-semibold text-black">{title}</h1>
            {subtitle && <p className="mt-1 text-[15px] text-[#3b3934]">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
