import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Business tools',
  description: 'Calculators and tools for investors and businesses in Uganda: ROI calculator, tax calculator, invoice generator and document checklist.',
  path: '/tools/',
});

const linkClass =
  'font-semibold text-black underline decoration-yellow-400 decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const TOOLS = [
  {
    title: 'Tax Calculator',
    description: 'Calculate your business tax obligations with our comprehensive tax calculator.',
    href: '/tools/tax-calculator',
  },
  {
    title: 'ROI Calculator',
    description: 'Calculate return on investment for various business opportunities.',
    href: '/tools/roi-calculator',
  },
  {
    title: 'Invoice Generator',
    description: 'Generate professional invoices for your business transactions.',
    href: '/tools/invoice-generator',
  },
  {
    title: 'Document Checklist',
    description: 'Comprehensive checklist for business registration and licensing documents.',
    href: '/tools/document-checklist',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Breadcrumb band */}
      <div className="border-b border-neutral-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-red-600 hover:underline underline-offset-4">Home</Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400">&rsaquo;</li>
            <li className="font-semibold text-black" aria-current="page">Business tools</li>
          </ol>
        </nav>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Business tools</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Investment tools</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700 sm:text-lg">
          Comprehensive tools and calculators to support your business and investment decisions in Uganda.
          Make informed choices with our professional-grade utilities.
        </p>
      </section>

      {/* Tool list */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Available tools">
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {TOOLS.map((tool, index) => (
            <li key={tool.title} className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-8">
              <span className="text-3xl font-bold text-yellow-500" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-lg font-bold sm:text-xl">{tool.title}</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-700">{tool.description}</p>
              </div>
              <Link href={tool.href as never} className={`${linkClass} text-sm`}>
                Use tool<span className="sr-only"> {tool.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Help */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="tools-help-heading">
        <div className="border-t-4 border-yellow-400 pt-8">
          <h2 id="tools-help-heading" className="text-2xl font-bold">Need help choosing the right tool?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-700">
            Our investment advisors can help you select the best tools for your specific business needs
            and guide you through the calculation process.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-bold text-yellow-400 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Contact support
            </Link>
            <Link
              href="/business/registration"
              className="inline-flex items-center justify-center rounded-md border-2 border-black px-6 py-3 text-sm font-bold text-black hover:bg-black hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Start registration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
