import Link from 'next/link';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon, ClockIcon, EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

const FOOTER_SECTIONS = [
  {
    title: 'Services',
    links: [
      { label: 'Business registration', href: '/business/registration' },
      { label: 'Licences and permits', href: '/services' },
      { label: 'Track an application', href: '/track' },
      { label: 'Government agencies', href: '/agencies' },
      { label: 'Investor aftercare', href: '/support' },
    ],
  },
  {
    title: 'Invest',
    links: [
      { label: 'Investment projects', href: '/investments' },
      { label: 'Licensed projects map', href: '/projects' },
      { label: 'Investment process', href: '/investments/process' },
      { label: 'Tax incentives', href: '/incentives' },
      { label: 'Investment statistics', href: '/analytics' },
    ],
  },
  {
    title: 'Guidance',
    links: [
      { label: 'User guide', href: '/guide' },
      { label: 'Forms and downloads', href: '/downloads' },
      { label: 'Events calendar', href: '/events' },
      { label: 'Business tools', href: '/tools' },
      { label: 'Investment assistant', href: '/chatbot' },
    ],
  },
];

// Official sites of the agencies most investors deal with. URLs match src/data/agencies.ts.
const GOVERNMENT_LINKS = [
  { label: 'Uganda Investment Authority', href: 'https://www.ugandainvestment.go.ug' },
  { label: 'Uganda Registration Services Bureau', href: 'https://ursb.go.ug' },
  { label: 'Uganda Revenue Authority', href: 'https://ura.go.ug' },
  { label: 'Directorate of Citizenship and Immigration Control', href: 'https://www.immigration.go.ug' },
  { label: 'National Environment Management Authority', href: 'https://nema.go.ug' },
];

const BOTTOM_LINKS = [
  { label: 'About this service', href: '/about' },
  { label: 'Help and contact', href: '/support' },
  { label: 'Search', href: '/search' },
  { label: 'Staff sign in', href: '/login' },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-[#0b0b0b] text-white">
      <div className="gov-stripe gov-stripe--thick" aria-hidden="true" />

      {/* Contact band */}
      <div className="border-b border-white/15">
        <div className="gov-container grid gap-6 py-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <p className="font-display text-2xl font-semibold leading-tight text-white sm:text-[28px]">
            Talk to the<br className="hidden md:block" /> OneStop Centre
          </p>
          <ul className="grid gap-x-8 gap-y-4 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex gap-3">
              <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">Telephone</span><a href="tel:+256414301000" className="font-semibold text-white underline-offset-4 hover:text-[#ffd700]">+256 414 301 000</a></span>
            </li>
            <li className="flex gap-3">
              <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">Email</span><a href="mailto:info@ugandainvest.go.ug" className="break-all font-semibold text-white underline-offset-4 hover:text-[#ffd700]">info@ugandainvest.go.ug</a></span>
            </li>
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">Visit</span><span className="font-semibold">Plot 1, Baskerville Avenue, Kololo, Kampala</span></span>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd700]" aria-hidden="true" />
              <span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">Office hours</span><span className="font-semibold">Mon–Fri, 8:00am–5:00pm EAT</span></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Link columns */}
      <div className="gov-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.35fr]">
        {FOOTER_SECTIONS.map((section) => (
          <nav key={section.title} aria-labelledby={`footer-${section.title.toLowerCase()}`}>
            <h2 id={`footer-${section.title.toLowerCase()}`} className="border-b border-white/25 pb-3 text-base font-bold text-white">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[15px] text-white/85 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-[#ffd700] hover:decoration-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-labelledby="footer-government">
          <h2 id="footer-government" className="border-b border-white/25 pb-3 text-base font-bold text-white">
            Government of Uganda
          </h2>
          <ul className="mt-4 space-y-2.5">
            {GOVERNMENT_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-[15px] text-white/85 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-[#ffd700] hover:decoration-2">
                  {link.label}
                  <ArrowTopRightOnSquareIcon className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Identity and legal */}
      <div className="border-t border-white/15">
        <div className="gov-container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/osc-logo.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0" />
            <p className="text-sm leading-6 text-white/75">
              <span className="block font-bold text-white">OneStop Centre Uganda</span>
              A service of the Uganda Investment Authority.
              <span className="block italic text-[#ffd700]">For God and My Country</span>
            </p>
          </div>
          <div className="md:text-right">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
              {BOTTOM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-[#ffd700] hover:decoration-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/60">&copy; 2026 Uganda OneStop Centre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
