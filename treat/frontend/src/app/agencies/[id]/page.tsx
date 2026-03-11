import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ugandaAgencies, getAgencyById } from '@/data/agencies';
import ServiceRequestForm from './ServiceRequestForm';
import {
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AgencyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ugandaAgencies.map((agency) => ({
    id: agency.id,
  }));
}

export default async function AgencyDetailPage({ params }: AgencyPageProps) {
  const { id } = await params;
  const agency = getAgencyById(id);

  if (!agency) {
    notFound();
  }

  const mockOfficers = [
    {
      name: 'Sarah Nakato',
      title: 'Investment Facilitation Officer',
      email: `s.nakato@${id}.go.ug`,
      phone: '+256 414 123 456'
    },
    {
      name: 'David Okello',
      title: 'Senior Licensing Officer',
      email: `d.okello@${id}.go.ug`,
      phone: '+256 414 123 457'
    },
    {
      name: 'Grace Namukasa',
      title: 'Client Services Manager',
      email: `g.namukasa@${id}.go.ug`,
      phone: '+256 414 123 458'
    },
    {
      name: 'James Mugisha',
      title: 'Technical Advisor',
      email: `j.mugisha@${id}.go.ug`,
      phone: '+256 414 123 459'
    }
  ];

  const slaByService: Record<string, string> = {
    'default': '5-7 business days',
    'license': '10-14 business days',
    'permit': '7-10 business days',
    'registration': '3-5 business days',
    'application': '5-7 business days',
    'certificate': '7-10 business days',
    'approval': '10-15 business days'
  };

  const getSlaForService = (service: string): string => {
    const lowerService = service.toLowerCase();
    for (const [key, value] of Object.entries(slaByService)) {
      if (lowerService.includes(key)) {
        return value;
      }
    }
    return slaByService.default ?? '5-7 business days';
  };

  return (
    <div className="min-h-screen bg-black py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/agencies/"
          className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Agencies
        </Link>

        <div className="bg-neutral-900 rounded-xl shadow-lg overflow-hidden border border-neutral-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-yellow-600 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {agency.logo && (
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agency.logo}
                    alt={`${agency.name} logo`}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{agency.name}</h1>
                  <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
                    {agency.acronym}
                  </span>
                </div>
                <p className="text-white/80 text-lg mb-3">{agency.description}</p>
                <span className="inline-block px-3 py-1 bg-white/10 text-white text-sm rounded-md capitalize border border-white/20">
                  {agency.category.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Services Offered */}
            <section className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircleIcon className="w-7 h-7 text-yellow-500" />
                Services Offered
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {agency.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-yellow-600 hover:shadow-lg hover:shadow-yellow-500/5 transition-all"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">{service}</p>
                      <p className="text-sm text-red-400 mt-1">
                        SLA: {getSlaForService(service)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Email</p>
                    <a
                      href={`mailto:${agency.contact.email}`}
                      className="text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      {agency.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Phone</p>
                    <a
                      href={`tel:${agency.contact.phone}`}
                      className="text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      {agency.contact.phone}
                    </a>
                  </div>
                </div>

                {agency.contact.website && (
                  <div className="flex items-start gap-3">
                    <GlobeAltIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Website</p>
                      <a
                        href={agency.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 font-medium"
                      >
                        {agency.contact.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Address</p>
                    <p className="text-neutral-300">{agency.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Operating Hours</p>
                    <p className="text-neutral-300">{agency.operatingHours}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Officer Directory */}
            <section className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-7 h-7 text-red-500" />
                Officer Directory
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {mockOfficers.map((officer, index) => (
                  <div
                    key={index}
                    className="p-5 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-red-600 hover:shadow-lg hover:shadow-red-500/5 transition-all"
                  >
                    <h3 className="font-semibold text-white mb-1">{officer.name}</h3>
                    <p className="text-sm text-yellow-500 mb-3">{officer.title}</p>
                    <div className="space-y-1">
                      <a
                        href={`mailto:${officer.email}`}
                        className="text-sm text-neutral-400 hover:text-yellow-400 flex items-center gap-2"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        {officer.email}
                      </a>
                      <a
                        href={`tel:${officer.phone}`}
                        className="text-sm text-neutral-400 hover:text-yellow-400 flex items-center gap-2"
                      >
                        <PhoneIcon className="w-4 h-4" />
                        {officer.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Service Request Form */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Request a Service</h2>
              <ServiceRequestForm agencyName={agency.name} services={agency.services} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
