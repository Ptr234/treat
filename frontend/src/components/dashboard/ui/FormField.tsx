'use client';

import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Spans both columns in a 2-up form grid. */
  wide?: boolean;
  children: ReactNode;
}

/** Consistent label + control wrapper for dashboard add/edit forms. */
export default function FormField({ label, required, wide, children }: FormFieldProps) {
  return (
    <div className={wide ? 'md:col-span-2' : undefined}>
      <label className="block text-sm text-neutral-700 mb-1">
        {label}
        {required && ' *'}
      </label>
      {children}
    </div>
  );
}
