import React from 'react';

/** Shared editorial heading band for public content pages. */
export default function PageBand({ children }: {
  children: React.ReactNode;
  /** Kept optional for compatibility with existing pages. */
  image?: string;
}) {
  return <div className="page-band"><div className="page-band__inner">{children}</div></div>;
}
