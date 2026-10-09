'use client';

import type { ReactNode } from 'react';

export type BadgeTone =
  | 'neutral' | 'yellow' | 'red' | 'green' | 'blue' | 'purple'
  | 'orange' | 'amber' | 'cyan' | 'emerald' | 'rose' | 'solid-black' | 'solid-red';

// Every tone resolves to the flag palette. Callers keep their semantic names
// (green = done, yellow/amber = in progress, red/rose = needs attention…)
// while the rendered chip is always black, gold, red or grey.
const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'gov-tag--grey',
  yellow: 'gov-tag--gold',
  amber: 'gov-tag--gold',
  orange: 'gov-tag--gold',
  red: 'gov-tag--red',
  rose: 'gov-tag--red',
  'solid-red': 'gov-tag--red',
  green: '',
  emerald: '',
  'solid-black': '',
  blue: 'gov-tag--outline',
  purple: 'gov-tag--outline',
  cyan: 'gov-tag--outline',
};

interface StatusBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** A small status/role/category tag in the flag palette. */
export default function StatusBadge({ tone = 'neutral', children, className = '' }: StatusBadgeProps) {
  return <span className={`gov-tag ${TONE_CLASSES[tone]} ${className}`}>{children}</span>;
}
