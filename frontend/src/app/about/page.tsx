import Link from 'next/link';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import FactRow from '@/components/ui/FactRow';
import SectionHeading from '@/components/ui/SectionHeading';

const OFFERINGS = [
  {
    icon: BuildingOfficeIcon,
    title: 'Business registration',
    description: 'Register your business online through a simplified process designed for first-time founders and experienced investors alike. The system guides you through each step, so you know which information and documents are needed. You can track your registration after submission.',
    href: '/business/registration',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Investment support',
    description: 'Explore investment opportunities and get professional help to take a project from idea to licence. Listings show the sector, investment range, lead agency and incentives for each project, and facilitation connects you with the right officials.',
    href: '/investments',
  },
  {
    icon: UserGroupIcon,
    title: 'Government services',
    description: 'Contact the government agencies that regulate and support business in Uganda through one directory. Each entry explains the agency’s services and gives its contact details and operating hours.',
    href: '/agencies',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Digital tools',
    description: 'Use calculators, forms and checklists that help you plan and run your business: the tax calculator, the ROI calculator, the invoice generator and the document checklist, each built around requirements that apply in Uganda.',
    href: '/tools',
  },
];

// Figures as published. Sourced from the Uganda Investment Authority, October 2025.
const IMPACT = [
  { value: '1,425+', label: 'Projects facilitated' },
  { value: '1.0M+', label: 'Jobs created' },
  { value: '$2.5B+', label: 'FDI facilitated' },
  { value: '98%', label: 'Success rate' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'About' }]}
        caption="About us"
        title="OneStop Centre Uganda"
        lead="Simplifying government services and investment processes for a prosperous Uganda."
      />

      {/* Mission and vision */}
      <section className="gov-section" aria-labelledby="mission-heading">
        <div className="gov-container grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="border-t-4 border-black pt-6">
            <h2 id="mission-heading" className="gov-title-m">Our mission</h2>
            <p className="gov-body mt-4 text-[17px]">
              OneStop Centre Uganda serves as the digital gateway to streamlined government services, business
              registration and investment opportunities. We make it easier for entrepreneurs, investors and businesses
              to navigate Uganda&apos;s regulatory landscape with precision and efficiency.
            </p>
          </div>
          <div className="border-t-4 border-[#ffd700] pt-6">
            <h2 className="gov-title-m">Our vision</h2>
            <p className="gov-body mt-4 text-[17px]">
              To be the leading digital platform that empowers economic growth in Uganda by providing seamless access
              to government services and investment opportunities, where businesses thrive through simplified
              processes and strategic government partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="gov-section gov-section--paper" aria-labelledby="offer-heading">
        <div className="gov-container">
          <SectionHeading id="offer-heading" kicker="What we offer" title="Services for your business journey in Uganda" />
          <div className="grid gap-6 sm:grid-cols-2">
            {OFFERINGS.map((service) => (
              <article key={service.title} className="gov-card gov-card--link">
                <service.icon className="h-8 w-8 text-[#ce1126]" aria-hidden="true" />
                <h3 className="gov-card__title mt-4">
                  <Link href={service.href}>{service.title}</Link>
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#3b3934]">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="gov-section" aria-labelledby="impact-heading">
        <div className="gov-container">
          <SectionHeading id="impact-heading" kicker="Our impact" title="Results for Uganda’s economic development" />
          <FactRow facts={IMPACT} />
          <p className="gov-hint mt-4">Data as of October 2025. Source: Uganda Investment Authority.</p>
        </div>
      </section>
    </div>
  );
}
