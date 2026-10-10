import Link from 'next/link';

/** Explains why an email field is locked to the signed-in investor's account. */
export default function AccountEmailHint({ id }: { id: string }) {
  return (
    <p id={id} className="mt-1 text-sm text-neutral-700">
      This is your account email. Your submission and any replies will appear under{' '}
      <Link href="/account" className="font-semibold text-black underline underline-offset-2">
        My submissions
      </Link>
      .
    </p>
  );
}
