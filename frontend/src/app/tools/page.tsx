import PageHeader from '@/components/ui/PageHeader';
import { CalculatorIcon, ChartBarIcon, ClipboardDocumentCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Business tools',
  description: 'Calculators and tools for investors and businesses in Uganda: ROI calculator, tax calculator, invoice generator and document checklist.',
  path: '/tools/',
});

const TOOLS = [
  {
    icon: CalculatorIcon,
    title: 'Tax calculator',
    description: 'Estimate your business tax obligations before you file your returns. Enter your income and deductions to see the taxes that apply under Uganda\'s rules. The results help you plan cash flow and compare the cost of different business structures. Treat the output as an estimate and confirm the final figures with URA or a tax adviser.',
    href: '/tools/tax-calculator',
  },
  {
    icon: ChartBarIcon,
    title: 'ROI calculator',
    description: 'Estimate the return on investment for a business opportunity before you commit capital. Enter your investment, revenue and operating cost assumptions to see the projected return. Comparing scenarios shows how sensitive the result is to changes in prices or volumes. The calculator is a planning aid, so use it alongside professional advice.',
    href: '/tools/roi-calculator',
  },
  {
    icon: DocumentTextIcon,
    title: 'Invoice generator',
    description: 'Create professional invoices for your sales and services in a few minutes. Enter your business details, the client and each line item, and the totals are calculated for you. Invoices can be printed or saved for your records. Keep a copy of every invoice to support your tax filings.',
    href: '/tools/invoice-generator',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Document checklist',
    description: 'Work through a checklist of the documents needed for business registration and licensing. Each item shows what is required, so you can gather everything before you apply. Checking the list early reduces the risk of returned or delayed applications. Tick off items as you go, and keep certified copies where an agency asks for them.',
    href: '/tools/document-checklist',
  },
];

export default function ToolsPage() {
  return (
    <div className="bg-white">
      <PageHeader
        crumbs={[{ label: 'Business tools' }]}
        caption="Guidance"
        title="Business tools"
        lead="Estimate a return, check your tax, prepare a document checklist or create an invoice. Results are estimates based on what you enter — not official assessments or agency approvals."
      />

      <section className="gov-section" aria-labelledby="tools-heading">
        <div className="gov-container">
          <h2 id="tools-heading" className="sr-only">Available tools</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <article key={tool.title} className="gov-card gov-card--link">
                <span className="grid h-12 w-12 place-items-center bg-black text-[#ffd700]">
                  <tool.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="gov-card__title mt-5 text-[22px]">
                  <Link href={tool.href as never}>{tool.title}</Link>
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#3b3934]">{tool.description}</p>
                <span className="gov-arrow-link mt-5 text-[15px]" aria-hidden="true">Use this tool</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gov-section gov-section--paper" aria-labelledby="tools-help-heading">
        <div className="gov-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <h2 id="tools-help-heading" className="gov-title-l">Need help choosing a tool?</h2>
            <p className="gov-body mt-3 text-[17px]">
              Investment advisers can help you choose the right tool for your business and talk you through the results.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/support" className="gov-btn">Contact support</Link>
            <Link href="/business/registration" className="gov-btn gov-btn--secondary">Start registration</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
