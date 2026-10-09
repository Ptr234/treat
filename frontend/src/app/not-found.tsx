import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-white">
      <div className="gov-container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-24">
        <div className="flex gap-6">
          <span className="gov-flagbar hidden sm:block" aria-hidden="true" />
          <div className="max-w-2xl">
            <p className="gov-caption">Error 404</p>
            <h1 className="gov-title-xl mt-2">Page not found</h1>
            <p className="gov-lead mt-6">If you typed the web address, check it is correct.</p>
            <p className="gov-body mt-3 text-[17px]">If you pasted the web address, check you copied the entire address.</p>
            <p className="gov-body mt-3 text-[17px]">
              The page may have moved. You can{' '}
              <Link href="/search" className="gov-link">search this website</Link> or{' '}
              <Link href="/support" className="gov-link">contact the OneStop Centre</Link> if you need help.
            </p>
            <Link href="/" className="gov-btn mt-8">Go to the homepage</Link>
          </div>
        </div>
        <aside className="gov-related">
          <h2>Popular pages</h2>
          <ul className="text-[15px]">
            <li><Link href="/services" className="gov-link">Government services</Link></li>
            <li><Link href="/business/registration" className="gov-link">Register a business</Link></li>
            <li><Link href="/investments" className="gov-link">Investment projects</Link></li>
            <li><Link href="/agencies" className="gov-link">Government agencies</Link></li>
            <li><Link href="/track" className="gov-link">Track an application</Link></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
