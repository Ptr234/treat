'use client';

import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bordered white section wrapper used for list rows, panels and form sections. */
export default function Card({ title, actions, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-neutral-200 p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-display text-lg font-bold text-black">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
