import React from 'react';

/**
 * Brand title band for page headers: black-to-red gradient, layered borders
 * and light text. Descendant headings and paragraphs are recoloured so the
 * existing title markup works unchanged inside the band.
 */
export default function PageBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-black via-black to-red-700/60 pb-12 text-white sm:pb-16 [&_.text-red-600]:text-yellow-300 [&_h1]:text-white [&_h2]:text-white [&_label]:text-white/85 [&_p]:text-white/85">
      <div aria-hidden="true" data-decorative="true" className="pointer-events-none absolute -right-24 top-1/2 hidden h-80 w-80 -translate-y-1/2 lg:block">
        <span className="absolute inset-0 border border-yellow-400/40" />
        <span className="absolute inset-12 border border-white/20" />
        <span className="absolute inset-24 border-2 border-red-600/70" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
