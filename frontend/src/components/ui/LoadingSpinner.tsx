import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'yellow' | 'white' | 'black';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'yellow',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    yellow: 'border-yellow-300 border-t-yellow-500',
    white: 'border-white/30 border-t-white',
    black: 'border-black/30 border-t-black'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        border-2 rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center pt-6">
        <LoadingSpinner size="xl" color="yellow" className="mb-4" />
        <p className="text-lg font-bold text-black">Loading Uganda Investment Portal...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse border-t-2 border-neutral-200 pt-6">
      <div className="w-14 h-14 bg-neutral-200 mb-6"></div>
      <div className="h-6 bg-neutral-200 rounded mb-4 w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        <div className="h-4 bg-neutral-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="w-full max-w-6xl border-y border-neutral-200 px-4 py-8 md:py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse text-black">
            <div className="mx-auto mb-4 h-12 w-12 bg-neutral-200"></div>
            <div className="mx-auto mb-1 h-8 w-16 bg-neutral-200"></div>
            <div className="mx-auto h-4 w-20 bg-neutral-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
