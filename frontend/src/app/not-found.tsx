import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-yellow-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
          >
            Go Home
          </Link>

          <Link
            href="/services"
            className="inline-block w-full bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Browse Services
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link href="/support" className="text-yellow-600 hover:text-yellow-700">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}
