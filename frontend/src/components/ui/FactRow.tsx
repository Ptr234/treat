import type { ReactNode } from 'react';

export type Fact = { label: string; value: ReactNode; note?: ReactNode };

/** Row of headline figures separated by vertical rules. */
export default function FactRow({ facts, inverse = false, className = '' }: { facts: Fact[]; inverse?: boolean; className?: string }) {
  const cols = facts.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : facts.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <dl className={`grid grid-cols-1 border-t-2 ${inverse ? 'border-[#ffd700]' : 'border-black'} ${cols} ${className}`}>
      {facts.map((fact, i) => (
        <div
          key={fact.label}
          className={`py-5 sm:pr-6 ${i > 0 ? `border-t sm:border-t-0 sm:border-l sm:pl-6 ${inverse ? 'border-white/20' : 'border-[#dcd8cf]'}` : ''}`}
        >
          <dt className={`text-xs font-bold uppercase tracking-[0.12em] ${inverse ? 'text-white/70' : 'text-[#5c5850]'}`}>{fact.label}</dt>
          <dd className={`gov-figure mt-2 ${inverse ? 'text-white' : 'text-black'}`}>{fact.value}</dd>
          {fact.note && <p className={`mt-2 text-sm ${inverse ? 'text-white/70' : 'text-[#5c5850]'}`}>{fact.note}</p>}
        </div>
      ))}
    </dl>
  );
}
