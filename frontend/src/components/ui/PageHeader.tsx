import Link from 'next/link';
import type { ReactNode } from 'react';

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  /** Trail after "Home". The last crumb is the current page and needs no href. */
  crumbs?: Crumb[];
  /** Short section label shown above the title, e.g. "Services". */
  caption?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Buttons or links placed under the lead. */
  actions?: ReactNode;
  /** Right-hand column on wide screens: image, summary panel or quick facts. */
  aside?: ReactNode;
  /** Full-width content placed under the title block, e.g. key figures. */
  children?: ReactNode;
  /** Black header for staff or account areas. */
  tone?: 'paper' | 'dark';
};

export function Breadcrumbs({ crumbs, inverse = false }: { crumbs: Crumb[]; inverse?: boolean }) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...crumbs];
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-y-1 text-sm ${inverse ? 'text-white/80' : 'text-[#3b3934]'}`}>
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`mx-2.5 inline-block h-[7px] w-[7px] rotate-45 border-r-[1.5px] border-t-[1.5px] ${inverse ? 'border-white/60' : 'border-[#5c5850]'}`}
                />
              )}
              {crumb.href && !last ? (
                <Link href={crumb.href} className={`underline underline-offset-4 hover:decoration-2 ${inverse ? 'text-white' : 'text-black'}`}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'font-semibold' : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Standard title block for every public page. */
export default function PageHeader({ crumbs, caption, title, lead, actions, aside, children, tone = 'paper' }: PageHeaderProps) {
  const dark = tone === 'dark';
  return (
    <header className={dark ? 'bg-[#0b0b0b] text-white' : 'border-b border-[#dcd8cf] bg-[#f5f3ee] text-black'}>
      <div className="gov-container pb-10 pt-5 sm:pb-12">
        {crumbs && <Breadcrumbs crumbs={crumbs} inverse={dark} />}
        <div className={`mt-8 grid gap-10 sm:mt-10 ${aside ? 'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start' : ''}`}>
          <div className="flex gap-5 sm:gap-6">
            <span className="gov-flagbar hidden sm:block" aria-hidden="true" />
            <div className="min-w-0">
              {caption && <p className={`gov-caption ${dark ? '!text-[#ffd700]' : ''}`}>{caption}</p>}
              <h1 className={`gov-title-xl ${caption ? 'mt-2' : ''} max-w-4xl`}>{title}</h1>
              {lead && <div className={`gov-lead mt-5 ${dark ? '!text-white/85' : ''}`}>{lead}</div>}
              {actions && <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">{actions}</div>}
            </div>
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
        {children && <div className="mt-10">{children}</div>}
      </div>
    </header>
  );
}
