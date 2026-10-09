import PageHeader from '@/components/ui/PageHeader';
import { LockClosedIcon, ShieldCheckIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import InvestmentOnboardingWizard from '../../../components/interactive/InvestmentOnboardingWizard';

export const metadata: Metadata = buildMetadata({
  title: 'Investment onboarding',
  description: 'Complete your investment profile to get matched with opportunities in Uganda and connect with the agencies that can guide your application.',
  path: '/investments/onboarding/',
});

const BENEFITS = [
  {
    title: 'Personalized matching',
    body: 'Get matched with investments that align with your goals, risk tolerance, and capacity.',
  },
  {
    title: 'Fast-track process',
    body: 'Streamlined application process with direct connection to relevant government agencies.',
  },
  {
    title: 'Expert support',
    body: 'Access to investment advisors and sector specialists throughout your journey.',
  },
];

const TRUST = [
  {
    icon: LockClosedIcon,
    title: 'Encrypted data',
    body: 'All information is encrypted and stored securely.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Government verified',
    body: 'Official OneStop Centre Uganda platform.',
  },
  {
    icon: EyeSlashIcon,
    title: 'Confidential process',
    body: 'Your investment details remain confidential.',
  },
];

export default function InvestmentOnboardingPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Investments', href: '/investments' }, { label: 'Investor onboarding' }]}
        caption="Invest"
        title="Investor onboarding"
        lead="Complete your investment profile to get matched with opportunities and connected to the agencies that can guide your application."
        aside={
          <ul className="border-t-4 border-black bg-white p-5">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="border-b border-[#dcd8cf] py-3 last:border-0">
                <p className="font-bold">{benefit.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#3b3934]">{benefit.body}</p>
              </li>
            ))}
          </ul>
        }
      />

      <section className="gov-container py-12 lg:py-16" aria-label="Onboarding form">
        <InvestmentOnboardingWizard />
      </section>

      <section className="gov-section gov-section--paper" aria-labelledby="trust-heading">
        <div className="gov-container">
          <h2 id="trust-heading" className="gov-title-l">How we handle your information</h2>
          <p className="gov-body mt-3 max-w-2xl">Your investment details are used only to match you with opportunities and route your application.</p>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {TRUST.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center bg-black text-[#ffd700]">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{item.title}</span>
                  <span className="mt-1 block text-[15px] text-[#3b3934]">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
