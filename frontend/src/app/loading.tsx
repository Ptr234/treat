import Image from 'next/image';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Self-contained keyframes so the loader needs no global CSS */}
      <style>{`
        @keyframes osc-slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
      `}</style>

      <div className="flex flex-col items-center">
        {/* Emblem with spinning gold ring */}
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border-[3px] border-neutral-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-yellow-500 border-r-yellow-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/uganda-coat-of-arms.png"
              alt="Republic of Uganda"
              width={56}
              height={56}
              className="object-contain animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Brand */}
        <h2 className="text-lg font-bold text-neutral-900 tracking-wide text-center">
          Uganda Investment Authority
        </h2>
        <p className="text-sm text-neutral-500 mb-7">OneStop Centre</p>

        {/* Indeterminate Uganda-flag accent bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden bg-neutral-100">
          <div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-black"
            style={{ animation: 'osc-slide 1.15s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
}
