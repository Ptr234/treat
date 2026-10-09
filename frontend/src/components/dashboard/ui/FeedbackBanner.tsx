'use client';

interface FeedbackBannerProps {
  type: 'success' | 'error';
  message: string;
}

/** The success/error banner shown after a dashboard form action. */
export default function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`mb-6 text-[15px] font-semibold ${type === 'success' ? 'gov-inset' : 'gov-inset gov-inset--red'}`}
    >
      {message}
    </div>
  );
}
