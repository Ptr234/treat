'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { postLoginPath } from '@/lib/roles';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, clearError } = useAuth();
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Already signed in? Send them to the landing page their role can actually
  // open — /dashboard is admin-level only, so routing everyone there bounces
  // officers and regular users back out with ?auth=required.
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      router.replace(postLoginPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Staff sign in' }]}
        caption="Staff"
        title="Sign in to the staff console"
        lead="For authorised Uganda Investment Authority and partner-agency staff."
      />

      <div className="gov-container grid gap-12 py-12 lg:grid-cols-[minmax(0,28rem)_1fr] lg:py-16">
        <div>
          <div className="gov-warning mb-8 text-[15px]">
            <p>Only authorised staff may use this service. Sign-in activity is recorded.</p>
          </div>

          <GoogleSignInButton
            // Navigation is handled by the redirect effect above: `user` is
            // still the pre-login value inside this callback, so deciding the
            // destination here would route on a stale role.
            onSuccess={() => {}}
            onError={(error) => setGoogleError(error)}
            disabled={isLoading}
          />

          {googleError && <p role="alert" className="gov-inset gov-inset--red mt-3 text-sm font-semibold">{googleError}</p>}

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#b9b4a9]" />
            <span className="px-3 text-sm font-semibold text-[#5c5850]">or sign in with email</span>
            <div className="flex-1 border-t border-[#b9b4a9]" />
          </div>

          <LoginForm />
        </div>

        <aside className="lg:pl-12">
          <div className="gov-related">
            <h2>Not a staff member?</h2>
            <p className="text-[15px] text-[#3b3934]">Investors and business owners can sign in from the top of any page, or use the public services without an account.</p>
            <ul className="mt-3 text-[15px]">
              <li><Link href="/services" className="gov-link">Government services</Link></li>
              <li><Link href="/support" className="gov-link">Help and contact</Link></li>
            </ul>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#5c5850]">
            <ShieldCheckIcon className="h-5 w-5 text-black" aria-hidden="true" />
            If two-factor authentication is set up on your account, you will be asked for a 6-digit code.
          </div>
        </aside>
      </div>
    </div>
  );
}
