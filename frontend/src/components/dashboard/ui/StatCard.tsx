'use client';

type StatTone = 'black' | 'red' | 'green' | 'yellow';

const TONE_CLASSES: Record<StatTone, string> = {
  black: 'border-t-black',
  red: 'border-t-[#ce1126]',
  green: 'border-t-black',
  yellow: 'border-t-[#ffd700]',
};

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: StatTone;
}

/** One tile in a dashboard stats row — label, big value, optional helper line. */
export default function StatCard({ label, value, helper, tone = 'black' }: StatCardProps) {
  return (
    <div className={`border border-[#dcd8cf] border-t-4 bg-white p-5 ${TONE_CLASSES[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c5850]">{label}</p>
      <p className="gov-figure mt-2 text-black">{value}</p>
      {helper && <p className="mt-2 text-sm text-[#5c5850]">{helper}</p>}
    </div>
  );
}
