'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  HandRaisedIcon,
  BriefcaseIcon,
  BeakerIcon,
  GlobeAltIcon,
  CubeIcon,
  ComputerDesktopIcon,
  CogIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  MapPinIcon,
  BookOpenIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  SparklesIcon,
  FireIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  dropdown?: NavigationItem[];
}

interface IconMapType {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownClickMode, setDropdownClickMode] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Clear any pending dropdown close timeout
  const clearDropdownTimeout = useCallback(() => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  }, []);

  // Set dropdown close timeout
  const setDropdownTimeout = useCallback((callback: () => void, delay: number = 150) => {
    clearDropdownTimeout();
    dropdownTimeoutRef.current = setTimeout(callback, delay);
  }, [clearDropdownTimeout]);

  // Handle dropdown visibility
  const handleDropdownOpen = useCallback((itemName: string, isClick = false) => {
    clearDropdownTimeout();
    setActiveDropdown(itemName);
    if (isClick) {
      setDropdownClickMode(itemName);
    }
  }, [clearDropdownTimeout]);

  const handleDropdownClose = useCallback((itemName: string, immediate = false) => {
    // If in click mode, don't close on hover
    if (dropdownClickMode === itemName && !immediate) {
      return;
    }
    
    if (immediate) {
      clearDropdownTimeout();
      setActiveDropdown(null);
      setDropdownClickMode(null);
    } else {
      setDropdownTimeout(() => {
        setActiveDropdown(null);
        setDropdownClickMode(null);
      });
    }
  }, [dropdownClickMode, setDropdownTimeout, clearDropdownTimeout]);

  // Icon mapping for professional icons
  const iconMap: IconMapType = {
    HomeIcon,
    CurrencyDollarIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon,
    FolderIcon,
    HandRaisedIcon,
    BriefcaseIcon,
    BeakerIcon,
    GlobeAltIcon,
    CubeIcon,
    ComputerDesktopIcon,
    CogIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    BuildingOffice2Icon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    ArchiveBoxIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    MapPinIcon,
    BookOpenIcon,
    ScaleIcon,
    ExclamationTriangleIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    TargetIcon: PresentationChartLineIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    InformationCircleIcon,
    SparklesIcon,
    FireIcon,
  };

  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  // Scroll handler for header styling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setActiveDropdown(null);
      setDropdownClickMode(null);
      clearDropdownTimeout();
    }
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsSearchOpen(false);
    }
  }, [clearDropdownTimeout]);

  useEffect(() => {
    // Optimized scroll handler - less frequent updates
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleScroll();
      }, 16); // ~60fps max
    };
    
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside as EventListener, { passive: true });
    
    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', debouncedScroll);
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
    };
  }, [handleScroll, handleClickOutside]);

  // Navigation structure - Investment-focused with enhanced UX
  const navigationItems: NavigationItem[] = useMemo(() => [
    { 
      name: 'Home', 
      href: '/', 
      icon: 'HomeIcon'
    },
    { 
      name: 'Investment Opportunities', 
      href: '/investments', 
      icon: 'CurrencyDollarIcon',
      dropdown: [
        { name: 'All Investment Sectors', href: '/investments', icon: 'BriefcaseIcon' },
        { name: 'Agriculture & Agribusiness', href: '/investments?category=agriculture', icon: 'BeakerIcon' },
        { name: 'Tourism & Hospitality', href: '/investments?category=tourism', icon: 'GlobeAltIcon' },
        { name: 'Mining & Natural Resources', href: '/investments?category=mining', icon: 'CubeIcon' },
        { name: 'ICT & Technology', href: '/investments?category=technology', icon: 'ComputerDesktopIcon' },
        { name: 'Manufacturing & Industry', href: '/investments?category=manufacturing', icon: 'CogIcon' },
        { name: 'Investment ROI Calculator', href: '/tools/roi-calculator', icon: 'ChartBarIcon' },
        { name: 'Start Investment Journey', href: '/investments/onboarding', icon: 'RocketLaunchIcon' }
      ]
    },
    { 
      name: 'Investment Services', 
      href: '/services', 
      icon: 'BuildingOfficeIcon',
      dropdown: [
        { name: 'Investment Support & Advisory', href: '/services', icon: 'TargetIcon' },
        { name: 'Business Registration & Licensing', href: '/business/registration', icon: 'BuildingOffice2Icon' },
        { name: 'Tax Services & URA Support', href: '/services', icon: 'CalculatorIcon' },
        { name: 'Work Permits & Immigration', href: '/services', icon: 'ClipboardDocumentListIcon' },
        { name: 'Import/Export Facilitation', href: '/services', icon: 'ArchiveBoxIcon' },
        { name: 'View All Services', href: '/services', icon: 'BuildingOfficeIcon' }
      ]
    },
    { 
      name: 'Investment Tools', 
      href: '/tools', 
      icon: 'WrenchScrewdriverIcon',
      dropdown: [
        { name: 'Investment ROI Calculator', href: '/tools/roi-calculator', icon: 'ChartBarIcon' },
        { name: 'Tax Calculator', href: '/tools/tax-calculator', icon: 'CalculatorIcon' },
        { name: 'Business Invoice Generator', href: '/tools/invoice-generator', icon: 'DocumentTextIcon' },
        { name: 'Document Checklist', href: '/tools/document-checklist', icon: 'CheckCircleIcon' },
        { name: 'Investment Tracker', href: '/tools', icon: 'MapPinIcon' },
        { name: 'View All Tools', href: '/tools', icon: 'WrenchScrewdriverIcon' }
      ]
    },
    { 
      name: 'Investor Resources', 
      href: '/downloads', 
      icon: 'FolderIcon',
      dropdown: [
        { name: 'Investment Guides & Manuals', href: '/downloads', icon: 'BookOpenIcon' },
        { name: 'Legal Forms & Documents', href: '/downloads', icon: 'ScaleIcon' },
        { name: 'Tax Information & Guidelines', href: '/downloads', icon: 'CurrencyDollarIcon' },
        { name: 'Sector Analysis & Reports', href: '/downloads', icon: 'ChartBarIcon' },
        { name: 'View All Resources', href: '/downloads', icon: 'FolderIcon' }
      ]
    },
    { 
      name: 'Investor Support', 
      href: '/support', 
      icon: 'HandRaisedIcon',
      dropdown: [
        { name: 'Investment Consultation', href: '/support', icon: 'BriefcaseIcon' },
        { name: 'Government Agencies', href: '/agencies', icon: 'BuildingOffice2Icon' },
        { name: 'Emergency Support', href: '/support', icon: 'ExclamationTriangleIcon' },
        { name: 'Investor FAQ & Help', href: '/support', icon: 'QuestionMarkCircleIcon' }
      ]
    }
  ], []);

  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
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
      {/* Main Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-xl shadow-strong border-b border-yellow-500/30' 
            : 'bg-black/90 backdrop-blur-md shadow-medium'
        }`}
        style={{
          boxShadow: isScrolled 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(234, 179, 8, 0.1)'
            : '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(234, 179, 8, 0.05)'
        }}
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-16 md:h-20 px-3 sm:px-6 lg:px-8">
            
            {/* Logo Section */}
            <motion.div 
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/" className="flex items-center group">
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-yellow transition-all duration-300">
                  <Image 
                    src="/images/oneStopCenter-logo.jpeg" 
                    alt="OneStopCentre Uganda" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-yellow-500 to-red-600 items-center justify-center text-black font-bold text-sm md:text-base">
                    OSC
                  </div>
                </div>
                <div className="ml-2 md:ml-4 flex flex-col justify-center">
                  <div className="font-bold text-base md:text-xl leading-tight transition-colors duration-300 text-white">
                    <span className="hidden sm:inline">OneStopCentre</span>
                    <span className="sm:hidden">OSC</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold leading-tight transition-colors duration-300 text-yellow-400 -mt-0.5">
                    Uganda
                  </div>
                  <div className="hidden md:block text-xs font-medium text-white/80 italic -mt-0.5">
                    Investing in Uganda simplified
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <button
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black w-full ${
                        isActiveRoute(item.href)
                          ? 'bg-yellow-400/10 text-yellow-400'
                          : 'text-white/90 hover:bg-yellow-400/5 hover:text-yellow-400'
                      }`}
                      onMouseEnter={() => handleDropdownOpen(item.name)}
                      onMouseLeave={() => handleDropdownClose(item.name)}
                      onClick={() => {
                        if (activeDropdown === item.name && dropdownClickMode === item.name) {
                          handleDropdownClose(item.name, true);
                        } else {
                          handleDropdownOpen(item.name, true);
                        }
                      }}
                      onFocus={() => handleDropdownOpen(item.name)}
                      aria-expanded={activeDropdown === item.name}
                      aria-haspopup="menu"
                      type="button"
                    >
                      {renderIcon(item.icon, "w-4 h-4")}
                      <span className="ml-2">{item.name}</span>
                      <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href={item.href as never}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black ${
                        isActiveRoute(item.href)
                          ? 'bg-yellow-400/10 text-yellow-400'
                          : 'text-white/90 hover:bg-yellow-400/5 hover:text-yellow-400'
                      }`}
                    >
                      {renderIcon(item.icon, "w-4 h-4")}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  )}

                  {/* Enhanced Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-3 w-80 max-w-[90vw] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-700 py-3 z-50"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(234, 179, 8, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseEnter={() => {
                        clearDropdownTimeout();
                        setActiveDropdown(item.name);
                      }}
                      onMouseLeave={() => handleDropdownClose(item.name)}
                      data-dropdown={item.name}
                      role="menu"
                      aria-label={`${item.name} submenu`}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setActiveDropdown(null);
                          const previousElement = e.currentTarget.previousElementSibling as HTMLElement;
                          previousElement?.focus();
                        }
                      }}
                    >
                      <div className="px-4 py-2 border-b border-neutral-700">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          {item.name}
                        </h3>
                      </div>
                      {item.dropdown.map((dropdownItem, _index) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href as never}
                          className="group flex items-center px-4 py-3 text-sm font-medium text-neutral-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all duration-300 relative overflow-hidden focus:outline-none focus:text-yellow-400 focus:bg-yellow-400/5"
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => {
                            // Close dropdown when clicking on link
                            handleDropdownClose(item.name, true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.currentTarget.click();
                            }
                          }}
                        >
                          <div className="relative flex items-center w-full">
                            <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center transition-all duration-300">
                              {renderIcon(dropdownItem.icon, "w-4 h-4 text-yellow-400")}
                            </div>
                            <span className="ml-3 flex-1 transition-all duration-300">{dropdownItem.name}</span>
                            <ChevronRightIcon className="w-4 h-4 text-neutral-400 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

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
                      className="w-48 md:w-64 px-4 py-2 bg-black-800/50 text-white placeholder-white/60 rounded-xl border border-yellow-500/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      autoFocus
                    />
                  </motion.form>
                )}
              </div>

              {/* User Authentication */}
              {isAuthenticated && user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-white/90 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl border border-transparent hover:border-yellow-500/20 transition-all duration-200">
                    <UserIcon className="w-5 h-5" />
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 top-full mt-3 w-56 max-w-[90vw] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-700 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50" style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(234, 179, 8, 0.1)'
                  }}>
                    <Link
                      href="/profile"
                      className="group flex items-center px-4 py-3 text-sm font-medium text-neutral-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="relative flex items-center">
                        <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center transition-all duration-300">
                          <UserIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span className="ml-3 transition-all duration-300">Profile</span>
                      </div>
                    </Link>
                    <div className="border-t border-neutral-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-4 py-3 text-sm font-medium text-neutral-300 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="relative flex items-center">
                        <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center transition-all duration-300">
                          <ArrowRightOnRectangleIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span className="ml-3 transition-all duration-300">Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
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

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="lg:hidden bg-gradient-to-b from-black-900/98 to-black-800/98 backdrop-blur-xl border-t border-yellow-500/30 shadow-2xl"
              >
                <div className="px-4 py-6 space-y-3 max-h-[70vh] overflow-y-auto">
                  {navigationItems.map((item, itemIndex) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.1 }}
                    >
                      <Link
                        href={item.href as never}
                        className={`group flex items-center px-4 py-4 text-base font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden ${
                          isActiveRoute(item.href)
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'text-white/90 hover:bg-yellow-400/5 hover:text-yellow-400'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="relative flex items-center w-full">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isActiveRoute(item.href) 
                              ? 'bg-yellow-400/20' 
                              : 'bg-white/5 group-hover:bg-yellow-400/10'
                          }`}>
                            {renderIcon(item.icon, "w-5 h-5")}
                          </div>
                          <span className="ml-4 flex-1">{item.name}</span>
                          {item.dropdown && (
                            <ChevronDownIcon className="w-5 h-5 opacity-60" />
                          )}
                        </div>
                      </Link>
                      
                      {item.dropdown && (
                        <div className="ml-6 mt-3 space-y-2 border-l-2 border-white/10 pl-4">
                          <div className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider mb-2">
                            {item.name} Options
                          </div>
                          {item.dropdown.map((dropdownItem, _subIndex) => (
                            <motion.div
                              key={dropdownItem.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (itemIndex * 0.1) + (dropdownItem.name.length * 0.01) }}
                            >
                              <Link
                                href={dropdownItem.href as never}
                                className="group flex items-center px-3 py-3 text-sm font-medium text-white/80 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-red-500/10 rounded-xl transition-all duration-300 border border-white/5 hover:border-yellow-500/20"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-gradient-to-br group-hover:from-yellow-500/20 group-hover:to-red-500/20 flex items-center justify-center transition-all duration-300">
                                  {renderIcon(dropdownItem.icon, "w-4 h-4")}
                                </div>
                                <span className="ml-3 flex-1 group-hover:font-semibold transition-all duration-300">{dropdownItem.name}</span>
                                <ChevronRightIcon className="w-4 h-4 opacity-40 group-hover:opacity-70 group-hover:translate-x-1 transition-all duration-300" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Auth Modal Placeholder - Will be implemented separately */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-strong border border-yellow-200"
            >
              <h2 className="text-2xl font-bold text-black-900 mb-4">Authentication</h2>
              <p className="text-black-600 mb-6">Auth modal will be implemented in the next phase.</p>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300"
              >
                Close
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;