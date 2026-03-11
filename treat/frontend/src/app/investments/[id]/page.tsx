import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Clock, DollarSign, AlertCircle, Phone, Mail, Globe, MapPin, Users, FileText, Download } from 'lucide-react';
import opportunitiesData from '@/data/investment-opportunities.json';
import InvestmentDetailClient from './InvestmentDetailClient';

export async function generateStaticParams() {
  return opportunitiesData.map((opportunity) => ({
    id: opportunity.id.toString(),
  }));
}

const getOpportunityData = (id: string) => {
  return opportunitiesData.find(opp => opp.id === parseInt(id));
};

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = getOpportunityData(id);

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Investment Opportunity Not Found</h1>
          <p className="text-gray-600 mb-6">The investment opportunity you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/investments"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1507679799977-c9183c431955?q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay for readability */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/investments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Investment Opportunities
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 lg:mb-8">
          {/* Uganda Flag Stripe */}
          <div className="h-2 flex">
            <div className="flex-1 bg-black"></div>
            <div className="flex-1 bg-yellow-400"></div>
            <div className="flex-1 bg-red-600"></div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-300 overflow-hidden">
                <div className="w-16 h-16 relative">
                  <Image 
                    src={opportunity.logoPath} 
                    alt={`${opportunity.agency} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{opportunity.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{opportunity.category}</span>
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 font-medium">
                        {opportunity.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {opportunity.description}
                </p>
                
                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-700" />
                      <span className="text-sm text-yellow-700">Investment Range</span>
                    </div>
                    <p className="font-bold text-neutral-800">{opportunity.investmentRange}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-yellow-700" />
                      <span className="text-sm text-yellow-700">Expected ROI</span>
                    </div>
                    <p className="font-bold text-neutral-800">{opportunity.roi}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-700" />
                      <span className="text-sm text-blue-700">Timeline</span>
                    </div>
                    <p className="font-bold text-blue-800">{opportunity.timeline}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-700" />
                      <span className="text-sm text-purple-700">Market Size</span>
                    </div>
                    <p className="font-bold text-purple-800 text-sm">{opportunity.marketSize}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Detailed Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Investment Overview</h2>
              <div className="prose prose-gray max-w-none">
                {opportunity.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Key Investment Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Market Growth Rate</label>
                    <p className="text-lg font-semibold text-gray-900">{opportunity.keyMetrics.marketGrowth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Export Value</label>
                    <p className="text-lg font-semibold text-gray-900">{opportunity.keyMetrics.exportValue}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employment Potential</label>
                    <p className="text-lg font-semibold text-gray-900">{opportunity.keyMetrics.employmentPotential}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payback Period</label>
                    <p className="text-lg font-semibold text-gray-900">{opportunity.keyMetrics.paybackPeriod}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Incentives */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Government Incentives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunity.incentives.map((incentive, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-neutral-800 font-medium">{incentive}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Licenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Required Licenses & Permits</h2>
              <div className="space-y-3">
                {opportunity.requiredLicenses.map((license, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">{license}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Assessment</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Key Risk</p>
                    <p className="text-sm text-red-700">{opportunity.keyRisks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">{opportunity.agency}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{opportunity.contact.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${opportunity.contact.phone}`} className="text-blue-600 hover:text-blue-700">
                        {opportunity.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${opportunity.contact.email}`} className="text-blue-600 hover:text-blue-700">
                        {opportunity.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a 
                        href={opportunity.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client-side interactive components */}
            <InvestmentDetailClient opportunity={opportunity} />
            
            {/* Documents */}
            {opportunity.documents && opportunity.documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Documents & Resources</h3>
              <div className="space-y-3">
                {(opportunity.documents as Array<{name: string; type: string; size: string; url: string}>).map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <Link
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title={`Download ${doc.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}