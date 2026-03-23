import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'investorProfile',
  title: 'Investor Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'referenceNumber',
      title: 'Reference Number',
      type: 'string',
      description: 'Auto-generated investor reference (e.g. INV-2026-0001)',
      validation: (Rule) => Rule.required(),
    }),
    // Contact info
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'string',
    }),
    // Investment profile
    defineField({
      name: 'investorType',
      title: 'Investor Type',
      type: 'string',
      options: {
        list: [
          { title: 'Individual', value: 'individual' },
          { title: 'Institutional', value: 'institutional' },
          { title: 'Foreign', value: 'foreign' },
        ],
      },
    }),
    defineField({
      name: 'experience',
      title: 'Experience Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
      },
    }),
    defineField({
      name: 'investmentGoal',
      title: 'Investment Goal',
      type: 'string',
      options: {
        list: [
          { title: 'Growth', value: 'growth' },
          { title: 'Income', value: 'income' },
          { title: 'Diversification', value: 'diversification' },
          { title: 'Strategic', value: 'strategic' },
        ],
      },
    }),
    // Capacity
    defineField({
      name: 'investmentAmount',
      title: 'Investment Amount Range',
      type: 'string',
    }),
    defineField({
      name: 'timeHorizon',
      title: 'Time Horizon',
      type: 'string',
      options: {
        list: [
          { title: 'Short-term (1-3 years)', value: 'short-term' },
          { title: 'Medium-term (3-7 years)', value: 'medium-term' },
          { title: 'Long-term (7+ years)', value: 'long-term' },
        ],
      },
    }),
    defineField({
      name: 'riskTolerance',
      title: 'Risk Tolerance',
      type: 'string',
      options: {
        list: [
          { title: 'Conservative', value: 'conservative' },
          { title: 'Moderate', value: 'moderate' },
          { title: 'Aggressive', value: 'aggressive' },
        ],
      },
    }),
    // Sector interest
    defineField({
      name: 'primarySector',
      title: 'Primary Sector',
      type: 'string',
    }),
    defineField({
      name: 'secondarySectors',
      title: 'Secondary Sectors',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'specificInterests',
      title: 'Specific Interests',
      type: 'text',
    }),
    // Readiness
    defineField({
      name: 'capitalSource',
      title: 'Capital Source',
      type: 'string',
      options: {
        list: [
          { title: 'Personal Savings', value: 'savings' },
          { title: 'Bank Loan', value: 'loan' },
          { title: 'Partnership/Joint Venture', value: 'partnership' },
          { title: 'Grant/Government Funding', value: 'grant' },
        ],
      },
    }),
    defineField({
      name: 'timeframe',
      title: 'Investment Timeframe',
      type: 'string',
      options: {
        list: [
          { title: 'Immediate', value: 'immediate' },
          { title: 'Within 3 months', value: '3-months' },
          { title: 'Within 6 months', value: '6-months' },
          { title: 'Within 1 year', value: '1-year' },
        ],
      },
    }),
    defineField({
      name: 'supportNeeded',
      title: 'Support Needed',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Legal Support', value: 'legal' },
          { title: 'Financial Advisory', value: 'financial' },
          { title: 'Technical Assistance', value: 'technical' },
          { title: 'Marketing Support', value: 'marketing' },
        ],
      },
    }),
    // Status tracking
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
        ],
      },
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
    },
  },
});
