'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] sm:h-[500px] lg:h-[700px] bg-neutral-950 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#dcd8cf] border-t-black mx-auto mb-3" />
        <p className="text-neutral-400 text-sm">Loading interactive map...</p>
      </div>
    </div>
  ),
});

export default LeafletMap;
