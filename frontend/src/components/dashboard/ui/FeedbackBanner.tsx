'use client';

interface FeedbackBannerProps {
  type: 'success' | 'error';
  message: string;
}

/** The success/error banner shown after a dashboard form action. */
export default function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  return (
    <div
      className={`mb-6 p-4 rounded-md border text-sm ${
        type === 'success'
          ? 'bg-green-50 border-green-600 text-green-800'
          : 'bg-red-50 border-red-600 text-red-800'
      }`}
    >
      {message}
    </div>
  );
}
