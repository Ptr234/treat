'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AuthModal from '@/components/auth/AuthModal';

interface NavigationItem {
  name: string;
  href: string;
  highlight?: boolean;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleScroll();
      }, 16);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside as EventListener, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', debouncedScroll);
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
    };
  }, [handleScroll, handleClickOutside]);

  const navigationItems: NavigationItem[] = useMemo(() => [
    { name: 'Home', href: '/' },
    { name: 'Investments', href: '/investments' },
    { name: 'Services', href: '/services' },
    { name: 'Tools', href: '/tools' },
    { name: 'Resources', href: '/downloads' },
    { name: 'Projects Map', href: '/projects' },
    { name: 'AI Assistant', href: '/chatbot', highlight: true },
    { name: 'OSC Hub', href: '/agencies' },
  ], []);

  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      setIsSearchOpen(false);
      setSearchTerm('');
      router.push(`/search?q=${encodeURIComponent(trimmedSearch)}`);
    }
  }, [searchTerm, router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Top Utility Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-center h-8 px-3 sm:px-6 lg:px-8 gap-6">
            <Link href="/events" className="text-xs font-medium text-gray-600 hover:text-black transition-colors">
              Events Calendar
            </Link>
            <Link href="/projects" className="text-xs font-medium text-gray-600 hover:text-black transition-colors">
              Projects Map
            </Link>
            {isAuthenticated && (user?.role === 'admin') && (
              <Link href="/tickets" className="text-xs font-medium text-gray-600 hover:text-black transition-colors">
                Issue Tracking
              </Link>
            )}
            {isAuthenticated && (user?.role === 'admin') && (
              <Link href="/agency-chat" className="text-xs font-medium text-gray-600 hover:text-black transition-colors">
                Agency Chat
              </Link>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className={`w-full transition-all duration-300 ease-out ${
          isScrolled
            ? 'bg-black backdrop-blur-xl shadow-strong border-b border-yellow-500/30'
            : 'bg-black backdrop-blur-md shadow-medium'
        }`}
        style={{
          boxShadow: isScrolled
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.1)'
            : '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.05)'
        }}
        >
          <div className="flex items-center justify-between h-16 md:h-20 px-3 sm:px-6 lg:px-8">

            {/* Logo */}
            <motion.div
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/" className="flex items-center group">
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-black transition-all duration-300">
                  <Image
                    src="/images/oneStopCenter-logo.jpeg"
                    alt="OneStopCentre Uganda"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="ml-2 md:ml-4 flex flex-col justify-center">
                  <div className="font-bold text-base md:text-xl leading-tight text-white">
                    <span className="hidden sm:inline">OneStopCentre</span>
                    <span className="sm:hidden">OSC</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold leading-tight text-yellow-400 -mt-0.5">
                    Uganda
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation — Flat, No Dropdowns */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                if (item.highlight) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/40"
                    >
                      {item.name}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActiveRoute(item.href)
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'text-white/90 hover:bg-yellow-400/5 hover:text-yellow-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* DG Dashboard — Admin & CEO only */}
            {isAuthenticated && (user?.role === 'admin') && (
              <Link
                href="/dashboard"
                className="hidden lg:flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 hover:text-yellow-200 border border-yellow-500/30"
              >
                DG Dashboard
              </Link>
            )}

            {/* Search and User Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                {!isSearchOpen ? (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-white/90 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl border border-transparent hover:border-yellow-500/20 transition-all duration-200"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    onSubmit={handleSearch}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      placeholder="Search investments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48 md:w-64 px-4 py-2 bg-neutral-900/50 text-white placeholder-white/60 rounded-xl border border-yellow-500/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      autoFocus
                    />
                  </motion.form>
                )}
              </div>

              {/* User Authentication */}
              {isAuthenticated && user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-white/90 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl border border-transparent hover:border-yellow-500/20 transition-all duration-200">
                    {user.picture ? (
                      <Image
                        src={user.picture}
                        alt={user.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-yellow-400/50"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                  </button>

                  <div className="absolute right-0 top-full mt-3 w-56 max-w-[90vw] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-700 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50" style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 215, 0, 0.1)'
                  }}>
                    <Link
                      href="/profile"
                      className="group flex items-center px-4 py-3 text-sm font-medium text-neutral-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all duration-300"
                    >
                      {user.picture ? (
                        <Image
                          src={user.picture}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                      )}
                      <span className="ml-3">Profile</span>
                    </Link>
                    <div className="border-t border-neutral-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-4 py-3 text-sm font-medium text-neutral-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="ml-3">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white/90 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl border border-transparent hover:border-yellow-500/20 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu — Single-Level, No Dropdowns */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="lg:hidden bg-gradient-to-b from-black/98 to-neutral-900/98 backdrop-blur-xl border-t border-yellow-500/30 shadow-2xl"
              >
                <div className="px-4 py-6 space-y-2 max-h-[70vh] overflow-y-auto">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`block px-4 py-4 text-base font-semibold rounded-2xl transition-all duration-300 ${
                          item.highlight
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                            : isActiveRoute(item.href)
                              ? 'bg-yellow-400/10 text-yellow-400'
                              : 'text-white/90 hover:bg-yellow-400/5 hover:text-yellow-400'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}

                  {/* DG Dashboard in mobile — Admin & CEO */}
                  {isAuthenticated && (user?.role === 'admin') && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navigationItems.length * 0.05 }}
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-4 text-base font-semibold rounded-2xl transition-all duration-300 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        DG Dashboard
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Auth Modal — user mode (Google sign-in only) */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="user" />
    </>
  );
};

export default Header;
