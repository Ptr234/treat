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
    <div className={`border border-[#dcd8cf] border-t-4 border-t-black bg-white p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold text-black">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
