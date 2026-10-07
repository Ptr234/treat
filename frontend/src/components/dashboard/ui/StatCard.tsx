'use client';

type StatTone = 'black' | 'red' | 'green' | 'yellow';

const TONE_CLASSES: Record<StatTone, string> = {
  black: 'text-black',
  red: 'text-red-700',
  green: 'text-green-700',
  yellow: 'text-yellow-700',
};

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: StatTone;
}

/**
 * One tile in a dashboard stats row — label, big value, optional helper
 * line. A single shared shape so every page's metrics row reads the same
 * instead of each page inventing its own padding/border/type scale.
 */
export default function StatCard({ label, value, helper, tone = 'black' }: StatCardProps) {
  return (
    <div className="p-5 border-t border-neutral-200 pt-5">
      <p className="text-sm text-neutral-600 font-medium">{label}</p>
      <p className={`font-display text-3xl font-bold mt-1 ${TONE_CLASSES[tone]}`}>{value}</p>
      {helper && <p className="text-xs text-neutral-500 mt-1">{helper}</p>}
    </div>
  );
}
