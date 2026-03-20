import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'downloadableResource',
  title: 'Downloadable Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Business Registration Forms', value: 'business_registration' },
          { title: 'Tax Registration', value: 'tax_registration' },
          { title: 'Investment Licenses', value: 'investment_licenses' },
          { title: 'Guides & Resources', value: 'guides_resources' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload the downloadable file (PDF, DOCX, XLSX, ZIP, etc.)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fileType',
      title: 'File Type Label',
      type: 'string',
      description: 'Display label for file type (e.g. PDF, DOCX, XLSX, ZIP)',
      options: {
        list: [
          { title: 'PDF', value: 'PDF' },
          { title: 'DOCX', value: 'DOCX' },
          { title: 'XLSX', value: 'XLSX' },
          { title: 'ZIP', value: 'ZIP' },
          { title: 'CSV', value: 'CSV' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first within the category',
      initialValue: 0,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      fileType: 'fileType',
    },
    prepare({ title, category, fileType }) {
      const categoryLabels: Record<string, string> = {
        business_registration: 'Business Registration',
        tax_registration: 'Tax Registration',
        investment_licenses: 'Investment Licenses',
        guides_resources: 'Guides & Resources',
      };
      return {
        title,
        subtitle: `${categoryLabels[category] || category} · ${fileType || ''}`,
      };
    },
  },
  orderings: [
    {
      title: 'Category, then Sort Order',
      name: 'categorySort',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'sortOrder', direction: 'asc' },
      ],
    },
  ],
});
