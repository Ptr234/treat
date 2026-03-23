import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'licenseProject',
  title: 'Licensed Project',
  type: 'document',
  fields: [
    defineField({ name: 'companyName', title: 'Company Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'referenceNumber', title: 'Reference Number', type: 'string' }),
    defineField({
      name: 'sector',
      title: 'Sector',
      type: 'string',
      options: { list: ['Agriculture', 'Manufacturing', 'Services', 'Tourism', 'ICT', 'Energy', 'Mining', 'Real Estate', 'Other'] },
    }),
    defineField({ name: 'subSector', title: 'Sub-Sector', type: 'string' }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: { list: ['Central', 'Eastern', 'Northern', 'Western', 'Kampala'] },
    }),
    defineField({ name: 'district', title: 'District', type: 'string' }),
    defineField({ name: 'location', title: 'Location Name', type: 'string' }),
    defineField({
      name: 'coordinates',
      title: 'GPS Coordinates',
      type: 'object',
      fields: [
        { name: 'lat', title: 'Latitude', type: 'number' },
        { name: 'lng', title: 'Longitude', type: 'number' },
      ],
    }),
    defineField({ name: 'investmentValueUSD', title: 'Investment Value (USD)', type: 'number' }),
    defineField({
      name: 'investmentValueRange',
      title: 'Investment Range',
      type: 'string',
      options: { list: ['<$100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '$5M-$10M', '$10M-$50M', '>$50M'] },
    }),
    defineField({ name: 'employmentLocal', title: 'Local Jobs', type: 'number' }),
    defineField({ name: 'employmentForeign', title: 'Foreign Jobs', type: 'number' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['Licensed', 'Operational', 'Under Construction', 'Suspended', 'Cancelled'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'licenseDate', title: 'License Date', type: 'date' }),
    defineField({ name: 'fiscalYear', title: 'Fiscal Year', type: 'string' }),
    defineField({ name: 'nationality', title: 'Investor Nationality', type: 'string' }),
    defineField({ name: 'isIndustrialPark', title: 'In Industrial Park', type: 'boolean', initialValue: false }),
    defineField({ name: 'industrialParkName', title: 'Industrial Park Name', type: 'string' }),
  ],
  preview: { select: { title: 'companyName', subtitle: 'sector' } },
});
