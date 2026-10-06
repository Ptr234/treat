'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
 <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <Image
            src="/images/oneStopCenter-logo.jpeg"
            alt="OneStop Centre Uganda logo"
            width={44}
            height={44}
            className="rounded-lg object-contain bg-white flex-shrink-0"
          />
          <span className="leading-tight">
            <span className="block text-lg font-black text-black group-hover:text-red-600 transition-colors">
              OneStop Centre
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
              Uganda
            </span>
          </span>
        </Link>

        <div className=" pt-8">
          <h1 className="text-2xl font-bold text-black mb-4">Admin sign in</h1>

          <div className="flex items-start gap-3 mb-6 border-l-4 border-red-600 pl-4">
            <ShieldCheckIcon className="mt-0.5 w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-neutral-800">
              Authorized UIA administrators only.
            </p>
          </div>

          <GoogleSignInButton
            // Navigation is handled by the redirect effect above: `user` is
            // still the pre-login value inside this callback, so deciding the
            // destination here would route on a stale role.
            onSuccess={() => {}}
            onError={(error) => setGoogleError(error)}
            disabled={isLoading}
          />

          {googleError && (
            <div className="mt-2 text-red-600 text-sm text-center">
              {googleError}
            </div>
          )}

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-neutral-300" />
            <span className="px-3 text-sm text-neutral-600">or</span>
            <div className="flex-1 border-t border-neutral-300" />
          </div>

          <LoginForm />
        </div>

        <p className="mt-8 text-center text-sm text-neutral-700">
          <Link href="/" className="font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600">
            &larr; Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
