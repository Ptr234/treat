'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Clock, MapPin, Phone, Mail, Globe, Shield, Building2, Landmark, Leaf, Zap, Users, Star, ChevronRight } from 'lucide-react';
import { ugandaAgencies, type AgencyContact } from '@/data/agencies';

/* ────────────────────────────────────────────────────────
   Category visual config — each category gets a unique
   color, icon, and section style
   ──────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, {
  icon: React.ReactNode;
  accent: string;
  bg: string;
  border: string;
  badge: string;
  heading: string;
  subtitle: string;
}> = {
  // Uganda flag palette: Black (bg), Yellow/Gold (#FFD700), Red (#CE1126)
  // Categories rotate between yellow-accent and red-accent
  investment: {
    icon: <Landmark className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Investment & Finance',
    subtitle: 'Capital markets, investment licensing, and financial facilitation',
  },
  registration: {
    icon: <Building2 className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Business Registration',
    subtitle: 'Company formation, business names, and licensing',
  },
  taxation: {
    icon: <Shield className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Taxation & Revenue',
    subtitle: 'Tax registration, TIN issuance, and compliance',
  },
  immigration: {
    icon: <Globe className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Immigration & Citizenship',
    subtitle: 'Work permits, visas, and citizenship services',
  },
  environment: {
    icon: <Leaf className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Environment & Conservation',
    subtitle: 'Environmental impact assessments and compliance',
  },
  standards: {
    icon: <Star className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Standards & Quality',
    subtitle: 'Product standards, quality assurance, and certification',
  },
  infrastructure: {
    icon: <Zap className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Infrastructure & Utilities',
    subtitle: 'Electricity, water, and essential services connections',
  },
  lands: {
    icon: <MapPin className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Land & Housing',
    subtitle: 'Land titles, surveys, and property registration',
  },
  social_security: {
    icon: <Users className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Social Security & Labour',
    subtitle: 'Employee registration, contributions, and compliance',
  },
  finance: {
    icon: <Landmark className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Capital Markets',
    subtitle: 'Securities regulation and market oversight',
  },
  tourism: {
    icon: <Globe className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Tourism',
    subtitle: 'Tourism promotion and operator licensing',
  },
  employers: {
    icon: <Users className="w-5 h-5" />,
    accent: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-600/25',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    heading: 'Employers & Workforce',
    subtitle: 'Labour relations, skills development, and compliance',
  },
  conservation: {
    icon: <Leaf className="w-5 h-5" />,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-600/25',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    heading: 'Conservation',
    subtitle: 'Wildlife protection and conservation initiatives',
  },
};

const DEFAULT_CONFIG = CATEGORY_CONFIG.investment!;

function getCfg(category: string): typeof DEFAULT_CONFIG {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CONFIG;
}

/* ────────────────────────────────────────────────────────
   Spotlight Card — Featured top-3 agencies (UIA, URSB, URA)
   Large horizontal cards with full details
   ──────────────────────────────────────────────────────── */

