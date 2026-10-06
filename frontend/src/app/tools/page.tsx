import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Business tools',
  description: 'Calculators and tools for investors and businesses in Uganda: ROI calculator, tax calculator, invoice generator and document checklist.',
  path: '/tools/',
});

const linkClass =
  'font-semibold text-black underline decoration-2 underline-offset-4 hover:text-red-600 hover:decoration-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm';

const TOOLS = [
  {
    title: 'Tax Calculator',
    description: 'Estimate your business tax obligations before you file your returns. Enter your income and deductions to see the taxes that apply under Uganda\'s rules. The results help you plan cash flow and compare the cost of different business structures. Treat the output as an estimate and confirm the final figures with URA or a tax adviser.',
    href: '/tools/tax-calculator',
  },
  {
    title: 'ROI Calculator',
    description: 'Estimate the return on investment for a business opportunity before you commit capital. Enter your investment, revenue and operating cost assumptions to see the projected return. Comparing scenarios shows how sensitive the result is to changes in prices or volumes. The calculator is a planning aid, so use it alongside professional advice.',
    href: '/tools/roi-calculator',
  },
  {
    title: 'Invoice Generator',
    description: 'Create professional invoices for your sales and services in a few minutes. Enter your business details, the client and each line item, and the totals are calculated for you. Invoices can be printed or saved for your records. Keep a copy of every invoice to support your tax filings.',
    href: '/tools/invoice-generator',
  },
  {
    title: 'Document Checklist',
    description: 'Work through a checklist of the documents needed for business registration and licensing. Each item shows what is required, so you can gather everything before you apply. Checking the list early reduces the risk of returned or delayed applications. Tick off items as you go, and keep certified copies where an agency asks for them.',
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
          Use these tools to organize early planning for an investment or business in Uganda. Estimate a possible return, prepare a document checklist, or create a working invoice with the available calculators and utilities. Each tool is designed to make common planning tasks easier to review and discuss. Results depend on the information you enter and are estimates, not official assessments or agency approvals. Contact the relevant institution when you need a confirmed requirement, fee or decision.
        </p>
      </section>

      {/* Tool list */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Available tools">
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {TOOLS.map((tool) => (
            <li key={tool.title} className="grid gap-3 py-7 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
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
        <div className=" pt-8">
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
