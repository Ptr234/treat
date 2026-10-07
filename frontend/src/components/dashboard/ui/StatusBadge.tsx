'use client';

import type { ReactNode } from 'react';

export type BadgeTone =
  | 'neutral' | 'yellow' | 'red' | 'green' | 'blue' | 'purple'
  | 'orange' | 'amber' | 'cyan' | 'emerald' | 'rose' | 'solid-black' | 'solid-red';

// Light-mode convention (-50/-100 bg, -700/-800 text) used consistently
// across the app's correctly-styled badges (TicketCard, SLAIndicator) —
// the dark-theme shades (-400 text on -500/20 bg) that crept into several
// dashboard pages read as near-invisible on these white page bodies.
const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  yellow: 'bg-yellow-50 text-red-600',
  red: 'bg-red-50 text-red-700',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  amber: 'bg-amber-100 text-amber-800',
  cyan: 'bg-cyan-100 text-cyan-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  rose: 'bg-rose-100 text-rose-800',
  'solid-black': 'bg-black text-yellow-400',
  'solid-red': 'bg-red-600 text-white',
};

interface StatusBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** A small colored status/role/category pill, in the app's one light-mode palette. */
export default function StatusBadge({ tone = 'neutral', children, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </span>
  );
}
