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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    }
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsSearchOpen(false);
    }
  }, []);

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
        { name: 'Agriculture Investments', href: '/investments#agriculture', icon: 'BeakerIcon' },
        { name: 'Tourism Investments', href: '/investments#tourism', icon: 'GlobeAltIcon' },
        { name: 'Mining Investments', href: '/investments#mining', icon: 'CubeIcon' },
        { name: 'ICT Investments', href: '/investments#ict', icon: 'ComputerDesktopIcon' },
        { name: 'Manufacturing Investments', href: '/investments#manufacturing', icon: 'CogIcon' },
        { name: 'Investment ROI Calculator', href: '/tools/roi-calculator', icon: 'ChartBarIcon' },
        { name: 'Investment Onboarding', href: '/investment-onboarding', icon: 'RocketLaunchIcon' }
      ]
    },
    { 
      name: 'Investment Services', 
      href: '/services', 
      icon: 'BuildingOfficeIcon',
      dropdown: [
        { name: 'Investment Support Services', href: '/services#investment-support', icon: 'TargetIcon' },
        { name: 'Business Registration & Licensing', href: '/business/registration', icon: 'BuildingOffice2Icon' },
        { name: 'Tax & Revenue Services', href: '/services#tax-revenue', icon: 'CalculatorIcon' },
        { name: 'Immigration & Work Permits', href: '/services#immigration-permits', icon: 'ClipboardDocumentListIcon' },
        { name: 'Export & Import Services', href: '/services#export-import', icon: 'ArchiveBoxIcon' },
        { name: 'All Government Services', href: '/services', icon: 'BuildingOfficeIcon' }
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
        { name: 'Investment Status Tracker', href: '/tools#status-tracker', icon: 'MapPinIcon' },
        { name: 'All Investment Tools', href: '/tools', icon: 'WrenchScrewdriverIcon' }
      ]
    },
    { 
      name: 'Investor Resources', 
      href: '/downloads', 
      icon: 'FolderIcon',
      dropdown: [
        { name: 'Investment Guides', href: '/downloads#investment-guides', icon: 'BookOpenIcon' },
        { name: 'Legal Documents', href: '/downloads#legal-documents', icon: 'ScaleIcon' },
        { name: 'Tax Information', href: '/downloads#tax-information', icon: 'CurrencyDollarIcon' },
        { name: 'Sector Reports', href: '/downloads#sector-reports', icon: 'ChartBarIcon' },
        { name: 'All Resources', href: '/downloads', icon: 'FolderIcon' }
      ]
    },
    { 
      name: 'Investor Support', 
      href: '/support', 
      icon: 'HandRaisedIcon',
      dropdown: [
        { name: 'Investment Consultation', href: '/support#investment-consultation', icon: 'BriefcaseIcon' },
        { name: 'Agency Directory', href: '/agencies', icon: 'BuildingOffice2Icon' },
        { name: 'Emergency Support', href: '/support#emergency', icon: 'ExclamationTriangleIcon' },
        { name: 'Investor FAQ', href: '/support#faq', icon: 'QuestionMarkCircleIcon' }
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
            ? 'bg-primary-600/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-b border-primary-700/50' 
            : 'bg-primary-600/90 backdrop-blur-md shadow-xl shadow-black/5'
        }`}
        style={{
          boxShadow: isScrolled 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
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
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gradient-to-br from-primary-600 to-primary-800">
                  <Image 
                    src="/images/oneStopCenter-logo.jpeg" 
                    alt="OneStopCentre Uganda" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center text-white font-bold text-sm md:text-base">
                    OSC
                  </div>
                </div>
                <div className="ml-2 md:ml-4 flex flex-col justify-center">
                  <div className="font-bold text-base md:text-xl leading-tight transition-colors duration-300 text-white">
                    <span className="hidden sm:inline">OneStopCentre</span>
                    <span className="sm:hidden">OSC</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold leading-tight transition-colors duration-300 text-accent-yellow-400 -mt-0.5">
                    Uganda
                  </div>
                  <div className="hidden md:block text-xs font-medium text-white/90 italic -mt-0.5">
                    Investing in Uganda simplified
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href as never}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActiveRoute(item.href)
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                    onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {renderIcon(item.icon, "w-4 h-4")}
                    <span className="ml-2">{item.name}</span>
                    {item.dropdown && (
                      <ChevronDownIcon className="w-4 h-4 ml-1 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href as never}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          {renderIcon(dropdownItem.icon, "w-4 h-4")}
                          <span className="ml-3">{dropdownItem.name}</span>
                          <ChevronRightIcon className="w-4 h-4 ml-auto opacity-40" />
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
                    className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
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
                      className="w-48 md:w-64 px-4 py-2 bg-white/10 text-white placeholder-white/70 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      autoFocus
                    />
                  </motion.form>
                )}
              </div>

              {/* User Authentication */}
              {isAuthenticated && user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    <UserIcon className="w-5 h-5" />
                    <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Get Started
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
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
                className="lg:hidden bg-primary-700/95 backdrop-blur-xl border-t border-primary-600/50"
              >
                <div className="px-4 py-6 space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href as never}
                        className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                          isActiveRoute(item.href)
                            ? 'bg-white/20 text-white'
                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {renderIcon(item.icon, "w-5 h-5")}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                      
                      {item.dropdown && (
                        <div className="ml-8 mt-2 space-y-1">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href as never}
                              className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {renderIcon(dropdownItem.icon, "w-4 h-4")}
                              <span className="ml-3">{dropdownItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Auth Modal Placeholder - Will be implemented separately */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-6">Auth modal will be implemented in the next phase.</p>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;