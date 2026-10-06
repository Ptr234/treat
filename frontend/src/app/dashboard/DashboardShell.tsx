'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

const STAFF_ROLES = ['admin', 'dg', 'agency_officer'];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  dg: 'Director General',
  agency_officer: 'Agency Officer',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  const isStaff = isAuthenticated && STAFF_ROLES.includes(user?.role ?? '');

  // While the session check is in flight we can't tell staff from anonymous —
  // show a neutral loader rather than flashing the bare (unauthed) page.
  if (isLoading) {
    return (
 <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Non-staff / anonymous: render the page bare so its own access-denied or
  // sign-in prompt fills the screen (no admin chrome around it).
  if (!isStaff) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
 <div className="min-h-screen bg-white lg:flex">
      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <DashboardSidebar role={user?.role} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full w-72 max-w-[85vw] bg-black shadow-2xl [height:100dvh]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute -right-12 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <DashboardSidebar role={user?.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-2 flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 hover:text-black"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-600 hover:text-black transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              View site
            </Link>

            <div className="flex-1" />

            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-black truncate max-w-[180px]">{user?.name || user?.email}</p>
              <p className="text-[11px] text-neutral-600">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex min-h-11 items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-800 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
