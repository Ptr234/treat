'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="bg-white">
      <div className="gov-container py-16 lg:py-24">
        <div className="flex max-w-3xl gap-6">
          <span className="gov-flagbar hidden sm:block" aria-hidden="true" />
          <div>
            <p className="gov-caption">Service error</p>
            <h1 className="gov-title-xl mt-2">Sorry, there is a problem with the service</h1>
            <p className="gov-lead mt-6">Try again now. If it keeps happening, try again later — anything you entered may not have been saved.</p>
            <p className="gov-body mt-3 text-[17px]">
              You can also <Link href="/support" className="gov-link">contact the OneStop Centre</Link> or call{' '}
              <a href="tel:+256414301000" className="gov-link">+256 414 301 000</a>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="button" onClick={reset} className="gov-btn">Try again</button>
              <Link href="/" className="gov-link">Go to the homepage</Link>
            </div>
            {error.digest && <p className="gov-hint mt-8">Error reference: <span className="font-mono">{error.digest}</span></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
