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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        <LoadingSpinner size="xl" color="yellow" className="mb-4" />
        <p className="text-lg font-semibold text-neutral-700">Loading Uganda Investment Portal...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-8 rounded-2xl animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-xl mb-6"></div>
      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="bg-gradient-to-r from-neutral-800/95 to-neutral-900/95 backdrop-blur-xl rounded-3xl px-6 py-8 md:px-12 md:py-10 mx-4 border border-yellow-500/30 shadow-2xl w-full max-w-6xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-white animate-pulse">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-600 rounded-2xl"></div>
            <div className="h-8 bg-gray-600 rounded mb-1 w-16 mx-auto"></div>
            <div className="h-4 bg-gray-600 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
