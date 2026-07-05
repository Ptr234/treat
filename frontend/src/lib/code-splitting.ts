import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

/**
 * Create a lazy-loaded component with a loading skeleton.
 * Useful for heavy components (charts, maps, editors) that aren't immediately visible.
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: ReactNode,
  options?: { ssr?: boolean; delay?: number }
) {
  return dynamic(importFn, {
    loading: () => loadingComponent || <div className="animate-pulse bg-gray-200 rounded h-64" />,
    ssr: options?.ssr ?? false, // Disable SSR for heavy components by default
  });
}

// Pre-defined lazy components for heavy features
export const LazyInvestmentCalculator = createLazyComponent(
  () => import('@/components/tools/InvestmentCalculator'),
  <div className="bg-gray-100 p-8 rounded animate-pulse">Loading calculator...</div>
);

export const LazyDashboardCharts = createLazyComponent(
  () => import('@/components/dashboard/DashboardCharts'),
  <div className="bg-gray-100 p-8 rounded animate-pulse">Loading charts...</div>
);

export const LazyMapComponent = createLazyComponent(
  () => import('@/components/map/InteractiveMap'),
  <div className="bg-gray-100 p-8 rounded animate-pulse">Loading map...</div>,
  { ssr: false }
);

export const LazyChatbot = createLazyComponent(
  () => import('@/components/chatbot/ChatbotWidget'),
  <div className="bg-gray-100 p-8 rounded animate-pulse">Loading chatbot...</div>,
  { ssr: false }
);

/**
 * Utility to prefetch a lazy component (for better UX on hover/navigation)
 */
export function prefetchComponent(
  componentName: keyof typeof componentImports
): void {
  if (typeof window !== 'undefined') {
    const imports = componentImports[componentName];
    if (imports) {
      // Start loading in the background
      Promise.resolve(imports());
    }
  }
}

// Map of lazy-loadable components for prefetching
const componentImports = {
  InvestmentCalculator: () => import('@/components/tools/InvestmentCalculator'),
  DashboardCharts: () => import('@/components/dashboard/DashboardCharts'),
  InteractiveMap: () => import('@/components/map/InteractiveMap'),
  ChatbotWidget: () => import('@/components/chatbot/ChatbotWidget'),
};
