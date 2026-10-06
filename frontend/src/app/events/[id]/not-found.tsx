import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Events</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Event not found</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-neutral-700">
          This event may have been removed, unpublished, or the link is out of date.
        </p>
        <Link
          href="/events/"
          className="mt-8 inline-flex items-center gap-2 border-b-2 border-yellow-400 pb-0.5 text-sm font-bold text-black hover:border-red-600 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Browse all events
        </Link>
      </div>
    </div>
  );
}
