import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'agency',
  title: 'Agency',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Agency Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'code',
      title: 'Agency Code',
      type: 'string',
      options: { list: ['UIA', 'URSB', 'URA', 'DCIC', 'NEMA', 'KCCA', 'LANDS', 'UNBS', 'ERA', 'NSSF', 'CMA', 'UMEME', 'NWSC', 'UTB', 'UFZA', 'FUE', 'GIANTS_CLUB', 'MLHUD'] },
    }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'contactEmail', title: 'Contact Email', type: 'email' }),
    defineField({ name: 'contactPhone', title: 'Contact Phone', type: 'string' }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'services', title: 'Services Offered', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'slaResponseHours', title: 'SLA Response Hours', type: 'number' }),
  ],
  preview: { select: { title: 'name', subtitle: 'code' } },
});
