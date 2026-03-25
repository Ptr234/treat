'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-yellow-600 mb-4">Offline</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No Internet Connection
          </h2>
          <p className="text-gray-600">
            You appear to be offline. Please check your internet connection and try again.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
