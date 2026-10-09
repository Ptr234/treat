import Link from 'next/link';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  id?: string;
  kicker?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  link?: { label: string; href: string };
  level?: 'h2' | 'h3';
  className?: string;
};

/** Section title with an optional caption, intro and "see all" link. */
export default function SectionHeading({ id, kicker, title, intro, link, level = 'h2', className = '' }: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-3xl">
        {kicker && <p className="gov-kicker">{kicker}</p>}
        <Heading id={id} className={`gov-title-l ${kicker ? 'mt-3' : ''}`}>{title}</Heading>
        {intro && <p className="gov-body mt-3 text-[17px]">{intro}</p>}
      </div>
      {link && (
        <Link href={link.href} className="gov-arrow-link shrink-0 text-[15px]">
          {link.label}
        </Link>
      )}
    </div>
  );
}
