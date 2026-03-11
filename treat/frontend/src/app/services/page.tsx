'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  PhoneIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';

// Organized services by logical categories
const serviceCategories = {
  starting: {
    title: 'Starting Your Business',
    accent: 'yellow' as const,
    services: [
      {
        id: 'business-registration',
        title: 'Business Registration & Company Formation',
        description: 'Register your business legally with URSB including all required documentation.',
        icon: BuildingOfficeIcon,
        agency: 'URSB',
        timeline: '6 weeks',
        cost: 'From UGX 100,000',
        href: '/business/registration'
      },
      {
        id: 'tax-services',
        title: 'Tax Registration & Compliance',
        description: 'TIN registration and comprehensive tax compliance support through URA.',
        icon: DocumentTextIcon,
        agency: 'URA',
        timeline: '2-3 days',
        cost: 'From UGX 35,000',
        href: '/agencies'
      },
      {
        id: 'investment-licensing',
        title: 'Investment Licensing',
        description: 'Investment promotion, licensing, and facilitation services through UIA.',
        icon: LightBulbIcon,
        agency: 'UIA',
        timeline: '7-14 days',
        cost: 'From USD 100',
        href: '/investments'
      },
      {
        id: 'trading-license',
        title: 'Trading License & Local Permits',
        description: 'Trading licenses from local authorities required for all business operations.',
        icon: ShieldCheckIcon,
        agency: 'KCCA / Local Councils',
        timeline: '7-14 days',
        cost: 'UGX 50,000 - 500,000',
        href: '/agencies'
      }
    ]
  },
  operations: {
    title: 'Ongoing Operations & Compliance',
    accent: 'red' as const,
    services: [
      {
        id: 'compliance-monitoring',
        title: 'Compliance & Monitoring',
        description: 'Ongoing compliance support and regulatory monitoring services.',
        icon: ChartBarIcon,
        agency: 'Various',
        timeline: 'Ongoing',
        cost: 'Consultation based',
        href: '/support'
      },
      {
        id: 'nssf-registration',
        title: 'NSSF Registration & Social Security',
        description: 'Mandatory registration with National Social Security Fund for businesses with employees.',
        icon: CurrencyDollarIcon,
        agency: 'NSSF',
        timeline: '3-5 days',
        cost: 'Free registration',
        href: '/agencies'
      },
      {
        id: 'environmental-clearance',
        title: 'Environmental Impact Assessment',
        description: 'Environmental clearance certificates for projects affecting the environment.',
        icon: ShieldCheckIcon,
        agency: 'NEMA',
        timeline: '90-120 days',
        cost: 'USD 500 - 5,000',
        href: '/agencies'
      }
    ]
  },
  foreign: {
    title: 'Services for Foreign Nationals',
    accent: 'white' as const,
    services: [
      {
        id: 'work-permits',
        title: 'Work Permits & Immigration Services',
        description: 'Work permits, residence permits, and immigration services for foreign investors.',
        icon: DocumentTextIcon,
        agency: 'DCIC',
        timeline: '14-30 days',
        cost: 'USD 1,000 - 2,000',
        href: '/agencies'
      }
    ]
  }
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <motion.div
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: 'url(/images/Tourism.webp)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-1 w-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full" />
              <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest">One Stop Centre</span>
              <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full" />
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl font-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-yellow-400">Government</span> Services
            </motion.h1>
            <motion.p
              className="text-xl text-neutral-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Complete step-by-step government services with actual timelines, fees, and procedures. Based on 2024 official government data.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/business/registration">
                <Button variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 shadow-lg shadow-yellow-500/20">
                  Start Business Registration
                </Button>
              </Link>
              <Link href="/agencies">
                <Button variant="outline" size="lg" className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 px-8">
                  Contact Agencies
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Services by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Essential Business Services
          </h2>
          <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
            Everything you need to establish and operate your business in Uganda, backed by government support.
          </p>
        </motion.div>

        {Object.entries(serviceCategories).map(([key, category], categoryIndex) => (
          <motion.div
            key={key}
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 + categoryIndex * 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-1.5 h-8 rounded-full ${
                category.accent === 'yellow' ? 'bg-yellow-500' :
                category.accent === 'red' ? 'bg-red-600' :
                'bg-white'
              }`} />
              <h2 className={`text-2xl font-bold ${
                category.accent === 'yellow' ? 'text-yellow-500' :
                category.accent === 'red' ? 'text-red-500' :
                'text-white'
              }`}>{category.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.services.map((service, serviceIndex) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + categoryIndex * 0.2 + serviceIndex * 0.1 }}
                  >
                    <Link href={service.href} className="group block h-full">
                      <div className={`rounded-xl p-6 border-2 transition-all duration-300 group-hover:scale-[1.03] h-full relative ${
                        category.accent === 'white'
                          ? 'bg-white text-black border-neutral-200 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10'
                          : 'bg-neutral-900 border-neutral-800 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10'
                      }`}>
                        {/* Arrow Icon */}
                        <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRightIcon className={`w-5 h-5 ${
                            category.accent === 'red' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                        </div>

                        {/* Service Icon */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                          category.accent === 'yellow' ? 'bg-yellow-500/15 border-2 border-yellow-500/30' :
                          category.accent === 'red' ? 'bg-red-500/15 border-2 border-red-500/30' :
                          'bg-black border-2 border-neutral-300'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            category.accent === 'yellow' ? 'text-yellow-500' :
                            category.accent === 'red' ? 'text-red-500' :
                            'text-yellow-600'
                          }`} />
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-bold mb-2 ${
                          category.accent === 'white' ? 'text-black' : 'text-white'
                        }`}>
                          {service.title}
                        </h3>

                        {/* Agency Tag */}
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                          category.accent === 'white'
                            ? 'bg-black text-white'
                            : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30'
                        }`}>
                          {service.agency}
                        </div>

                        {/* Description */}
                        <p className={`mb-6 leading-relaxed text-sm ${
                          category.accent === 'white' ? 'text-neutral-600' : 'text-neutral-400'
                        }`}>
                          {service.description}
                        </p>

                        {/* Key Data */}
                        <div className={`flex items-center justify-between pt-4 border-t ${
                          category.accent === 'white' ? 'border-neutral-200' : 'border-neutral-800'
                        }`}>
                          <div className={`flex items-center ${
                            category.accent === 'white' ? 'text-neutral-500' : 'text-neutral-500'
                          }`}>
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">{service.timeline}</span>
                          </div>
                          <div className="flex items-center text-yellow-500 font-bold">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">{service.cost}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Need Assistance Section */}
      <motion.div
        className="bg-neutral-900 border-t border-neutral-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Assistance?
            </h2>
            <p className="text-lg text-neutral-400">
              Our team is here to help guide you through every step of the process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center p-8 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-yellow-500/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-yellow-500/15 border-2 border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone Support</h3>
              <p className="text-neutral-400 mb-4">Get immediate assistance from our support team</p>
              <a href="tel:+256414301000">
                <Button variant="outline" size="md" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold">
                  +256 414 301 000
                </Button>
              </a>
            </motion.div>

            <motion.div
              className="text-center p-8 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-red-500/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-red-500/15 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Documentation</h3>
              <p className="text-neutral-400 mb-4">Download required forms and guidelines</p>
              <Link href="/downloads">
                <Button variant="outline" size="md" className="border-red-500 text-red-500 hover:bg-red-600 hover:text-white font-bold">
                  View Downloads
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="text-center p-8 bg-white rounded-xl border-2 border-neutral-200 hover:border-yellow-500 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Visit Offices</h3>
              <p className="text-neutral-600 mb-4">Find and visit our partner agency offices</p>
              <Link href="/agencies">
                <Button variant="outline" size="md" className="border-black text-black hover:bg-black hover:text-yellow-500 font-bold">
                  Find Locations
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
