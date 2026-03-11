import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'analyticsMetadata',
  title: 'Analytics Metadata',
  type: 'document',
  fields: [
    defineField({
      name: 'period',
      title: 'Period',
      type: 'string',
      description: 'e.g. 2025-Q1, 2024-FY',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'totalInquiries',
      title: 'Total Inquiries',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'resolvedInquiries',
      title: 'Resolved',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'avgResolutionHours',
      title: 'Avg Resolution Hours',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'slaComplianceRate',
      title: 'SLA Compliance %',
      type: 'number',
      validation: (r) => r.required().min(0).max(100),
    }),
    defineField({
      name: 'satisfactionAverage',
      title: 'Avg Satisfaction (1-5)',
      type: 'number',
      validation: (r) => r.required().min(1).max(5),
    }),
    defineField({
      name: 'inquiriesByRegion',
      title: 'By Region',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'region', type: 'string', title: 'Region' },
          { name: 'count', type: 'number', title: 'Count' },
        ],
      }],
    }),
    defineField({
      name: 'inquiriesBySector',
      title: 'By Sector',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'sector', type: 'string', title: 'Sector' },
          { name: 'count', type: 'number', title: 'Count' },
        ],
      }],
    }),
    defineField({
      name: 'funnelData',
      title: 'Investment Funnel',
      type: 'object',
      fields: [
        { name: 'inquiries', type: 'number', title: 'Inquiries' },
        { name: 'facilitation', type: 'number', title: 'Facilitation' },
        { name: 'applications', type: 'number', title: 'Applications' },
        { name: 'licensing', type: 'number', title: 'Licensing' },
        { name: 'operational', type: 'number', title: 'Operational' },
      ],
    }),
  ],
  preview: { select: { title: 'period' } },
});
