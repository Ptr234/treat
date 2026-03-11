'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] bg-neutral-950 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-neutral-400 text-sm">Loading interactive map...</p>
      </div>
    </div>
  ),
});

export default LeafletMap;
