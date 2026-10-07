import React from 'react';
import Image from 'next/image';

// The only Uganda photographs confirmed free of watermarks, stock-photo
// branding, or identifiable people (see HomeContent.tsx's HERO_IMAGES) —
// reused here rather than risking an unvetted image on every other page's
// hero band.
const DEFAULT_IMAGE = '/images/uganda-kampala-city-view.webp';

/**
 * Brand title band for page headers — the same treatment as the homepage
 * hero (background photograph, dark gradient overlay, layered corner
 * borders) instead of a flat gradient with no image. Descendant headings
 * and paragraphs are recoloured so the existing title markup works
 * unchanged inside the band.
 */
export default function PageBand({
  children,
  image = DEFAULT_IMAGE,
}: {
  children: React.ReactNode;
  /** Override the background photo; defaults to the homepage hero's own image. */
  image?: string;
}) {
  return (
    <div className="page-band relative isolate overflow-hidden bg-black pb-12 text-white sm:pb-16">
      <div className="absolute inset-0 -z-10" data-decorative="true">
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-red-700/60" />
      </div>
      <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute -right-24 top-1/2 hidden h-80 w-80 -translate-y-1/2 lg:block">
        <span className="absolute inset-0 border border-yellow-400/40" />
        <span className="absolute inset-12 border border-white/20" />
        <span className="absolute inset-24 border-2 border-red-600/70" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
