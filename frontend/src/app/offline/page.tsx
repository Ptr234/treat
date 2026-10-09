'use client';

export default function OfflinePage() {
  return (
    <div className="bg-white">
      <div className="gov-container py-16 lg:py-24">
        <div className="flex max-w-3xl gap-6">
          <span className="gov-flagbar hidden sm:block" aria-hidden="true" />
          <div>
            <p className="gov-caption">No connection</p>
            <h1 className="gov-title-xl mt-2">You are offline</h1>
            <p className="gov-lead mt-6">Check your internet or mobile data connection, then try again.</p>
            <p className="gov-body mt-3 text-[17px]">
              Pages you have already visited may still open. Forms cannot be sent until you are back online.
            </p>
            <button type="button" onClick={() => window.location.reload()} className="gov-btn mt-8">Try again</button>
          </div>
        </div>
      </div>
    </div>
  );
}
