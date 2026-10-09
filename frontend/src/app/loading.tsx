export default function GlobalLoading() {
  return (
    <div className="gov-container flex min-h-[50vh] items-center py-16">
      {/* Self-contained keyframes so the loader needs no global CSS */}
      <style>{`
        @keyframes osc-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
      <div role="status" aria-live="polite" className="w-full max-w-sm">
        <p className="text-lg font-bold text-black">Loading…</p>
        <div className="mt-3 h-[6px] w-full overflow-hidden bg-[#ebe8e1]" aria-hidden="true">
          <div className="gov-stripe h-full w-1/3" style={{ animation: 'osc-slide 1.15s ease-in-out infinite' }} />
        </div>
        <p className="gov-hint mt-3">OneStop Centre Uganda</p>
      </div>
    </div>
  );
}