function SpotlightCard({ agency, index }: { agency: AgencyContact; index: number }) {
  const cfg = getCfg(agency.category);
  const layouts = [
    'md:col-span-2 md:row-span-2', // UIA — big square
    'md:col-span-1 md:row-span-1', // URSB — normal
    'md:col-span-1 md:row-span-1', // URA — normal
  ];
  const isBig = index === 0;

  return (
    <Link
      href={`/agencies/${agency.id}`}
      className={`group relative overflow-hidden rounded-2xl border-2 ${cfg.border} hover:border-yellow-500 transition-all duration-500 ${layouts[index]} flex flex-col`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 group-hover:from-neutral-800 transition-colors duration-500" />
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/3 translate-x-1/3 bg-gradient-to-br ${
        index === 0 ? 'from-yellow-500 to-red-600' : index === 1 ? 'from-red-500 to-red-700' : 'from-yellow-400 to-yellow-600'
      }`} />

      <div className="relative p-6 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              {agency.logo ? (
                <Image src={agency.logo} alt={agency.acronym} width={36} height={36} className="object-contain" />
              ) : (
                <span className="text-lg font-black text-neutral-800">{agency.acronym[0]}</span>
              )}
            </div>
            <div>
              <span className={`text-xs font-bold ${cfg.accent} tracking-wider uppercase`}>{agency.acronym}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {agency.category.replace('_', ' ')}
                </span>
                {agency.urgencyLevel === 'high' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">Priority</span>
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Content */}
        <h3 className={`font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors ${isBig ? 'text-xl' : 'text-base'}`}>
          {agency.name}
        </h3>
        <p className={`text-neutral-400 mb-4 ${isBig ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
          {agency.description}
        </p>

        {/* Services preview */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {agency.services.slice(0, isBig ? 4 : 2).map((s, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300">
                {s.length > 35 ? s.slice(0, 35) + '...' : s}
              </span>
            ))}
            {agency.services.length > (isBig ? 4 : 2) && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${cfg.badge}`}>
                +{agency.services.length - (isBig ? 4 : 2)} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom info bar */}
        {isBig && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {agency.operatingHours}</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {agency.contact.phone}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────
   Category Section — Unique visual per category
   ──────────────────────────────────────────────────────── */

function CategorySection({ category, agencies }: { category: string; agencies: AgencyContact[] }) {
  const cfg = getCfg(category);

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.accent}`}>
          {cfg.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{cfg.heading}</h2>
          <p className="text-xs text-neutral-500">{cfg.subtitle}</p>
        </div>
        <span className="ml-auto text-xs text-neutral-600">{agencies.length} {agencies.length === 1 ? 'agency' : 'agencies'}</span>
      </div>

      {/* Cards — layout varies by number of agencies */}
      {agencies.length === 1 && agencies[0] ? (
        <SingleAgencyCard agency={agencies[0]} cfg={cfg} />
      ) : agencies.length === 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agencies.map(a => <CompactAgencyCard key={a.id} agency={a} cfg={cfg} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map(a => <CompactAgencyCard key={a.id} agency={a} cfg={cfg} />)}
        </div>
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   Single Agency Card — Full-width when category has 1 agency
   ──────────────────────────────────────────────────────── */

function SingleAgencyCard({ agency, cfg }: { agency: AgencyContact; cfg: ReturnType<typeof getCfg> }) {
  const openAssistant = () => {
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Left — info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              {agency.logo ? (
                <Image src={agency.logo} alt={agency.acronym} width={40} height={40} className="object-contain" />
              ) : (
                <span className="text-xl font-black text-neutral-800">{agency.acronym[0]}</span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{agency.name}</h3>
              <span className={`text-xs font-bold ${cfg.accent} tracking-wider`}>{agency.acronym}</span>
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-4">{agency.description}</p>

          {/* Contact grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Mail className="w-3.5 h-3.5 text-neutral-600" />
              <span className="truncate">{agency.contact.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Phone className="w-3.5 h-3.5 text-neutral-600" />
              <span>{agency.contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-600" />
              <span>{agency.operatingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-neutral-600" />
              <span className="truncate">{agency.contact.address}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/agencies/${agency.id}`}
              className="px-5 py-2.5 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={openAssistant}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-xl hover:bg-white/10 transition-all">
              Ask Assistant
            </button>
          </div>
        </div>

        {/* Right — services */}
        <div className="md:w-80 bg-black/20 rounded-xl p-5 border border-white/5">
          <h4 className={`text-xs font-bold ${cfg.accent} tracking-wider uppercase mb-3`}>Services</h4>
          <div className="space-y-2">
            {agency.services.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.accent}`} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Compact Agency Card — Used in multi-agency categories
   ──────────────────────────────────────────────────────── */

function CompactAgencyCard({ agency, cfg }: { agency: AgencyContact; cfg: ReturnType<typeof getCfg> }) {
  const openAssistant = (e: React.MouseEvent) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('openChatWidget', {
      detail: { message: `I need help with ${agency.name} (${agency.acronym}) services` }
    }));
  };

  return (
    <Link
      href={`/agencies/${agency.id}`}
      className={`group relative rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-yellow-500/50 hover:bg-neutral-900/80 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      {/* Uganda flag accent stripe */}
      <div className={`h-1 ${cfg.accent.includes('yellow') ? 'bg-gradient-to-r from-yellow-500/60 to-transparent' : 'bg-gradient-to-r from-red-500/60 to-transparent'}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow">
              {agency.logo ? (
                <Image src={agency.logo} alt={agency.acronym} width={28} height={28} className="object-contain" />
              ) : (
                <span className="text-sm font-black text-neutral-800">{agency.acronym[0]}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${cfg.accent}`}>{agency.acronym}</span>
                {agency.urgencyLevel === 'high' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High priority" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                {agency.name}
              </h3>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-700 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{agency.description}</p>

        {/* Services */}
        <div className="mb-3 flex-1">
          <div className="flex flex-wrap gap-1">
            {agency.services.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-neutral-400 line-clamp-1">
                {s.length > 30 ? s.slice(0, 30) + '...' : s}
              </span>
            ))}
            {agency.services.length > 3 && (
              <span className={`text-[10px] px-2 py-0.5 rounded border ${cfg.badge}`}>+{agency.services.length - 3}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-[11px] text-neutral-600">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {agency.operatingHours.replace('Mon-Fri: ', '')}</span>
          </div>
          <button
            onClick={openAssistant}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors font-medium"
          >
            Ask AI
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────
   Quick Stats Bar
   ──────────────────────────────────────────────────────── */

function QuickStats() {
  const categoryCount = new Set(ugandaAgencies.map(a => a.category)).size;
  const highPriority = ugandaAgencies.filter(a => a.urgencyLevel === 'high').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
      {[
        { label: 'Total Agencies', value: ugandaAgencies.length, accent: 'text-yellow-400', borderColor: 'border-yellow-600/20' },
        { label: 'Categories', value: categoryCount, accent: 'text-red-400', borderColor: 'border-red-600/20' },
        { label: 'High Priority', value: highPriority, accent: 'text-red-500', borderColor: 'border-red-600/20' },
        { label: 'With Appointments', value: ugandaAgencies.filter(a => a.hasAppointmentBooking).length, accent: 'text-yellow-500', borderColor: 'border-yellow-600/20' },
      ].map((stat, i) => (
        <div key={i} className={`bg-neutral-900 border ${stat.borderColor} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-black ${stat.accent}`}>{stat.value}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────────────────── */

export default function GovernmentAgencies() {
  const [searchQuery, setSearchQuery] = useState('');

  // Group agencies by category, preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, AgencyContact[]>();
    for (const a of ugandaAgencies) {
      if (!map.has(a.category)) map.set(a.category, []);
      map.get(a.category)!.push(a);
    }
    return map;
  }, []);

  // Featured agencies (top 3 by urgency & importance)
  const featured = useMemo(() => {
    return ugandaAgencies.filter(a => ['uia', 'ursb', 'ura'].includes(a.id));
  }, []);

  // Search filter
  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) return null; // null = show default layout
    const q = searchQuery.toLowerCase();
    return ugandaAgencies.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.acronym.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.services.some(s => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.03),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-neutral-600 mb-6">
            <Link href="/" className="hover:text-neutral-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-yellow-500">OSC Hub</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              OneStop Centre
              <span className="block text-yellow-400">Agency Hub</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 mb-8 leading-relaxed">
              Your single gateway to all government agencies facilitating business and investment in Uganda.
              Search, explore, and connect with the right agency for your needs.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by agency name, acronym, or service..."
              className="w-full pl-12 pr-12 py-4 bg-neutral-900/80 backdrop-blur-sm border-2 border-neutral-800 text-white placeholder-neutral-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 hover:border-neutral-700 transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Search Results Mode */}
        {filteredAgencies !== null ? (
          <div>
            <div className="flex items-center justify-between mb-6 pt-4">
              <p className="text-sm text-neutral-400">
                <span className="text-yellow-400 font-bold">{filteredAgencies.length}</span> {filteredAgencies.length === 1 ? 'agency' : 'agencies'} found for &ldquo;{searchQuery}&rdquo;
              </p>
              <button onClick={() => setSearchQuery('')} className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
                Clear search
              </button>
            </div>
            {filteredAgencies.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4 opacity-30">🏛️</div>
                <h3 className="text-lg font-bold text-white mb-2">No agencies match your search</h3>
                <p className="text-sm text-neutral-500">Try a different keyword — e.g., &ldquo;tax&rdquo;, &ldquo;registration&rdquo;, &ldquo;investment&rdquo;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgencies.map(a => (
                  <CompactAgencyCard key={a.id} agency={a} cfg={getCfg(a.category)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Layout — Featured + Category Sections */
          <>
            {/* Quick Stats */}
            <QuickStats />

            {/* Featured Spotlight */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Key Agencies</h2>
                  <p className="text-xs text-neutral-500">Start your investment journey with these essential agencies</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
                {featured.map((a, i) => (
                  <SpotlightCard key={a.id} agency={a} index={i} />
                ))}
              </div>
            </section>

            {/* Category Sections */}
            {Array.from(grouped.entries())
              .filter(([, agencies]) => !agencies.every(a => featured.some(f => f.id === a.id)))
              .map(([category, agencies]) => {
                // Exclude agencies already shown in spotlight
                const remaining = agencies.filter(a => !featured.some(f => f.id === a.id));
                if (remaining.length === 0) return null;
                return <CategorySection key={category} category={category} agencies={remaining} />;
              })}
          </>
        )}
      </div>
    </div>
  );
}
