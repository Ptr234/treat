import Link from 'next/link';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-yellow-700" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Event Not Found</h1>
        <p className="text-neutral-600 mb-6">
          This event may have been removed, unpublished, or the link is out of date.
        </p>
        <Link
          href="/events/"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Browse All Events
        </Link>
      </div>
    </div>
  );
}
