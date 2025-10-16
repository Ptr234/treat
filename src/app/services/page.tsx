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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="bg-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-yellow-400">Government</span> Services
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto"
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
                <Button variant="primary" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                  Start Business Registration
                </Button>
              </Link>
              <Link href="/agencies">
                <Button variant="outline" size="lg" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8">
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
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Essential Business Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{category.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.services.map((service, serviceIndex) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + categoryIndex * 0.2 + serviceIndex * 0.1 }}
                  >
                    <Link href={service.href} className="group block">
                      <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 group-hover:scale-105 h-full relative">
                        {/* Arrow Icon */}
                        <div className="absolute top-4 right-4 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRightIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        
                        {/* Service Icon */}
                        <div className="w-12 h-12 border-2 border-yellow-400 rounded-lg flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-yellow-600" />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {service.title}
                        </h3>
                        
                        {/* Agency Tag */}
                        <div className="inline-block bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-sm font-medium mb-3">
                          {service.agency}
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {service.description}
                        </p>
                        
                        {/* Key Data */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">{service.timeline}</span>
                          </div>
                          <div className="flex items-center text-gray-900 font-semibold">
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
        className="bg-neutral-100"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need Assistance?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help guide you through every step of the process.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Get immediate assistance from our support team</p>
              <a href="tel:+256414301000">
                <Button variant="outline" size="md" className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black">
                  +256 414 301 000
                </Button>
              </a>
            </motion.div>
            
            <motion.div 
              className="text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 mb-4">Download required forms and guidelines</p>
              <Link href="/downloads">
                <Button variant="outline" size="md" className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black">
                  View Downloads
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Offices</h3>
              <p className="text-gray-600 mb-4">Find and visit our partner agency offices</p>
              <Link href="/agencies">
                <Button variant="outline" size="md" className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black">
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