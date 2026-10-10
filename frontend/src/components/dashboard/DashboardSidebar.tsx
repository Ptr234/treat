'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  TicketIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  MegaphoneIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type Role = string | undefined;

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Roles allowed to see (and reach) this section. Kept in sync with the
   *  access guard each target page actually enforces, so there are no dead links. */
  roles: string[];
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

// Navigation model. `roles` mirrors the guard each destination page actually
// enforces (src/lib/roles.ts): every page below checks `isAdminLevel`
// (admin + dg) except Business Registrations and Issue Tracking, which use
// `isStaff` (+ agency_officer). dg is the Director General — a leadership
// superuser per roles.ts — so it must appear everywhere admin does, or a DG
// session ends up with no visible link to pages it's fully authorised to open.
const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Overview', href: '/dashboard', icon: Squares2X2Icon, roles: ['admin', 'dg'] },
      { label: 'Issue Tracking', href: '/tickets', icon: TicketIcon, roles: ['admin', 'dg', 'agency_officer'] },
      // Staff-only per middleware.ts's STAFF_ROUTES — same role set as Issue Tracking.
      { label: 'Agency Chat', href: '/agency-chat', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'dg', 'agency_officer'] },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { label: 'Contact Inquiries', href: '/dashboard/inquiries', icon: DocumentTextIcon, roles: ['admin', 'dg'] },
      { label: 'Chat Enquiries', href: '/dashboard/enquiries', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'dg'] },
      { label: 'Investor Pipeline', href: '/dashboard/investors', icon: ArrowTrendingUpIcon, roles: ['admin', 'dg'] },
      { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon, roles: ['admin', 'dg'] },
      // Its own StaffPolicy + URSB-agency-scoped backend, so agency officers
      // (not just admin-level staff) belong here — see middleware.ts's
      // STAFF_ROUTES override for /dashboard/business-registrations.
      { label: 'Business Registrations', href: '/dashboard/business-registrations', icon: BuildingLibraryIcon, roles: ['admin', 'dg', 'agency_officer'] },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Events', href: '/dashboard/events', icon: MegaphoneIcon, roles: ['admin', 'dg'] },
      { label: 'Agencies', href: '/dashboard/agencies', icon: BuildingOffice2Icon, roles: ['admin', 'dg'] },
      { label: 'Downloads', href: '/dashboard/downloads', icon: DocumentTextIcon, roles: ['admin', 'dg'] },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { label: 'User Management', href: '/dashboard/users', icon: UserGroupIcon, roles: ['admin', 'dg'] },
      { label: 'Escalation Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['admin', 'dg'] },
      { label: 'Audit Log', href: '/dashboard/audit', icon: ShieldCheckIcon, roles: ['admin', 'dg'] },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  // Exact match for the hub so it isn't "active" on every sub-route.
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface DashboardSidebarProps {
  role: Role;
  /** Called when a link is tapped — lets the parent close the mobile drawer. */
  onNavigate?: () => void;
}

export default function DashboardSidebar({ role, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname() || '';

  const groups = NAV
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => role && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-black text-neutral-300">
      {/* Brand */}
      <div className="gov-stripe" aria-hidden="true" />
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-5 border-b border-neutral-800"
      >
        <Image src="/images/osc-logo.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-white truncate">OneStop Centre</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffd700] leading-tight">Staff console</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'border-l-4 border-[#ffd700] bg-white/10 font-bold text-white'
                          : 'border-l-4 border-transparent text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <p className="border-t border-white/10 px-5 py-4 text-[11px] text-neutral-400">Republic of Uganda · Uganda Investment Authority</p>
    </div>
  );
}
